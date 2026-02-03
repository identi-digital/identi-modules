from dataclasses import dataclass
from sqlalchemy import Column, String, Text, TIMESTAMP, func, text
from sqlalchemy.dialects.postgresql import UUID

from core.models.base_class import Model

@dataclass
class GatheringCenterModel(Model):
    """ GatheringCenterModel """
    
    __tablename__ = "gathering_centers"
    __table_args__ = {"schema": "public", "extend_existing": True}
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    name: str = Column(String(255), nullable=False, info={"display_name": "Nombre", "description": "nombre del centro de acopio"})
    description: str = Column(Text, nullable=True, info={"display_name": "Descripción", "description": "descripción del centro de acopio"})
    code: str = Column(String(100), nullable=True, info={"display_name": "Código", "description": "código del centro de acopio"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.current_timestamp())
    disabled_at = Column(TIMESTAMP, nullable=True, default=None)
    
    def __init__(self, **kwargs):
        super(GatheringCenterModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)
