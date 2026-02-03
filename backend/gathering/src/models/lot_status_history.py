from dataclasses import dataclass
from sqlalchemy import Column, String, TIMESTAMP, func, text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID

from core.models.base_class import Model

@dataclass
class LotStatusHistoryModel(Model):
    """ LotStatusHistoryModel """
    
    __tablename__ = "lot_status_history"
    __table_args__ = (
        Index('idx_lsh_lot', 'lot_id'),
        {"schema": "public", "extend_existing": True}
    )
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    lot_id = Column(UUID(as_uuid=True), ForeignKey('public.lots.id'), nullable=False, info={"display_name": "Lote", "description": "id del lote"})
    status: str = Column(String(100), nullable=False, info={"display_name": "Estado", "description": "estado del lote"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    def __init__(self, **kwargs):
        super(LotStatusHistoryModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)
