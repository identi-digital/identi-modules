from dataclasses import dataclass
from sqlalchemy import Column, String, Text, TIMESTAMP, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
import enum

from core.models.base_class import Model

class AuditLogType(enum.Enum):
    ERROR = "error"
    INFO = "info"
    WARNING = "warning"

@dataclass
class AuditLogModel(Model):
    """ AuditLogModel """
    
    __tablename__ = "audit_logs"
    __table_args__ = {"schema": "public", "extend_existing": True}
    
    created_at = Column(TIMESTAMP, primary_key=True, nullable=False)
    identity_id = Column(UUID(as_uuid=True), nullable=True, info={"display_name": "Identidad", "description": "identidad del log"})
    module = Column(UUID(as_uuid=True),
                    ForeignKey('public.registered_modules.id'),
                    nullable=True,
                    info={"display_name": "Módulo", "description": "modulo del log"})
    type = Column(SQLEnum(AuditLogType, name='audit_log_type', values_callable=lambda x: [e.value for e in x]), nullable=False, info={"display_name": "Tipo", "description": "tipo de log"})
    action = Column(Text, nullable=True, info={"display_name": "Acción", "description": "accion del log"})
    data = Column(JSONB, nullable=True, info={"display_name": "Datos", "description": "datos del log"})
    
    def __init__(self, **kwargs):
        super(AuditLogModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.created_at)

