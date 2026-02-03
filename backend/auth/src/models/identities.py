from dataclasses import dataclass
from sqlalchemy import Column, String, Text, TIMESTAMP, func, text
from sqlalchemy.dialects.postgresql import UUID, JSONB

from core.models.base_class import Model

@dataclass
class IdentityModel(Model):
    """ IdentityModel """
    
    __tablename__ = "identities"
    __table_args__ = {"schema": "public", "extend_existing": True}
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    sub: str = Column(Text, nullable=False, info={"display_name": "Subject", "description": "identificador único del sujeto"})
    username: str = Column(Text, nullable=True, info={"display_name": "Username", "description": "nombre de usuario de la identidad"})
    email: str = Column(Text, nullable=True, info={"display_name": "Email", "description": "email de la identidad"})
    eid: str = Column(Text, nullable=True, info={"display_name": "EID", "description": "identificador externo de la identidad"})
    first_name: str = Column(Text, nullable=True, info={"display_name": "First Name", "description": "nombre de la identidad"})
    last_name: str = Column(Text, nullable=True, info={"display_name": "Last Name", "description": "apellido de la identidad"})
    sms_number: str = Column(Text, nullable=True, info={"display_name": "SMS Number", "description": "número de teléfono para SMS"})
    claims = Column(JSONB, nullable=True, info={"display_name": "Claims", "description": "claims de la identidad"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    last_seen_at = Column(TIMESTAMP, nullable=True)
    disabled_at = Column(TIMESTAMP, nullable=True, default=None)
    
    def __init__(self, **kwargs):
        super(IdentityModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)

