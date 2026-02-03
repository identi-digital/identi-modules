from dataclasses import dataclass
from sqlalchemy import Column, String, Numeric, TIMESTAMP, func, text, Index
from sqlalchemy.dialects.postgresql import UUID

from core.models.base_class import Model

@dataclass
class StoreCenterModel(Model):
    """ StoreCenterModel """
    
    __tablename__ = "store_centers"
    __table_args__ = (
        Index('idx_store_centers_disabled_at', 'disabled_at'),
        {"schema": "public", "extend_existing": True}
    )
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    name: str = Column(String(255), nullable=False, info={"display_name": "Nombre", "description": "nombre del centro de almacenamiento"})
    capacity_kg = Column(Numeric(precision=15, scale=2), nullable=False, info={"display_name": "Capacidad (kg)", "description": "capacidad máxima del almacén en kilogramos"})
    code: str = Column(String(100), nullable=True, info={"display_name": "Código", "description": "código interno o identificador corto del centro de almacenamiento"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.current_timestamp())
    disabled_at = Column(TIMESTAMP, nullable=True, default=None)
    
    def __init__(self, **kwargs):
        super(StoreCenterModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)
