from dataclasses import dataclass
from sqlalchemy import Column, Numeric, TIMESTAMP, func, text, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.dialects.postgresql import UUID
import enum

from core.models.base_class import Model

class BalanceMovementTypeEnum(enum.Enum):
    PURCHASE = "purchase"
    RECHARGE = "recharge"

@dataclass
class BalanceMovementModel(Model):
    """ BalanceMovementModel """
    
    __tablename__ = "balance_movements"
    __table_args__ = (
        Index('idx_bm_center', 'gathering_center_id'),
        Index('idx_bm_purchase', 'purchase_id'),
        Index('idx_bm_disabled_at', 'disabled_at'),
        {"schema": "public", "extend_existing": True}
    )
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    gathering_center_id = Column(UUID(as_uuid=True), ForeignKey('public.gathering_centers.id'), nullable=False, info={"display_name": "Centro de Acopio", "description": "id del centro de acopio"})
    gatherer_id = Column(UUID(as_uuid=True), ForeignKey('public.gatherers.id'), nullable=True, info={"display_name": "Acopiador", "description": "id del acopiador"})
    type_movement = Column(SQLEnum(BalanceMovementTypeEnum, name='balance_movement_type_enum', values_callable=lambda x: [e.value for e in x]), nullable=False, info={"display_name": "Tipo de Movimiento", "description": "tipo de movimiento de balance"})
    purchase_id = Column(UUID(as_uuid=True), ForeignKey('public.purchases.id'), nullable=True, info={"display_name": "Compra", "description": "id de la compra relacionada"})
    ammount = Column(Numeric(precision=15, scale=2), nullable=False, info={"display_name": "Monto", "description": "monto del movimiento"})
    identity_id = Column(UUID(as_uuid=True), ForeignKey('public.identities.id'), nullable=False, info={"display_name": "Identidad", "description": "id de la identidad que realizó el movimiento"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    disabled_at = Column(TIMESTAMP, nullable=True, default=None)
    
    def __init__(self, **kwargs):
        super(BalanceMovementModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)
