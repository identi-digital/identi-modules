from dataclasses import dataclass
from sqlalchemy import Column, String, TIMESTAMP, func, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from core.models.base_class import Model
@dataclass
class FarmCropModel(Model):
  """ FarmCropModel """

  __tablename__ = "farm_crops"
  __table_args__ = {"schema": "public", "extend_existing": True}
  
  farm_id = Column(UUID(as_uuid=True), ForeignKey('public.farms.id'), primary_key=True, info={"display_name": "Parcela", "description": "parcela del cultivo"})
  crop_id = Column(String(12), ForeignKey('public.crops.id'), primary_key=True, info={"display_name": "Cultivo", "description": "cultivo de la parcela"})
  is_principal = Column(Boolean, nullable=False, default=False, server_default='false', info={"display_name": "Es Principal", "description": "indica si es el cultivo principal de la parcela"})
  created_at = Column(TIMESTAMP, server_default=func.now())
  disabled_at = Column(TIMESTAMP, nullable=True, default=None)
  
  __mapper_args__ = {
        'primary_key':[farm_id, crop_id]
    }
  
  def __init__(self, **kwargs):
    super(FarmCropModel, self).__init__(**kwargs)

  def __hash__(self):
    return hash(self.id)

  