from datetime import datetime, timedelta
from typing import Optional, List, Literal
from uuid import UUID
from sqlalchemy.orm import Session, aliased
from sqlalchemy import func as sql_func, text, select, case, and_, or_, literal_column, cast, Text, exists
from .models.farmers import FarmerModel
from .models.farm_plots import FarmPlotModel
from .models.farms import FarmModel
from .models.crops import CropModel
from .models.farm_crops import FarmCropModel
from .models.plot_sections import PlotSectionModel
from .models.plot_crops import PlotCropModel
from modules.deforesting.src.models.deforestation_requests import DeforestationRequestModel, DeforestationRequestStatusEnum
from modules.data_collector.src.models.core_registers import CoreRegisterModel
from modules.data_collector.src.models.forms import FormModel
from modules.data_collector.src.schemas import CoreRegisterResponse, PaginatedCoreRegisterResponse, FormInfo
from modules.locations.src.models.countries import CountryModel
from modules.locations.src.models.departments import DepartmentModel
from modules.locations.src.models.provinces import ProvinceModel
from modules.locations.src.models.districts import DistrictModel
from .schemas import (
    FarmerCreate, FarmerUpdate, FarmerResponse, PaginatedResponse,
    PlotResponse, PlotUpdate, CropResponse, PaginatedCropResponse,
    PlotSectionCreate, PlotSectionUpdate, PlotSectionResponse,
    FarmResponse, PaginatedFarmResponse,
    CountryInfo, DepartmentInfo, ProvinceInfo, DistrictInfo,
    FarmGeometryUpload, FarmGeometryResponse, FarmUpdate,
    DeforestationRequestInfo
)
from modules.deforesting.src.resources import (
    save_or_update_deforestation_request,
    check_and_update_deforestation_status
)
from .resources import (
    geometry_to_geojson
)

