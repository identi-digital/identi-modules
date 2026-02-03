from dataclasses import dataclass
from sqlalchemy import Column, String, Text, TIMESTAMP, func, text, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from core.models.base_class import Model
@dataclass
class FarmModel(Model):
  """ FarmModel """

  __tablename__ = "farms"
  __table_args__ = {"schema": "public", "extend_existing": True}
  
  id = Column(UUID(as_uuid=True),
                 primary_key=True,
                 server_default=text('uuid_generate_v4()'),
                 unique=True,
                 nullable=False)
  farmer_id: str = Column(UUID(as_uuid=True), ForeignKey('public.farmers.id'), info={"display_name": "Productor", "description": "productor de la parcela"})
  name: str = Column(String(50), info={"display_name": "Nombre", "description": "nombre de la parcela"})
  total_area: float = Column(Numeric(10,2), info={"display_name": "Área Total", "description": "area total de la parcela"})
  cultivated_area: float = Column(Numeric(10,2), info={"display_name": "Área Cultivada", "description": "area cultivada de la parcela"})
  geometry = Column(Geometry('MULTIPOLYGON', srid=4326), info={"display_name": "Geometría", "description": "geometria de la parcela"})
  latitude: float = Column(Numeric(10,2), info={"display_name": "Latitud", "description": "latitud de la parcela"})
  longitude: float = Column(Numeric(10,2), info={"display_name": "Longitud", "description": "longitud de la parcela"})
  country_id: str = Column(String(12), ForeignKey('public.countries.id'), info={"display_name": "País", "description": "pais de la parcela"})
  department_id: str = Column(String(12), ForeignKey('public.departments.id'), info={"display_name": "Departamento", "description": "departamento de la parcela"})
  province_id: str = Column(String(12), ForeignKey('public.provinces.id'), info={"display_name": "Provincia", "description": "provincia de la parcela"})
  district_id: str = Column(String(12), ForeignKey('public.districts.id'), info={"display_name": "Distrito", "description": "distrito de la parcela"})
  created_at = Column(TIMESTAMP, server_default=func.now())
  updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.current_timestamp())
  disabled_at = Column(TIMESTAMP, nullable=True, default=None)
  
  # Relación many-to-many con Crops a través de la tabla farm_crops
  crops = relationship('CropModel', secondary='public.farm_crops', info={"display_name": "Cultivos", "description": "cultivos de la parcela"})
  
  def __init__(self, **kwargs):
    super(FarmModel, self).__init__(**kwargs)

  def __hash__(self):
    return hash(self.id)

  