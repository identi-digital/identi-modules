from dataclasses import dataclass
from sqlalchemy import Column, String, TIMESTAMP, func, text
from core.models.base_class import Model
@dataclass
class CropModel(Model):
  """ CropModel """

  __tablename__ = "crops"
  __table_args__ = {"schema": "public", "extend_existing": True}
  
  id = Column(String(12),
                 primary_key=True,
                 server_default=text("to_hex(FLOOR(EXTRACT(epoch FROM NOW())*10000)::bigint)"),
                 unique=True,
                 nullable=False)
  name: str = Column(String(50), info={"display_name": "Nombre", "description": "nombre del cultivo"})
  crop_type: str = Column(String(50), info={"display_name": "Tipo de Cultivo", "description": "tipo de cultivo"})
  created_at = Column(TIMESTAMP, server_default=func.now())
  updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.current_timestamp())
  disabled_at = Column(TIMESTAMP, nullable=True, default=None)
  
  def __init__(self, **kwargs):
    super(CropModel, self).__init__(**kwargs)

  def __hash__(self):
    return hash(self.id)

  