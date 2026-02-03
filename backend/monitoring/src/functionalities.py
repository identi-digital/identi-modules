from datetime import datetime
from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import or_
# Usar importaciones relativas para evitar problemas durante la inicialización del módulo
from .models.audit_logs import AuditLogModel, AuditLogType
from .schemas import (
    AuditLogCreate, AuditLogResponse, PaginatedAuditLogResponse
)

class Funcionalities:
    def __init__(self, container):
        self.container = container
        
    def _get_db(self) -> Session:
        """Obtiene la sesión de base de datos desde el container"""
        return self.container.get("core_db", "databases")
    
    # Audit Log methods
    def get_logs(
        self, 
        page: int = 1, 
        per_page: int = 10,
        sort_by: Optional[str] = None,
        order: Optional[str] = "desc",
        search: str = ""
    ) -> PaginatedAuditLogResponse:
        """Lista todos los logs paginados"""
        db = self._get_db()
        
        query = db.query(AuditLogModel)
        
        # Aplicar búsqueda si se proporciona
        if search:
            # Intentar buscar por UUID si el search es un UUID válido
            try:
                search_uuid = UUID(search)
                query = query.filter(
                    (AuditLogModel.identity_id == search_uuid) |
                    (AuditLogModel.module == search_uuid)
                )
            except ValueError:
                # Si no es un UUID válido, buscar por action o type
                query = query.filter(
                    (AuditLogModel.action.isnot(None) & AuditLogModel.action.ilike(f"%{search}%"))
                )
        
        # Aplicar ordenamiento
        if sort_by:
            sort_column = getattr(AuditLogModel, sort_by, None)
            if sort_column is not None:
                if order and order.lower() == "desc":
                    query = query.order_by(sort_column.desc())
                else:
                    query = query.order_by(sort_column.asc())
        else:
            # Ordenamiento por defecto
            query = query.order_by(AuditLogModel.created_at.desc())
        
        total = query.count()
        offset = (page - 1) * per_page
        total_pages = (total + per_page - 1) // per_page
        
        logs = query.offset(offset).limit(per_page).all()
        
        return PaginatedAuditLogResponse(
            items=[AuditLogResponse.model_validate(log) for log in logs],
            total=total,
            page=page,
            page_size=per_page,
            total_pages=total_pages
        )
    
    def create_log(
        self,
        log_type: AuditLogType,
        action: Optional[str] = None,
        identity_id: Optional[UUID] = None,
        module: Optional[UUID] = None,
        data: Optional[dict] = None
    ) -> AuditLogResponse:
        """
        Crea un nuevo log de auditoría (funcionalidad interna, no expuesta en API)
        
        Args:
            log_type: Tipo de log (ERROR, INFO, WARNING)
            action: Acción realizada (opcional)
            identity_id: ID de la identidad (opcional)
            module: ID del módulo (opcional)
            data: Datos adicionales en formato dict (opcional)
        
        Returns:
            AuditLogResponse: El log creado
        """
        db = self._get_db()
        try:
            # Usar el timestamp actual como clave primaria
            log = AuditLogModel(
                created_at=datetime.utcnow(),
                type=log_type,
                action=action,
                identity_id=identity_id,
                module=module,
                data=data
            )
            db.add(log)
            db.commit()
            db.refresh(log)
            return AuditLogResponse.model_validate(log)
        except Exception as e:
            db.rollback()
            raise e

