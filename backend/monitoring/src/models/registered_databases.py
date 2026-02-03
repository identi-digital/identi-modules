from dataclasses import dataclass
from sqlalchemy import Column, String, Text, TIMESTAMP, func, text
from sqlalchemy.dialects.postgresql import UUID, JSONB

from core.models.base_class import Model

@dataclass
class RegisteredDatabaseModel(Model):
    """ RegisteredDatabaseModel """
    
    __tablename__ = "registered_databases"
    __table_args__ = {"schema": "public", "extend_existing": True}
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    db_key = Column(Text, nullable=False, info={"display_name": "Clave DB", "description": "clave de la base de datos"})
    uri = Column(Text, nullable=False, info={"display_name": "URI", "description": "uri de la base de datos"})
    type = Column(String(50), nullable=False, info={"display_name": "Tipo", "description": "tipo de base de datos"})  # postgres, mongo
    config = Column(JSONB, nullable=True, info={"display_name": "Configuración", "description": "configuracion de la base de datos"})
    
    def __init__(self, **kwargs):
        super(RegisteredDatabaseModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)

