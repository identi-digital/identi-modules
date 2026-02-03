from dataclasses import dataclass
from sqlalchemy import Column, Numeric, TIMESTAMP, func, text, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.dialects.postgresql import UUID
import enum

from core.models.base_class import Model

class StoreMovementTypeEnum(enum.Enum):
    INGRESO = "ingreso"
    SALIDA = "salida"

@dataclass
class StoreMovementModel(Model):
    """ StoreMovementModel """
    
    __tablename__ = "store_movement"
    __table_args__ = (
        Index('idx_store_movement_lot', 'lot_id'),
        Index('idx_store_movement_store_center', 'store_center_id'),
        Index('idx_store_movement_identity', 'identity_id'),
        {"schema": "public", "extend_existing": True}
    )
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    lot_id = Column(UUID(as_uuid=True), ForeignKey('public.lots.id'), nullable=False, info={"display_name": "Lote", "description": "id del lote asociado al movimiento"})
    store_center_id = Column(UUID(as_uuid=True), ForeignKey('public.store_centers.id'), nullable=False, info={"display_name": "Centro de Almacenamiento", "description": "id del centro de almacenamiento donde ocurre el movimiento"})
    type_movement = Column(SQLEnum(StoreMovementTypeEnum, name='store_movement_type_enum', values_callable=lambda x: [e.value for e in x]), nullable=False, info={"display_name": "Tipo de Movimiento", "description": "tipo de movimiento de inventario"})
    weight_kg = Column(Numeric(precision=15, scale=2), nullable=False, info={"display_name": "Peso (kg)", "description": "peso del producto involucrado en el movimiento, expresado en kilogramos"})
    identity_id = Column(UUID(as_uuid=True), ForeignKey('public.identities.id'), nullable=False, info={"display_name": "Identidad", "description": "id de la identidad responsable o asociada al movimiento"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    def __init__(self, **kwargs):
        super(StoreMovementModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)
