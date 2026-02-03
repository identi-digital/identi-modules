from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi.datastructures import Headers
from .models.identities import IdentityModel
from .resources.authx_service import AuthXService
# Importar environment del módulo auth usando importación relativa
from ..environment import (
    AUTHX_BASE_URL, AUTH_APP_ID, AUTH_APP_ACCESS_TOKEN,
    AUTH_APP_CONTEXT_ID, TENANT)
from .schemas import (
    IdentityCreate, IdentityUpdate, IdentityResponse, PaginatedIdentityResponse
)


class Funcionalities:
    def __init__(self, container):
        self.container = container
        # Inicializar AuthXService (singleton)
        self.authx_service = AuthXService(
            AUTHX_BASE_URL=AUTHX_BASE_URL,
            CLIENT_ID=AUTH_APP_ID,
            CLIENT_SECRET=AUTH_APP_ACCESS_TOKEN,
            APP_CONTEXT_ID=AUTH_APP_CONTEXT_ID,
            TENANT=TENANT
        )
        
    def _get_db(self) -> Session:
        """Obtiene la sesión de base de datos desde el container"""
        return self.container.get("core_db", "databases")
    def api_verify_token(self, header: Headers) -> str:
        """Verifica un token de autenticación"""
        return self.authx_service.api_verify_token(header)
    
    def get_identities(self, page: int = 1, per_page: int = 10, sort_by: Optional[str] = None, order: Optional[str] = "asc", search: str = "") -> PaginatedIdentityResponse:
        """Lista todas las identidades paginadas"""
        db = self._get_db()
        
        query = db.query(IdentityModel)
        
        # Aplicar búsqueda si se proporciona
        if search:
            query = query.filter(
                IdentityModel.sub.ilike(f"%{search}%") |
                (IdentityModel.username.isnot(None) & IdentityModel.username.ilike(f"%{search}%")) |
                (IdentityModel.email.isnot(None) & IdentityModel.email.ilike(f"%{search}%")) |
                (IdentityModel.eid.isnot(None) & IdentityModel.eid.ilike(f"%{search}%")) |
                (IdentityModel.first_name.isnot(None) & IdentityModel.first_name.ilike(f"%{search}%")) |
                (IdentityModel.last_name.isnot(None) & IdentityModel.last_name.ilike(f"%{search}%")) |
                (IdentityModel.sms_number.isnot(None) & IdentityModel.sms_number.ilike(f"%{search}%"))
            )
        
        # Aplicar ordenamiento
        if sort_by:
            sort_column = getattr(IdentityModel, sort_by, None)
            if sort_column is not None:
                if order and order.lower() == "desc":
                    query = query.order_by(sort_column.desc())
                else:
                    query = query.order_by(sort_column.asc())
        else:
            # Ordenamiento por defecto
            query = query.order_by(IdentityModel.created_at.desc())
        
        total = query.count()
        offset = (page - 1) * per_page
        total_pages = (total + per_page - 1) // per_page if total > 0 else 0
        
        identities = query.offset(offset).limit(per_page).all()
        
        return PaginatedIdentityResponse(
            items=[IdentityResponse.model_validate(identity) for identity in identities],
            total=total,
            page=page,
            page_size=per_page,
            total_pages=total_pages
        )
    
    def get_identity(self, identity_id: UUID) -> Optional[IdentityResponse]:
        """Obtiene una identidad por ID"""
        db = self._get_db()
        identity = db.query(IdentityModel).filter(IdentityModel.id == identity_id).first()
        
        if not identity:
            return None
        
        return IdentityResponse.model_validate(identity)
    
    def get_identity_by_sub(self, sub: str) -> Optional[IdentityResponse]:
        """Obtiene una identidad por sub (subject identifier)"""
        db = self._get_db()
        identity = db.query(IdentityModel).filter(IdentityModel.sub == sub).first()
        
        if not identity:
            return None
        
        return IdentityResponse.model_validate(identity)
    
    def get_identity_by_eid(self, eid: str) -> Optional[IdentityResponse]:
        """Obtiene una identidad por EID (identificador externo)"""
        db = self._get_db()
        identity = db.query(IdentityModel).filter(
            IdentityModel.eid == eid,
            IdentityModel.disabled_at.is_(None)
        ).first()
        
        if not identity:
            return None
        
        return IdentityResponse.model_validate(identity)
    
    def create_identity(self, identity_data: IdentityCreate) -> IdentityResponse:
        """
        Crea una nueva identidad o devuelve la existente si ya existe por EID.
        
        Si se proporciona EID, verifica primero si ya existe una identidad con ese EID.
        - Si existe: devuelve la identidad existente
        - Si no existe: crea una nueva identidad
        """
        db = self._get_db()
        try:
            # Si se proporciona EID, verificar si ya existe una identidad con ese EID
            if identity_data.eid:
                existing_identity = db.query(IdentityModel).filter(
                    IdentityModel.eid == identity_data.eid,
                    IdentityModel.disabled_at.is_(None)
                ).first()
                
                if existing_identity:
                    print(f"✓ Identidad existente encontrada con EID {identity_data.eid}: {existing_identity.id}")
                    return IdentityResponse.model_validate(existing_identity)
            
            # Si no existe, crear nueva identidad
            # Generar el sub automáticamente basado en el username
            identity_dict = identity_data.model_dump(exclude_none=True)

            # registro en authx
            authx_service = self.authx_service
            register_response = authx_service.register_entity(
                username=identity_data.username,
                email=identity_data.email,
                sms_number=identity_data.sms_number,
                eid=identity_data.eid,
                first_name=identity_data.first_name,
                last_name=identity_data.last_name,
            )
            identity_dict['sub'] = register_response['entity_id']
            # Los claims se pueden generar aquí o dejar vacíos para que authz los complete
            if 'claims' not in identity_dict:
                identity_dict['claims'] = {}
            
            identity = IdentityModel(**identity_dict)

            db.add(identity)
            db.commit()
            db.refresh(identity)
            
            print(f"✓ Nueva identidad creada: {identity.id} (EID: {identity.eid})")
            return IdentityResponse.model_validate(identity)
        except Exception as e:
            db.rollback()
            print(f"❌ Error al crear/obtener identidad: {e}")
            raise e
    
    def update_identity(self, identity_id: UUID, identity_data: IdentityUpdate) -> Optional[IdentityResponse]:
        """Actualiza una identidad existente"""
        db = self._get_db()
        try:
            identity = db.query(IdentityModel).filter(IdentityModel.id == identity_id).first()
            
            if not identity:
                return None
            
            update_data = identity_data.model_dump(exclude_none=True)
            for key, value in update_data.items():
                setattr(identity, key, value)
            
            db.commit()
            db.refresh(identity)
            return IdentityResponse.model_validate(identity)
        except Exception as e:
            db.rollback()
            raise e
