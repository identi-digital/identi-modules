from dataclasses import dataclass
from sqlalchemy import Column, TIMESTAMP, func, text, ForeignKey, Numeric, Index
from sqlalchemy.dialects.postgresql import UUID

from core.models.base_class import Model

@dataclass
class LotNetWeightHistoryModel(Model):
    """ LotNetWeightHistoryModel - Historial de cambios de peso neto de lotes """
    
    __tablename__ = "lot_net_weight_history"
    __table_args__ = (
        Index('idx_lot_net_weight_history_lot', 'lot_id'),
        Index('idx_lot_net_weight_history_identity', 'identity_id'),
        {"schema": "public", "extend_existing": True}
    )
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    lot_id = Column(UUID(as_uuid=True), ForeignKey('public.lots.id'), nullable=False, info={"display_name": "Lote", "description": "id del lote"})
    last_net_weight = Column(Numeric(precision=15, scale=2), nullable=True, info={"display_name": "Peso Neto Anterior", "description": "peso neto anterior del lote en kg"})
    new_net_weight = Column(Numeric(precision=15, scale=2), nullable=False, info={"display_name": "Peso Neto Nuevo", "description": "peso neto nuevo del lote en kg"})
    identity_id = Column(UUID(as_uuid=True), ForeignKey('public.identities.id'), nullable=True, info={"display_name": "Identidad", "description": "identidad que realizó el cambio"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    def __init__(self, **kwargs):
        super(LotNetWeightHistoryModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)
