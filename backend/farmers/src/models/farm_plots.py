from dataclasses import dataclass
from sqlalchemy import Column, String, Text, TIMESTAMP, func, text, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from core.models.base_class import Model
@dataclass
class FarmPlotModel(Model):
  """ FarmPlotModel """

  __tablename__ = "farm_plots"
  __table_args__ = {"schema": "public", "extend_existing": True}
  
  id = Column(UUID(as_uuid=True),
                 primary_key=True,
                 server_default=text('uuid_generate_v4()'),
                 unique=True,
                 nullable=False)
  farm_id = Column(UUID(as_uuid=True), ForeignKey('public.farms.id'), info={"display_name": "Parcela", "description": "parcela del lote"})
  geometry = Column(Geometry('POLYGON', srid=4326), info={"display_name": "Geometría", "description": "geometria del lote"})
  name: str = Column(String(50), info={"display_name": "Nombre", "description": "nombre del lote"})
  description: str = Column(Text, info={"display_name": "Descripción", "description": "descripcion del lote"})
  created_at = Column(TIMESTAMP, server_default=func.now())
  updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.current_timestamp())
  disabled_at = Column(TIMESTAMP, nullable=True, default=None)
  
  def __init__(self, **kwargs):
    super(FarmPlotModel, self).__init__(**kwargs)

  def __hash__(self):
    return hash(self.id)

  