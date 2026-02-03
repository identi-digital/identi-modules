from dataclasses import dataclass
from sqlalchemy import Column, String, Text, TIMESTAMP, func, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from core.models.base_class import Model

@dataclass
class ProvinceModel(Model):
    """ ProvinceModel """

    __tablename__ = "provinces"
    __table_args__ = {"schema": "public", "extend_existing": True}
    
    id = Column(String(12),
                 primary_key=True,
                 server_default=text("to_hex(FLOOR(EXTRACT(epoch FROM NOW())*10000)::bigint)"),
                 unique=True,
                 nullable=False)
    name: str = Column(String(100), nullable=False, info={"display_name": "Nombre", "description": "nombre de la provincia"})
    description: str = Column(Text, nullable=True, info={"display_name": "Descripción", "description": "descripcion de la provincia"})
    department_id = Column(String(12), ForeignKey('public.departments.id'), nullable=False, info={"display_name": "Departamento", "description": "departamento de la provincia"})
    center_point = Column(Geometry('POINT', srid=4326), nullable=True, info={"display_name": "Punto Central", "description": "punto central de la provincia"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.current_timestamp())
    disabled_at = Column(TIMESTAMP, nullable=True, default=None)
    
    def __init__(self, **kwargs):
        super(ProvinceModel, self).__init__(**kwargs)

    def __hash__(self):
        return hash(self.id)

