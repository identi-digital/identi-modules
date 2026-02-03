from dataclasses import dataclass
from sqlalchemy import Column, String, TIMESTAMP, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from core.models.base_class import Model

@dataclass
class PlotCropModel(Model):
    """ PlotCropModel - Relación entre parcelas y cultivos """
    
    __tablename__ = "plot_crops"
    __table_args__ = {"schema": "public", "extend_existing": True}
    
    plot_id = Column(UUID(as_uuid=True), ForeignKey('public.farm_plots.id'), primary_key=True, info={"display_name": "Lote", "description": "lote del cultivo"})
    crop_id = Column(String(12), ForeignKey('public.crops.id'), primary_key=True, info={"display_name": "Cultivo", "description": "cultivo del lote"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    disabled_at = Column(TIMESTAMP, nullable=True, default=None)
    
    __mapper_args__ = {
        'primary_key': [plot_id, crop_id]
    }
    
    def __init__(self, **kwargs):
        super(PlotCropModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash((self.plot_id, self.crop_id))