class Funcionalities:
    def __init__(self, container, database_key: str = "core_db"):
        self.container = container
        self.database_key = database_key
        
    def _get_db(self) -> Session:
        """Obtiene la sesion de base de datos desde el container"""
        return self.container.get(self.database_key, "databases")
        
    
    def create_farmer(self, farmer_data: FarmerCreate) -> FarmerResponse:
        """Crea un nuevo farmer"""
        db = self._get_db()
        try:
            farmer = FarmerModel(**farmer_data.model_dump(exclude_none=True))
            db.add(farmer)
            db.commit()
            db.refresh(farmer)
            return FarmerResponse.model_validate(farmer)
        except Exception as e:
            db.rollback()
            raise e
    
    def get_farmers_paginated(
        self, 
        page: int = 1, 
        per_page: int = 10,
        sort_by: Optional[str] = None,
        order: Optional[str] = "asc",
        search: str = "",
        status: Optional[Literal["activo", "inactivo"]] = None
    ) -> PaginatedResponse:
        """
        Obtiene farmers paginados usando SQLAlchemy ORM.
        
        Ventajas del ORM:
        - Type safety: errores detectados en desarrollo
        - Sin SQL injection
        - Codigo mas legible y mantenible
        """
        db = self._get_db()
        
        # Calcular fecha li­mite para considerar activo (15 di­as atras)
        fifteen_days_ago = datetime.utcnow() - timedelta(days=15)
        
        # ============================================================================
        # CTE 1: farmer_visits - Calcula la iºltima fecha de visita para cada farmer
        # ============================================================================
        
        # Subquery para verificar si el farmer esta en los detalles del registro
        # detail es un ARRAY(JSONB) con estructura: [{"type_value": "entity", "value": {"id": "farmer-uuid", "display_name": "..."}}]
        # Usamos unnest para iterar sobre el array, cada elemento ya es JSONB
        detail_elem = sql_func.unnest(CoreRegisterModel.detail).alias("detail_elem")
        farmer_in_detail = (
            exists(
                select(literal_column("1"))
                .select_from(detail_elem)
                .where(
                    and_(
                        literal_column("detail_elem->>'type_value'") == 'entity',
                        literal_column("detail_elem->'value'->>'id'") == cast(FarmerModel.id, Text)
                    )
                )
            )
        )
        
        farmer_visits_cte = (
            select(
                FarmerModel.id.label('farmer_id'),
                sql_func.max(CoreRegisterModel.created_at).label('last_visit_date')
            )
            .select_from(FarmerModel)
            .outerjoin(
                CoreRegisterModel,
                and_(
                    CoreRegisterModel.disabled_at.is_(None),
                    farmer_in_detail
                )
            )
            .where(FarmerModel.disabled_at.is_(None))
            .group_by(FarmerModel.id)
        ).cte('farmer_visits')
        
        # ============================================================================
        # CTE 2: farmer_status - Combina farmers con sus relaciones y calcula status
        # ============================================================================
        
        # Aliases para las tablas relacionadas
        country = aliased(CountryModel, name='co')
        department = aliased(DepartmentModel, name='d')
        province = aliased(ProvinceModel, name='p')
        district = aliased(DistrictModel, name='di')
        
        # CASE para calcular el status
        status_case = case(
            (farmer_visits_cte.c.last_visit_date.is_(None), 'inactivo'),
            (farmer_visits_cte.c.last_visit_date >= fifteen_days_ago, 'activo'),
            else_='inactivo'
        ).label('status')
        
        farmer_status_cte = (
            select(
                FarmerModel.id,
                FarmerModel.code,
                FarmerModel.first_name,
                FarmerModel.last_name,
                FarmerModel.dni,
                FarmerModel.wsp_number,
                FarmerModel.sms_number,
                FarmerModel.call_number,
                FarmerModel.email,
                FarmerModel.address,
                FarmerModel.country_id,
                FarmerModel.department_id,
                FarmerModel.province_id,
                FarmerModel.district_id,
                FarmerModel.created_at,
                FarmerModel.updated_at,
                FarmerModel.disabled_at,
                country.id.label('country_id_val'),
                country.name.label('country_name'),
                department.id.label('department_id_val'),
                department.name.label('department_name'),
                province.id.label('province_id_val'),
                province.name.label('province_name'),
                district.id.label('district_id_val'),
                district.name.label('district_name'),
                farmer_visits_cte.c.last_visit_date,
                status_case
            )
            .select_from(FarmerModel)
            .outerjoin(farmer_visits_cte, FarmerModel.id == farmer_visits_cte.c.farmer_id)
            .outerjoin(country, and_(FarmerModel.country_id == country.id, country.disabled_at.is_(None)))
            .outerjoin(department, and_(FarmerModel.department_id == department.id, department.disabled_at.is_(None)))
            .outerjoin(province, and_(FarmerModel.province_id == province.id, province.disabled_at.is_(None)))
            .outerjoin(district, and_(FarmerModel.district_id == district.id, district.disabled_at.is_(None)))
            .where(FarmerModel.disabled_at.is_(None))
        ).cte('farmer_status')
        
        # ============================================================================
        # Construir filtros dinamicos
        # ============================================================================
        
        filters = []
        
        # Aplicar biºsqueda
        if search:
            search_pattern = f"%{search}%"
            filters.append(
                or_(
                    farmer_status_cte.c.first_name.ilike(search_pattern),
                    farmer_status_cte.c.last_name.ilike(search_pattern),
                    farmer_status_cte.c.dni.ilike(search_pattern),
                    and_(farmer_status_cte.c.code.isnot(None), farmer_status_cte.c.code.ilike(search_pattern)),
                    and_(farmer_status_cte.c.email.isnot(None), farmer_status_cte.c.email.ilike(search_pattern))
                )
            )
        
        # Aplicar filtro de estado
        if status and status.lower() in ['activo', 'inactivo']:
            status_value =  status.lower()
            filters.append(farmer_status_cte.c.status == status_value)
        
        # ============================================================================
        # Query para contar total
        # ============================================================================
        
        count_query = select(sql_func.count()).select_from(farmer_status_cte)
        if filters:
            count_query = count_query.where(and_(*filters))
        
        total = db.execute(count_query).scalar() or 0
        
        # ============================================================================
        # Construir ordenamiento
        # ============================================================================
        
        order_by_clauses = []
        if sort_by:
            order_dir = 'desc' if order and order.lower() == "desc" else 'asc'
            
            if sort_by == "last_visit_date":
                col = farmer_status_cte.c.last_visit_date
                order_by_clauses.append(col.desc().nullslast() if order_dir == 'desc' else col.asc().nullslast())
            elif sort_by == "status":
                col = farmer_status_cte.c.status
                order_by_clauses.append(col.desc() if order_dir == 'desc' else col.asc())
            elif sort_by in ["first_name", "last_name", "dni", "code", "email", "created_at", "updated_at"]:
                col = getattr(farmer_status_cte.c, sort_by)
                order_by_clauses.append(col.desc() if order_dir == 'desc' else col.asc())
            else:
                order_by_clauses.append(farmer_status_cte.c.created_at.desc())
        else:
            order_by_clauses.append(farmer_status_cte.c.created_at.desc())
        
        # ============================================================================
        # Calcular paginacion
        # ============================================================================
        
        offset = (page - 1) * per_page
        total_pages = (total + per_page - 1) // per_page if total > 0 else 0
        
        # ============================================================================
        # Query principal con paginacion
        # ============================================================================
        
        main_query = select(farmer_status_cte).select_from(farmer_status_cte)
        
        if filters:
            main_query = main_query.where(and_(*filters))
        
        if order_by_clauses:
            main_query = main_query.order_by(*order_by_clauses)
        
        main_query = main_query.limit(per_page).offset(offset)
        
        # Ejecutar query
        results = db.execute(main_query).fetchall()
        
        # Construir respuesta
        farmer_responses = []
        for row in results:
            # Construir objetos de informacion relacionada
            country_info = None
            if row.country_id_val:
                country_info = CountryInfo(
                    id=row.country_id_val,
                    name=row.country_name
                )
            
            department_info = None
            if row.department_id_val:
                department_info = DepartmentInfo(
                    id=row.department_id_val,
                    name=row.department_name
                )
            
            province_info = None
            if row.province_id_val:
                province_info = ProvinceInfo(
                    id=row.province_id_val,
                    name=row.province_name
                )
            
            district_info = None
            if row.district_id_val:
                district_info = DistrictInfo(
                    id=row.district_id_val,
                    name=row.district_name
                )
            
            farmer_dict = {
                'id': row.id,
                'code': row.code,
                'first_name': row.first_name,
                'last_name': row.last_name,
                'dni': row.dni,
                'wsp_number': row.wsp_number,
                'sms_number': row.sms_number,
                'call_number': row.call_number,
                'email': row.email,
                'address': row.address,
                'country_id': row.country_id,
                'department_id': row.department_id,
                'province_id': row.province_id,
                'district_id': row.district_id,
                'country': country_info,
                'department': department_info,
                'province': province_info,
                'district': district_info,
                'last_visit_date': row.last_visit_date,
                'status': row.status,
                'created_at': row.created_at,
                'updated_at': row.updated_at,
                'disabled_at': row.disabled_at
            }
            
            farmer_responses.append(FarmerResponse(**farmer_dict))
        
        return PaginatedResponse(
            items=farmer_responses,
            total=total,
            page=page,
            page_size=per_page,
            total_pages=total_pages
        )
    
    def get_farmer_by_id(self, farmer_id: UUID) -> Optional[FarmerResponse]:
        """Obtiene un farmer especi­fico por ID (solo si no esta deshabilitado) con informacion relacionada y iºltima visita"""
        db = self._get_db()
        from datetime import datetime, timedelta
        from sqlalchemy import text
        
        # Query con joins para obtener informacion relacionada
        result = db.query(
            FarmerModel,
            CountryModel,
            DepartmentModel,
            ProvinceModel,
            DistrictModel
        ).select_from(FarmerModel).outerjoin(
            CountryModel, 
            (FarmerModel.country_id == CountryModel.id) & (CountryModel.disabled_at.is_(None))
        ).outerjoin(
            DepartmentModel, 
            (FarmerModel.department_id == DepartmentModel.id) & (DepartmentModel.disabled_at.is_(None))
        ).outerjoin(
            ProvinceModel, 
            (FarmerModel.province_id == ProvinceModel.id) & (ProvinceModel.disabled_at.is_(None))
        ).outerjoin(
            DistrictModel, 
            (FarmerModel.district_id == DistrictModel.id) & (DistrictModel.disabled_at.is_(None))
        ).filter(
            FarmerModel.id == farmer_id,
            FarmerModel.disabled_at.is_(None)
        ).first()
        
        if not result:
            return None
        
        farmer, country, department, province, district = result
        
        # Buscar la iºltima visita del farmer en core_registers usando ORM
        last_visit_date = None
        try:
            detail_elem = sql_func.unnest(CoreRegisterModel.detail).alias("detail_elem")
            farmer_in_detail_subq = (
                exists(
                    select(literal_column("1"))
                    .select_from(detail_elem)
                    .where(
                        and_(
                            literal_column("detail_elem->>'type_value'") == 'entity',
                            literal_column("detail_elem->'value'->>'id'") == cast(farmer.id, Text)
                        )
                    )
                )
            )
            
            result_visit = db.query(
                sql_func.max(CoreRegisterModel.created_at)
            ).filter(
                CoreRegisterModel.disabled_at.is_(None),
                farmer_in_detail_subq
            ).scalar()
            
            if result_visit:
                last_visit_date = result_visit
        except Exception as e:
            print(f" Error al buscar iºltima visita del farmer {farmer.id}: {e}")
            last_visit_date = None
        
        # Calcular estado
        now = datetime.utcnow()
        fifteen_days_ago = now - timedelta(days=15)
        status = None
        if last_visit_date:
            status = "activo" if last_visit_date >= fifteen_days_ago else "inactivo"
        else:
            status = "inactivo"
        
        # Construir objetos de informacion relacionada
        country_info = None
        if country:
            country_info = CountryInfo(
                id=country.id,
                name=country.name
            )
        
        department_info = None
        if department:
            department_info = DepartmentInfo(
                id=department.id,
                name=department.name
            )
        
        province_info = None
        if province:
            province_info = ProvinceInfo(
                id=province.id,
                name=province.name
            )
        
        district_info = None
        if district:
            district_info = DistrictInfo(
                id=district.id,
                name=district.name
            )
        
        farmer_dict = {
            'id': farmer.id,
            'code': farmer.code,
            'first_name': farmer.first_name,
            'last_name': farmer.last_name,
            'dni': farmer.dni,
            'wsp_number': farmer.wsp_number,
            'sms_number': farmer.sms_number,
            'call_number': farmer.call_number,
            'email': farmer.email,
            'address': farmer.address,
            'country_id': farmer.country_id,
            'department_id': farmer.department_id,
            'province_id': farmer.province_id,
            'district_id': farmer.district_id,
            'country': country_info,
            'department': department_info,
            'province': province_info,
            'district': district_info,
            'last_visit_date': last_visit_date,
            'status': status,
            'created_at': farmer.created_at,
            'updated_at': farmer.updated_at,
            'disabled_at': farmer.disabled_at
        }
        
        return FarmerResponse(**farmer_dict)
    
    def update_farmer(self, farmer_id: UUID, farmer_data: FarmerUpdate) -> Optional[FarmerResponse]:
        """Actualiza un farmer existente"""
        db = self._get_db()
        try:
            farmer = db.query(FarmerModel).filter(
                FarmerModel.id == farmer_id,
                FarmerModel.disabled_at.is_(None)
            ).first()
            
            if not farmer:
                return None
            
            # Actualizar solo los campos proporcionados
            update_data = farmer_data.model_dump(exclude_none=True)
            for key, value in update_data.items():
                if value != getattr(farmer, key):
                    if value not in ['', ' ', None, "first_name", "last_name", "dni"]:
                        setattr(farmer, key, value)
            
            farmer.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(farmer)
            return FarmerResponse.model_validate(farmer)
        except Exception as e:
            db.rollback()
            raise e
    
    def delete_farmer(self, farmer_id: UUID) -> bool:
        """Elimina un farmer (deshabilitado logico)"""
        db = self._get_db()
        try:
            farmer = db.query(FarmerModel).filter(
                FarmerModel.id == farmer_id,
                FarmerModel.disabled_at.is_(None)
            ).first()
            
            if not farmer:
                return False
            
            farmer.disabled_at = datetime.utcnow()
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
    
    # Plot methods
    def get_plots_by_farmer(self, farmer_id: UUID) -> List[PlotResponse]:
        """Lista todas las parcelas de un agricultor"""
        db = self._get_db()
        plots = db.query(FarmPlotModel).join(
            FarmModel, FarmPlotModel.farm_id == FarmModel.id
        ).filter(
            FarmModel.farmer_id == farmer_id,
            FarmPlotModel.disabled_at.is_(None),
            FarmModel.disabled_at.is_(None)
        ).all()
        
        return [PlotResponse.model_validate(plot) for plot in plots]
    
    def get_plot_by_id(self, plot_id: UUID) -> Optional[PlotResponse]:
        """Obtiene el detalle de una parcela"""
        db = self._get_db()
        plot = db.query(FarmPlotModel).filter(
            FarmPlotModel.id == plot_id,
            FarmPlotModel.disabled_at.is_(None)
        ).first()
        
        if not plot:
            return None
        
        return PlotResponse.model_validate(plot)
    
    def update_plot(self, plot_id: UUID, plot_data: PlotUpdate) -> Optional[PlotResponse]:
        """Actualiza los datos de una parcela"""
        db = self._get_db()
        try:
            plot = db.query(FarmPlotModel).filter(
                FarmPlotModel.id == plot_id,
                FarmPlotModel.disabled_at.is_(None)
            ).first()
            
            if not plot:
                return None
            
            update_data = plot_data.model_dump(exclude_none=True)
            for key, value in update_data.items():
                setattr(plot, key, value)
            
            plot.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(plot)
            return PlotResponse.model_validate(plot)
        except Exception as e:
            db.rollback()
            raise e
    
    def delete_plot(self, plot_id: UUID) -> bool:
        """Elimina una parcela (deshabilitado logico)"""
        db = self._get_db()
        try:
            plot = db.query(FarmPlotModel).filter(
                FarmPlotModel.id == plot_id,
                FarmPlotModel.disabled_at.is_(None)
            ).first()
            
            if not plot:
                return False
            
            plot.disabled_at = datetime.utcnow()
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
    
    # Crop methods
    def get_crops(
        self, 
        page: int = 1, 
        per_page: int = 10,
        sort_by: Optional[str] = None,
        order: Optional[str] = "asc",
        search: str = ""
    ) -> PaginatedCropResponse:
        """Lista todos los cultivos paginados"""
        db = self._get_db()
        
        query = db.query(CropModel).filter(CropModel.disabled_at.is_(None))
        
        # Aplicar biºsqueda si se proporciona
        if search:
            query = query.filter(
                (CropModel.name.isnot(None) & CropModel.name.ilike(f"%{search}%")) |
                (CropModel.crop_type.isnot(None) & CropModel.crop_type.ilike(f"%{search}%"))
            )
        
        # Aplicar ordenamiento
        if sort_by:
            sort_column = getattr(CropModel, sort_by, None)
            if sort_column is not None:
                if order and order.lower() == "desc":
                    query = query.order_by(sort_column.desc())
                else:
                    query = query.order_by(sort_column.asc())
        else:
            # Ordenamiento por defecto
            query = query.order_by(CropModel.created_at.desc())
        
        total = query.count()
        offset = (page - 1) * per_page
        total_pages = (total + per_page - 1) // per_page
        
        crops = query.offset(offset).limit(per_page).all()
        
        return PaginatedCropResponse(
            items=[CropResponse.model_validate(crop) for crop in crops],
            total=total,
            page=page,
            page_size=per_page,
            total_pages=total_pages
        )
    
    def get_crops_by_plot(self, plot_id: UUID) -> List[CropResponse]:
        """Obtiene los cultivos de una parcela"""
        db = self._get_db()
        crops = db.query(CropModel).join(
            PlotCropModel, CropModel.id == PlotCropModel.crop_id
        ).filter(
            PlotCropModel.plot_id == plot_id,
            CropModel.disabled_at.is_(None),
            PlotCropModel.disabled_at.is_(None)
        ).all()
        
        return [CropResponse.model_validate(crop) for crop in crops]
    
    # Plot Section methods
    def create_plot_section(self, plot_id: UUID, section_data: PlotSectionCreate) -> PlotSectionResponse:
        """Agrega una nueva seccion a una parcela"""
        db = self._get_db()
        try:
            # Verificar que la parcela existe
            plot = db.query(FarmPlotModel).filter(
                FarmPlotModel.id == plot_id,
                FarmPlotModel.disabled_at.is_(None)
            ).first()
            
            if not plot:
                raise ValueError("Parcela no encontrada")
            
            section = PlotSectionModel(
                plot_id=plot_id,
                **section_data.model_dump()
            )
            db.add(section)
            db.commit()
            db.refresh(section)
            return PlotSectionResponse.model_validate(section)
        except Exception as e:
            db.rollback()
            raise e
    
    def get_plot_sections(self, plot_id: UUID) -> List[PlotSectionResponse]:
        """Obtiene todas las secciones de una parcela"""
        db = self._get_db()
        sections = db.query(PlotSectionModel).filter(
            PlotSectionModel.plot_id == plot_id,
            PlotSectionModel.disabled_at.is_(None)
        ).all()
        
        return [PlotSectionResponse.model_validate(section) for section in sections]
    
    def update_plot_section(self, plot_id: UUID, section_id: UUID, section_data: PlotSectionUpdate) -> Optional[PlotSectionResponse]:
        """Actualiza una seccion de parcela"""
        db = self._get_db()
        try:
            section = db.query(PlotSectionModel).filter(
                PlotSectionModel.id == section_id,
                PlotSectionModel.plot_id == plot_id,
                PlotSectionModel.disabled_at.is_(None)
            ).first()
            
            if not section:
                return None
            
            update_data = section_data.model_dump(exclude_none=True)
            for key, value in update_data.items():
                setattr(section, key, value)
            
            section.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(section)
            return PlotSectionResponse.model_validate(section)
        except Exception as e:
            db.rollback()
            raise e
    
    def delete_plot_section(self, plot_id: UUID, section_id: UUID) -> bool:
        """Elimina una seccion de parcela (deshabilitado logico)"""
        db = self._get_db()
        try:
            section = db.query(PlotSectionModel).filter(
                PlotSectionModel.id == section_id,
                PlotSectionModel.plot_id == plot_id,
                PlotSectionModel.disabled_at.is_(None)
            ).first()
            
            if not section:
                return False
            
            section.disabled_at = datetime.utcnow()
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
    
    # Farm methods
    def get_farms_by_farmer_paginated(
        self, 
        farmer_id: UUID, 
        page: int = 1, 
        per_page: int = 10,
        sort_by: Optional[str] = None,
        order: Optional[str] = "desc",
        search: str = "",
        token: Optional[str] = None
    ) -> PaginatedFarmResponse:
        """Obtiene farms paginados de un farmer (solo los no deshabilitados) con informacion adicional"""
        db = self._get_db()
        
        # Query con joins para obtener informacion relacionada
        query = db.query(
            FarmModel,
            FarmerModel,
            CountryModel,
            DepartmentModel,
            ProvinceModel,
            DistrictModel
        ).select_from(FarmModel).join(
            FarmerModel, FarmModel.farmer_id == FarmerModel.id
        ).outerjoin(
            CountryModel, 
            (FarmModel.country_id == CountryModel.id) & (CountryModel.disabled_at.is_(None))
        ).outerjoin(
            DepartmentModel, 
            (FarmModel.department_id == DepartmentModel.id) & (DepartmentModel.disabled_at.is_(None))
        ).outerjoin(
            ProvinceModel, 
            (FarmModel.province_id == ProvinceModel.id) & (ProvinceModel.disabled_at.is_(None))
        ).outerjoin(
            DistrictModel, 
            (FarmModel.district_id == DistrictModel.id) & (DistrictModel.disabled_at.is_(None))
        ).filter(
            FarmModel.farmer_id == farmer_id,
            FarmModel.disabled_at.is_(None),
            FarmerModel.disabled_at.is_(None)
        )
        
        # Aplicar biºsqueda si se proporciona
        if search:
            query = query.filter(
                (FarmModel.name.isnot(None) & FarmModel.name.ilike(f"%{search}%"))
            )
        
        # Aplicar ordenamiento
        if sort_by:
            # Para ordenar por campos de FarmModel, necesitamos acceder al modelo
            sort_column = getattr(FarmModel, sort_by, None)
            if sort_column is not None:
                if order and order.lower() == "desc":
                    query = query.order_by(sort_column.desc())
                else:
                    query = query.order_by(sort_column.asc())
        else:
            # Ordenamiento por defecto
            query = query.order_by(FarmModel.created_at.desc())
        
        total = query.count()
        offset = (page - 1) * per_page
        total_pages = (total + per_page - 1) // per_page
        
        results = query.offset(offset).limit(per_page).all()
        
        # Construir respuestas con informacion adicional agrupada
        from .schemas import FarmerInfo, CountryInfo, DepartmentInfo, ProvinceInfo, DistrictInfo
        
        farm_responses = []
        for farm, farmer, country, department, province, district in results:
            # Construir full_name del farmer
            farmer_full_name = None
            if farmer:
                parts = []
                if farmer.first_name:
                    parts.append(farmer.first_name)
                if farmer.last_name:
                    parts.append(farmer.last_name)
                farmer_full_name = " ".join(parts) if parts else None
            
            # Construir objetos anidados
            farmer_info = None
            if farmer:
                farmer_info = FarmerInfo(
                    id=farmer.id,
                    full_name=farmer_full_name
                )
            
            country_info = None
            if country:
                country_info = CountryInfo(
                    id=country.id,
                    name=country.name
                )
            
            department_info = None
            if department:
                department_info = DepartmentInfo(
                    id=department.id,
                    name=department.name
                )
            
            province_info = None
            if province:
                province_info = ProvinceInfo(
                    id=province.id,
                    name=province.name
                )
            
            district_info = None
            if district:
                district_info = DistrictInfo(
                    id=district.id,
                    name=district.name
                )
            
            # Obtener crops asociados a esta farm
            crops_query = db.query(CropModel).join(
                FarmCropModel,
                (FarmCropModel.crop_id == CropModel.id) & (FarmCropModel.farm_id == farm.id)
            ).filter(
                FarmCropModel.disabled_at.is_(None),
                CropModel.disabled_at.is_(None)
            ).all()
            
            # Construir lista de CropResponse
            crops_list = [CropResponse.model_validate(crop) for crop in crops_query]
            
            # Verificar y obtener informacion de deforestacion
            deforestation_info = None
            try:
                deforestation_data = check_and_update_deforestation_status(
                    farm=farm,
                    db=db,
                    token=token,
                    DeforestationRequestModel=DeforestationRequestModel,
                    DeforestationRequestStatusEnum=DeforestationRequestStatusEnum,
                    geometry_to_geojson_func=geometry_to_geojson,
                    save_or_update_func=save_or_update_deforestation_request
                )
                if deforestation_data:
                    deforestation_info = DeforestationRequestInfo(**deforestation_data)
            except Exception as e:
                print(f" Error al verificar deforestacion para farm {farm.id}: {e}")
            
            farm_dict = {
                'id': farm.id,
                'farmer_id': farm.farmer_id,
                'name': farm.name,
                'total_area': float(farm.total_area) if farm.total_area else None,
                'cultivated_area': float(farm.cultivated_area) if farm.cultivated_area else None,
                'geometry': geometry_to_geojson(farm.geometry, db) if farm.geometry else None,
                'latitude': float(farm.latitude) if farm.latitude else None,
                'longitude': float(farm.longitude) if farm.longitude else None,
                'country_id': farm.country_id,
                'department_id': farm.department_id,
                'province_id': farm.province_id,
                'district_id': farm.district_id,
                'farmer': farmer_info,
                'country': country_info,
                'department': department_info,
                'province': province_info,
                'district': district_info,
                'crops': crops_list,  # Agregar lista de crops
                'deforestation_request': deforestation_info,  # Agregar info de deforestacion
                'created_at': farm.created_at,
                'updated_at': farm.updated_at,
                'disabled_at': farm.disabled_at
            }
            
            farm_responses.append(FarmResponse(**farm_dict))
        
        return PaginatedFarmResponse(
            items=farm_responses,
            total=total,
            page=page,
            page_size=per_page,
            total_pages=total_pages
        )
    
    # patch farms
    def patch_farms(
        self,
        farm_id: UUID,
        farm_data: FarmUpdate,
        token: Optional[str] = None
    ) -> Optional[FarmResponse]:
        """Actualiza un farm existente"""
        db = self._get_db()
        try:
            farm = db.query(FarmModel).filter(
                FarmModel.id == farm_id,
                FarmModel.disabled_at.is_(None)
            ).first()
            
            if not farm:
                return None
            
            # Actualizar solo los campos proporcionados
            update_data = farm_data.model_dump(exclude_none=True)
            for key, value in update_data.items():
                if value != getattr(farm, key):
                    if value not in ['', ' ', None]:
                        setattr(farm, key, value)
            
            farm.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(farm)
            return FarmResponse.model_validate(farm)
        except Exception as e:
            db.rollback()
            raise e
    # Core Register methods
    def get_registers_by_farmer(
        self, 
        farmer_id: UUID, 
        page: int = 1, 
        per_page: int = 10,
        sort_by: Optional[str] = None,
        order: Optional[str] = "desc",
        search: str = ""
    ) -> PaginatedCoreRegisterResponse:
        """
        Obtiene todos los registros de core_registers donde entity_id coincide con farmer_id.
        
        Args:
            farmer_id: ID del farmer
            page: Niºmero de pagina
            page_size: Tamai±o de pagina
            sort_by: Campo por el cual ordenar
            order: Orden ('asc' o 'desc')
            search: Texto de biºsqueda (opcional)
            
        Returns:
            PaginatedCoreRegisterResponse con los registros encontrados
        """
        db = self._get_db()
        
        # Verificar que el farmer existe
        farmer = db.query(FarmerModel).filter(
            FarmerModel.id == farmer_id,
            FarmerModel.disabled_at.is_(None)
        ).first()
        
        if not farmer:
            return PaginatedCoreRegisterResponse(
                items=[],
                total=0,
                page=page,
                per_page=per_page,
                total_pages=0
            )
        
        # Query base: buscar registros donde entity_id = farmer_id con join a FormModel
        query = db.query(
            CoreRegisterModel,
            FormModel
        ).select_from(CoreRegisterModel).outerjoin(
            FormModel,
            (CoreRegisterModel.form_id == FormModel.id) & (FormModel.disabled_at.is_(None))
        ).filter(
            CoreRegisterModel.entity_id == farmer_id,
            CoreRegisterModel.disabled_at.is_(None)
        )
        
        # Aplicar biºsqueda si se proporciona (buscar en detail, entity_name, etc.)
        if search:
            # Intentar buscar por UUID si el search es un UUID valido
            try:
                search_uuid = UUID(search)
                query = query.filter(
                    (CoreRegisterModel.id == search_uuid) |
                    (CoreRegisterModel.form_id == search_uuid) |
                    (CoreRegisterModel.schema_form_id == search_uuid)
                )
            except ValueError:
                # Si no es un UUID valido, buscar por entity_name o nombre del formulario
                query = query.filter(
                    (CoreRegisterModel.entity_name.ilike(f"%{search}%")) |
                    (FormModel.name.ilike(f"%{search}%"))
                )
        
        # Aplicar ordenamiento
        if sort_by:
            sort_column = getattr(CoreRegisterModel, sort_by, None)
            if sort_column is not None:
                if order and order.lower() == "desc":
                    query = query.order_by(sort_column.desc())
                else:
                    query = query.order_by(sort_column.asc())
        else:
            # Ordenamiento por defecto: mas recientes primero
            query = query.order_by(CoreRegisterModel.created_at.desc())
        
        # Contar total
        total = query.count()
        
        # Aplicar paginacion
        offset = (page - 1) * per_page
        total_pages = (total + per_page - 1) // per_page
        
        results = query.offset(offset).limit(per_page).all()
        
        # Convertir registros a respuesta, convirtiendo location de Geometry a WKT string
        register_responses = []
        for result in results:
            register, form = result
            
            # Construir objeto form si existe
            form_info = None
            if form:
                form_info = FormInfo(
                    id=form.id,
                    name=form.name
                )
            
            # Convertir location a texto WKT si existe
            location_text = None
            if register.location:
                location_result = db.query(sql_func.ST_AsText(register.location)).filter(
                    CoreRegisterModel.id == register.id
                ).first()
                if location_result:
                    location_text = location_result[0]
            
            register_dict = {
                'id': register.id,
                'form_id': register.form_id,
                'form': form_info,
                'schema_form_id': register.schema_form_id,
                'detail': register.detail,
                'status': register.status,
                'error': register.error,
                'location': location_text,
                'entity_name': register.entity_name,
                'entity_id': register.entity_id,
                'identity_id': register.identity_id,
                'duration': register.duration,
                'created_at': register.created_at,
                'updated_at': register.updated_at,
                'disabled_at': register.disabled_at
            }
            
            register_responses.append(CoreRegisterResponse(**register_dict))
        
        return PaginatedCoreRegisterResponse(
            items=register_responses,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages
        )
    
    def upload_farm_geometry(self, farm_id: UUID, geometry_data: 'FarmGeometryUpload', token: Optional[str] = None) -> 'FarmGeometryResponse':
        """
        Sube la geometri­a (poligono) de una farm en formato GeoJSON.
        
        - Si is_principal=True: guarda en farms.geometry (MultiPolygon)
        - Si is_principal=False: crea un nuevo farm_plot (Polygon)
        
        Args:
            farm_id: ID de la farm
            geometry_data: Datos con el GeoJSON, is_principal, y opcionalmente name/description
            token: Authorization token for GFW API
            
        Returns:
            FarmGeometryResponse con el resultado
        """
        from .schemas import FarmGeometryResponse
        import json
        db = self._get_db()
        
        try:
            # Verificar que la farm existe
            farm = db.query(FarmModel).filter(
                FarmModel.id == farm_id,
                FarmModel.disabled_at.is_(None)
            ).first()
            
            if not farm:
                raise ValueError(f"Farm con id {farm_id} no encontrada")
            
            # Convertir GeoJSON a geometry
            geojson = geometry_data.geojson
            
            # Validar que sea FeatureCollection
            geojson_type = geojson.get('type')
            if geojson_type != 'FeatureCollection':
                raise ValueError(f"El GeoJSON debe ser de tipo 'FeatureCollection', recibido: '{geojson_type}'")
            
            # Extraer features del FeatureCollection
            features = geojson.get('features', [])
            if not features:
                raise ValueError("El FeatureCollection debe contener al menos una feature")
            
            # Tomar la primera feature
            feature = features[0]
            geometry = feature.get('geometry')
            
            if not geometry:
                raise ValueError("La feature no contiene una geometri­a valida")
            
            # Validar que la geometri­a sea Polygon o MultiPolygon
            geom_type = geometry.get('type')
            if geom_type not in ['Polygon', 'MultiPolygon']:
                raise ValueError(f"El tipo de geometri­a debe ser Polygon o MultiPolygon, recibido: {geom_type}")
            
            plot_id = None
            geometry_geojson = None
            
            # Si es principal, actualizar el campo geometry de la farm
            if geometry_data.is_principal:
                # Convertir a MultiPolygon si es necesario
                if geom_type == 'Polygon':
                    # Convertir Polygon a MultiPolygon
                    multipolygon_geojson = {
                        'type': 'MultiPolygon',
                        'coordinates': [geometry['coordinates']]
                    }
                    geojson_to_save = multipolygon_geojson
                else:
                    geojson_to_save = geometry
                
                # Guardar usando SQL directo para aprovechar ST_GeomFromGeoJSON
                geojson_str = json.dumps(geojson_to_save)
                
                db.execute(
                    text("""
                        UPDATE public.farms 
                        SET geometry = ST_GeomFromGeoJSON(:geojson), 
                            updated_at = NOW() 
                        WHERE id = :farm_id
                    """),
                    {"geojson": geojson_str, "farm_id": str(farm_id)}
                )
                db.commit()
                db.refresh(farm)
                
                # Obtener la geometri­a actualizada en formato GeoJSON
                geometry_geojson = geometry_to_geojson(farm.geometry, db) if farm.geometry else None
                message = "Geometri­a principal actualizada exitosamente en tabla farms"
                
                # Enviar poligono a GFW para analisis de deforestacion
                try:
                    print(f" Enviando poligono a GFW para analisis de deforestacion...")
                    
                    # Obtener configuracion de GFW desde environment o config
                    from .environment import GFW_API_URL
                    from .services.gfw import GeoJSONTransformer
                    
                    if token:
                        gfw_service = GeoJSONTransformer()
                        gfw_response = gfw_service.send_gfw(
                            polygon=geojson,
                            api_url=GFW_API_URL,
                            token=token
                        )
                    else:
                        print(f" No hay token de autorizacion para enviar a GFW")
                        gfw_response = None
                    
                    if gfw_response:
                        print(f" Respuesta de GFW recibida: {gfw_response}")
                        
                        # Guardar o actualizar en deforestation_requests
                        save_or_update_deforestation_request(
                            farm_id=farm_id,
                            gfw_response=gfw_response,
                            db=db,
                            DeforestationRequestModel=DeforestationRequestModel,
                            DeforestationRequestStatusEnum=DeforestationRequestStatusEnum
                        )
                    else:
                        print(f" No se recibio respuesta de GFW")
                        
                except Exception as gfw_error:
                    # No fallar la operacion principal si falla GFW
                    print(f" Error al procesar GFW (no cri­tico): {gfw_error}")
                    import traceback
                    traceback.print_exc()
                
            else:
                # Si no es principal, crear un nuevo plot en farm_plots
                # Convertir a Polygon si es MultiPolygon (farm_plots solo acepta Polygon)
                if geom_type == 'MultiPolygon':
                    # Tomar el primer poligono del MultiPolygon
                    polygon_geojson = {
                        'type': 'Polygon',
                        'coordinates': geometry['coordinates'][0]
                    }
                    geojson_to_save = polygon_geojson
                else:
                    geojson_to_save = geometry
                
                geojson_str = json.dumps(geojson_to_save)
                
                # Crear nuevo plot
                result = db.execute(
                    text("""
                        INSERT INTO public.farm_plots (farm_id, geometry, name, description, created_at, updated_at)
                        VALUES (:farm_id, ST_GeomFromGeoJSON(:geojson), :name, :description, NOW(), NOW())
                        RETURNING id
                    """),
                    {
                        "farm_id": str(farm_id),
                        "geojson": geojson_str,
                        "name": geometry_data.name or f"Plot {datetime.now().strftime('%Y%m%d_%H%M%S')}",
                        "description": geometry_data.description
                    }
                )
                db.commit()
                
                # Obtener el ID del plot creado
                plot_id = result.fetchone()[0]
                
                # Obtener la geometri­a del plot en formato GeoJSON
                geojson_result = db.execute(
                    text("""
                        SELECT ST_AsGeoJSON(geometry)::json as geojson
                        FROM public.farm_plots
                        WHERE id = :plot_id
                    """),
                    {"plot_id": str(plot_id)}
                ).fetchone()
                
                if geojson_result and geojson_result[0]:
                    geometry_geojson = geojson_result[0]
                
                message = f"Plot secundario creado exitosamente en tabla farm_plots"
            
            return FarmGeometryResponse(
                id=farm.id,
                farmer_id=farm.farmer_id,
                name=farm.name,
                geometry=geometry_geojson,
                plot_id=plot_id,
                is_principal=geometry_data.is_principal,
                message=message
            )
            
        except ValueError as e:
            db.rollback()
            raise e
        except Exception as e:
            db.rollback()
            print(f" Error al subir geometri­a: {e}")
            import traceback
            traceback.print_exc()
            raise e
    
