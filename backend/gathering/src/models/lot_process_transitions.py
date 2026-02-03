from dataclasses import dataclass
from sqlalchemy import Column, String, TIMESTAMP, func, text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID

from core.models.base_class import Model

@dataclass
class LotProcessTransitionModel(Model):
    """ LotProcessTransitionModel """
    
    __tablename__ = "lot_process_transitions"
    __table_args__ = (
        Index('idx_lpt_lot', 'lot_id'),
        {"schema": "public", "extend_existing": True}
    )
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    lot_id = Column(UUID(as_uuid=True), ForeignKey('public.lots.id'), nullable=False, info={"display_name": "Lote", "description": "id del lote"})
    last_process: str = Column(String(100), nullable=False, info={"display_name": "Proceso Anterior", "description": "proceso anterior del lote"})
    new_process: str = Column(String(100), nullable=False, info={"display_name": "Nuevo Proceso", "description": "nuevo proceso del lote"})
    identity_id = Column(UUID(as_uuid=True), ForeignKey('public.identities.id'), nullable=False, info={"display_name": "Identidad", "description": "id de la identidad que realizó la transición"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    def __init__(self, **kwargs):
        super(LotProcessTransitionModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)
