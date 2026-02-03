from dataclasses import dataclass
from sqlalchemy import Column, String, TIMESTAMP, func, text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID

from core.models.base_class import Model

@dataclass
class GathererModel(Model):
    """ GathererModel """
    
    __tablename__ = "gatherers"
    __table_args__ = (
        Index('idx_gatherer_identity', 'identity_id'),
        Index('idx_gatherer_disabled_at', 'disabled_at'),
        {"schema": "public", "extend_existing": True}
    )
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    identity_id = Column(UUID(as_uuid=True), ForeignKey('public.identities.id'), nullable=False, info={"display_name": "Identidad", "description": "id de la identidad base asociada al acopiador"})
    first_name: str = Column(String(255), nullable=False, info={"display_name": "Nombre", "description": "nombre(s) del acopiador"})
    last_name: str = Column(String(255), nullable=False, info={"display_name": "Apellido", "description": "apellido(s) del acopiador"})
    dni: str = Column(String(50), nullable=False, unique=True, info={"display_name": "DNI", "description": "documento nacional de identidad del acopiador"})
    sms_number: str = Column(String(50), nullable=True, info={"display_name": "Número SMS", "description": "número telefónico utilizado para envío de mensajes SMS"})
    wsp_number: str = Column(String(50), nullable=True, info={"display_name": "Número WhatsApp", "description": "número telefónico utilizado para WhatsApp"})
    call_number: str = Column(String(50), nullable=True, info={"display_name": "Número de Llamada", "description": "número de teléfono para llamadas"})
    email: str = Column(String(255), nullable=True, info={"display_name": "Email", "description": "correo electrónico del acopiador"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.current_timestamp())
    disabled_at = Column(TIMESTAMP, nullable=True, default=None)
    
    def __init__(self, **kwargs):
        super(GathererModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)
