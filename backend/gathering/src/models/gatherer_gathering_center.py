from dataclasses import dataclass
from sqlalchemy import Column, TIMESTAMP, func, text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID

from core.models.base_class import Model

@dataclass
class GathererGatheringCenterModel(Model):
    """ GathererGatheringCenterModel """
    
    __tablename__ = "gatherer_gathering_center"
    __table_args__ = (
        Index('uq_ggc_active', 'gatherer_id', 'gathering_center_id', unique=True, postgresql_where=text('disabled_at IS NULL')),
        {"schema": "public", "extend_existing": True}
    )
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    gatherer_id = Column(UUID(as_uuid=True), ForeignKey('public.gatherers.id'), nullable=False, info={"display_name": "Acopiador", "description": "id del acopiador"})
    gathering_center_id = Column(UUID(as_uuid=True), ForeignKey('public.gathering_centers.id'), nullable=False, info={"display_name": "Centro de Acopio", "description": "id del centro de acopio"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    disabled_at = Column(TIMESTAMP, nullable=True, default=None)
    
    def __init__(self, **kwargs):
        super(GathererGatheringCenterModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)
