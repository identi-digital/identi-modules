from dataclasses import dataclass
from sqlalchemy import Column, String, TIMESTAMP, func, text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID

from core.models.base_class import Model

@dataclass
class LotProcessHistoryModel(Model):
    """ LotProcessHistoryModel """
    
    __tablename__ = "lot_process_history"
    __table_args__ = (
        Index('idx_lph_lot', 'lot_id'),
        {"schema": "public", "extend_existing": True}
    )
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    lot_id = Column(UUID(as_uuid=True), ForeignKey('public.lots.id'), nullable=False, info={"display_name": "Lote", "description": "id del lote"})
    process: str = Column(String(100), nullable=False, info={"display_name": "Proceso", "description": "proceso del lote"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    def __init__(self, **kwargs):
        super(LotProcessHistoryModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)
