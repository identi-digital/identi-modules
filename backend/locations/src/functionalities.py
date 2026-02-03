from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from .models.countries import CountryModel
from .models.departments import DepartmentModel
from .models.provinces import ProvinceModel
from .models.districts import DistrictModel
from .schemas import (
    CountryResponse, DepartmentResponse, ProvinceResponse, DistrictResponse,
    PaginatedCountryResponse, PaginatedDepartmentResponse,
    PaginatedProvinceResponse, PaginatedDistrictResponse
)

class Funcionalities:
    def __init__(self, container, database_key: str = "core_db"):
        self.container = container
        self.database_key = database_key
        
    def _get_db(self) -> Session:
        """Obtiene la sesión de base de datos desde el container"""
        # El Container ahora maneja automáticamente la verificación y limpieza de transacciones abortadas
        return self.container.get(self.database_key, "databases")
    
    # Countries
    def get_countries_paginated(
        self, 
        page: int = 1, 
        per_page: int = 10,
        sort_by: Optional[str] = None,
        order: Optional[str] = "asc",
        search: str = ""
    ) -> PaginatedCountryResponse:
        """Obtiene countries paginados (solo los no deshabilitados)"""
        db = self._get_db()
        
        query = db.query(CountryModel).filter(CountryModel.disabled_at.is_(None))
        
        # Aplicar búsqueda si se proporciona
        if search:
            query = query.filter(
                (CountryModel.name.ilike(f"%{search}%")) |
                (CountryModel.code.isnot(None) & CountryModel.code.ilike(f"%{search}%")) |
                (CountryModel.description.isnot(None) & CountryModel.description.ilike(f"%{search}%"))
            )
        
        # Aplicar ordenamiento
        if sort_by:
            sort_column = getattr(CountryModel, sort_by, None)
            if sort_column is not None:
                if order and order.lower() == "desc":
                    query = query.order_by(sort_column.desc())
                else:
                    query = query.order_by(sort_column.asc())
        else:
            # Ordenamiento por defecto
            query = query.order_by(CountryModel.name.asc())
        
        total = query.count()
        
        offset = (page - 1) * per_page
        total_pages = (total + per_page - 1) // per_page
        
        countries = query.offset(offset).limit(per_page).all()
        
        return PaginatedCountryResponse(
            items=[CountryResponse.model_validate(country) for country in countries],
            total=total,
            page=page,
            page_size=per_page,
            total_pages=total_pages
        )
    
    # Departments
    def get_departments_paginated(
        self, 
        page: int = 1, 
        per_page: int = 10,
        sort_by: Optional[str] = None,
        order: Optional[str] = "asc",
        search: str = ""
    ) -> PaginatedDepartmentResponse:
        """Obtiene departments paginados (solo los no deshabilitados)"""
        db = self._get_db()
        
        # Query con conversión de geometry a texto directamente
        query = db.query(
            DepartmentModel,
            func.ST_AsText(DepartmentModel.center_point).label('center_point_text')
        ).filter(DepartmentModel.disabled_at.is_(None))
        
        # Aplicar búsqueda si se proporciona
        if search:
            query = query.filter(
                (DepartmentModel.name.ilike(f"%{search}%")) |
                (DepartmentModel.description.isnot(None) & DepartmentModel.description.ilike(f"%{search}%"))
            )
        
        # Aplicar ordenamiento
        if sort_by:
            sort_column = getattr(DepartmentModel, sort_by, None)
            if sort_column is not None:
                if order and order.lower() == "desc":
                    query = query.order_by(sort_column.desc())
                else:
                    query = query.order_by(sort_column.asc())
        else:
            # Ordenamiento por defecto
            query = query.order_by(DepartmentModel.name.asc())
        
        # Contar total (después de aplicar búsqueda)
        total = query.count()
        
        offset = (page - 1) * per_page
        total_pages = (total + per_page - 1) // per_page
        
        results = query.offset(offset).limit(per_page).all()
        
        # Construir respuestas
        department_responses = []
        for dept, center_point_text in results:
            department_responses.append(DepartmentResponse(
                id=dept.id,
                name=dept.name,
                description=dept.description,
                country_id=dept.country_id,
                center_point=center_point_text,
                created_at=dept.created_at,
                updated_at=dept.updated_at,
                disabled_at=dept.disabled_at
            ))
        
        return PaginatedDepartmentResponse(
            items=department_responses,
            total=total,
            page=page,
            page_size=per_page,
            total_pages=total_pages
        )
    
    # provinces
    def get_provinces_paginated(
        self, 
        page: int = 1, 
        per_page: int = 10,
        sort_by: Optional[str] = None,
        order: Optional[str] = "asc",
        search: str = ""
    ) -> PaginatedProvinceResponse:
        """Obtiene provinces paginados (solo los no deshabilitados)"""
        db = self._get_db()
        
        # Query con conversión de geometry a texto directamente
        query = db.query(
            ProvinceModel,
            func.ST_AsText(ProvinceModel.center_point).label('center_point_text')
        ).filter(ProvinceModel.disabled_at.is_(None))
        
        # Aplicar búsqueda si se proporciona
        if search:
            query = query.filter(
                (ProvinceModel.name.ilike(f"%{search}%")) |
                (ProvinceModel.description.isnot(None) & ProvinceModel.description.ilike(f"%{search}%"))
            )
        
        # Aplicar ordenamiento
        if sort_by:
            sort_column = getattr(ProvinceModel, sort_by, None)
            if sort_column is not None:
                if order and order.lower() == "desc":
                    query = query.order_by(sort_column.desc())
                else:
                    query = query.order_by(sort_column.asc())
        else:
            # Ordenamiento por defecto
            query = query.order_by(ProvinceModel.name.asc())
        
        # Contar total (después de aplicar búsqueda)
        total = query.count()
        
        offset = (page - 1) * per_page
        total_pages = (total + per_page - 1) // per_page
        
        results = query.offset(offset).limit(per_page).all()
        
        # Construir respuestas
        province_responses = []
        for prov, center_point_text in results:
            province_responses.append(ProvinceResponse(
                id=prov.id,
                name=prov.name,
                description=prov.description,
                department_id=prov.department_id,
                center_point=center_point_text,
                created_at=prov.created_at,
                updated_at=prov.updated_at,
                disabled_at=prov.disabled_at
            ))
        
        return PaginatedProvinceResponse(
            items=province_responses,
            total=total,
            page=page,
            page_size=per_page,
            total_pages=total_pages
        )
    
    # Districts
    def get_districts_paginated(
        self, 
        page: int = 1, 
        per_page: int = 10,
        sort_by: Optional[str] = None,
        order: Optional[str] = "asc",
        search: str = ""
    ) -> PaginatedDistrictResponse:
        """Obtiene districts paginados (solo los no deshabilitados)"""
        db = self._get_db()
        
        # Query con conversión de geometry a texto directamente
        query = db.query(
            DistrictModel,
            func.ST_AsText(DistrictModel.center_point).label('center_point_text')
        ).filter(DistrictModel.disabled_at.is_(None))
        
        # Aplicar búsqueda si se proporciona
        if search:
            query = query.filter(
                (DistrictModel.name.ilike(f"%{search}%")) |
                (DistrictModel.description.isnot(None) & DistrictModel.description.ilike(f"%{search}%"))
            )
        
        # Aplicar ordenamiento
        if sort_by:
            sort_column = getattr(DistrictModel, sort_by, None)
            if sort_column is not None:
                if order and order.lower() == "desc":
                    query = query.order_by(sort_column.desc())
                else:
                    query = query.order_by(sort_column.asc())
        else:
            # Ordenamiento por defecto
            query = query.order_by(DistrictModel.name.asc())
        
        # Contar total (después de aplicar búsqueda)
        total = query.count()
        
        offset = (page - 1) * per_page
        total_pages = (total + per_page - 1) // per_page
        
        results = query.offset(offset).limit(per_page).all()
        
        # Construir respuestas
        district_responses = []
        for dist, center_point_text in results:
            district_responses.append(DistrictResponse(
                id=dist.id,
                name=dist.name,
                description=dist.description,
                province_id=dist.province_id,
                center_point=center_point_text,
                created_at=dist.created_at,
                updated_at=dist.updated_at,
                disabled_at=dist.disabled_at
            ))
        
        return PaginatedDistrictResponse(
            items=district_responses,
            total=total,
            page=page,
            page_size=per_page,
            total_pages=total_pages
        )

