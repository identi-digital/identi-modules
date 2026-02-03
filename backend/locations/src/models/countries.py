from dataclasses import dataclass
from sqlalchemy import Column, String, Text, TIMESTAMP, func, text
from sqlalchemy.dialects.postgresql import UUID
from core.models.base_class import Model

@dataclass
class CountryModel(Model):
    """ CountryModel """

    __tablename__ = "countries"
    __table_args__ = {"schema": "public", "extend_existing": True}
    
    id = Column(String(12),
                 primary_key=True,
                 server_default=text("to_hex(FLOOR(EXTRACT(epoch FROM NOW())*10000)::bigint)"),
                 unique=True,
                 nullable=False)
    name: str = Column(String(100), nullable=False, info={"display_name": "Nombre", "description": "nombre del país"})
    description: str = Column(Text, nullable=True, info={"display_name": "Descripción", "description": "descripcion del país"})
    code: str = Column(String(10), unique=True, nullable=True, info={"display_name": "Código", "description": "codigo del país"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.current_timestamp())
    disabled_at = Column(TIMESTAMP, nullable=True, default=None)
    
    def __init__(self, **kwargs):
        super(CountryModel, self).__init__(**kwargs)

    def __hash__(self):
        return hash(self.id)

