from dataclasses import dataclass
from sqlalchemy import Column, String, TIMESTAMP, func, text, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.dialects.postgresql import UUID
import enum

from core.models.base_class import Model

class AgentStatusEnum(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

@dataclass
class AgentModel(Model):
    """ AgentModel """
    
    __tablename__ = "agent"
    __table_args__ = (
        Index('idx_agent_identity', 'identity_id'),
        Index('idx_agent_status', 'status'),
        Index('idx_agent_disabled_at', 'disabled_at'),
        {"schema": "public", "extend_existing": True}
    )
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    identity_id = Column(UUID(as_uuid=True), ForeignKey('public.identities.id'), nullable=False, info={"display_name": "Identidad", "description": "id de la identidad base asociada al agente"})
    first_name: str = Column(String(255), nullable=False, info={"display_name": "Nombre", "description": "nombre(s) del agente"})
    last_name: str = Column(String(255), nullable=False, info={"display_name": "Apellido", "description": "apellido(s) del agente"})
    dni: str = Column(String(50), nullable=False, unique=True, info={"display_name": "DNI", "description": "documento nacional de identidad del agente"})
    sms_number: str = Column(String(50), nullable=True, info={"display_name": "Número SMS", "description": "número telefónico utilizado para envío de mensajes SMS"})
    wsp_number: str = Column(String(50), nullable=True, info={"display_name": "Número WhatsApp", "description": "número telefónico utilizado para WhatsApp"})
    cell_number: str = Column(String(50), nullable=True, info={"display_name": "Número Celular", "description": "número de teléfono celular principal del agente"})
    email: str = Column(String(255), nullable=True, info={"display_name": "Email", "description": "correo electrónico del agente"})
    username: str = Column(String(100), nullable=True, unique=True, info={"display_name": "Usuario", "description": "nombre de usuario utilizado para autenticación o identificación interna"})
    status = Column(SQLEnum(AgentStatusEnum, name='agent_status_enum', values_callable=lambda x: [e.value for e in x]), nullable=False, default=AgentStatusEnum.ACTIVE, info={"display_name": "Estado", "description": "estado del agente dentro del sistema"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.current_timestamp())
    disabled_at = Column(TIMESTAMP, nullable=True, default=None)
    
    def __init__(self, **kwargs):
        super(AgentModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)
