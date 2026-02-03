from dataclasses import dataclass
from sqlalchemy import Column, String, Text, TIMESTAMP, func, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from core.models.base_class import Model

@dataclass
class PlotSectionModel(Model):
    """ PlotSectionModel """
    
    __tablename__ = "plot_sections"
    __table_args__ = {"schema": "public", "extend_existing": True}
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    plot_id = Column(UUID(as_uuid=True), ForeignKey('public.farm_plots.id'), nullable=False, info={"display_name": "Lote", "description": "lote de la sección"})
    name: str = Column(String(100), info={"display_name": "Nombre", "description": "nombre de la sección"})
    description: str = Column(Text, info={"display_name": "Descripción", "description": "descripcion de la sección"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.current_timestamp())
    disabled_at = Column(TIMESTAMP, nullable=True, default=None)
    
    def __init__(self, **kwargs):
        super(PlotSectionModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)

