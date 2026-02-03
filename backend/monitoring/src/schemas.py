from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID
# Usar importación relativa para evitar problemas durante la inicialización del módulo
from .models.audit_logs import AuditLogType

# Audit Log Schemas
class AuditLogCreate(BaseModel):
    identity_id: Optional[UUID] = None
    module: Optional[UUID] = None
    type: AuditLogType
    action: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class AuditLogResponse(BaseModel):
    created_at: datetime
    identity_id: Optional[UUID]
    module: Optional[UUID]
    type: AuditLogType
    action: Optional[str]
    data: Optional[Dict[str, Any]]
    
    class Config:
        from_attributes = True

class PaginatedAuditLogResponse(BaseModel):
    items: list[AuditLogResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

