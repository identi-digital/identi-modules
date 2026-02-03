from dataclasses import dataclass
from sqlalchemy import Column, String, Numeric, TIMESTAMP, func, text, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.dialects.postgresql import UUID
import enum

from core.models.base_class import Model

class PurchasePresentationEnum(enum.Enum):
    BABA = "baba"
    SECO = "seco"
    FRUTA = "fruta"
    
class PaymentMethodEnum(enum.Enum):
    contado = "contado"
    credito = "crédito"
    transferencia = "transferencia"

@dataclass
class PurchaseModel(Model):
    """ PurchaseModel """
    
    __tablename__ = "purchases"
    __table_args__ = (
        Index('idx_purchases_lot', 'lot_id'),
        Index('idx_purchases_disabled_at', 'disabled_at'),
        {"schema": "public", "extend_existing": True}
    )
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    lot_id = Column(UUID(as_uuid=True), ForeignKey('public.lots.id'), nullable=False, info={"display_name": "Lote", "description": "id del lote"})
    farmer_id = Column(UUID(as_uuid=True), ForeignKey('public.farmers.id'), nullable=False, info={"display_name": "Productor", "description": "id del productor"})
    farm_id = Column(UUID(as_uuid=True), ForeignKey('public.farms.id'), nullable=False, info={"display_name": "Parcela", "description": "id de la parcela"})
    gatherer_id = Column(UUID(as_uuid=True), ForeignKey('public.gatherers.id'), nullable=False, info={"display_name": "Acopiador", "description": "id del acopiador"})
    quantity = Column(Numeric(precision=15, scale=2), nullable=False, info={"display_name": "Cantidad", "description": "cantidad comprada"})
    price = Column(Numeric(precision=15, scale=2), nullable=False, info={"display_name": "Precio", "description": "precio unitario"})
    presentation = Column(SQLEnum(PurchasePresentationEnum, name='purchase_presentation_enum', values_callable=lambda x: [e.value for e in x]), nullable=False, info={"display_name": "Presentación", "description": "presentación de la compra"})
    payment_method = Column(SQLEnum(PaymentMethodEnum, name='purchase_payment_method_enum', values_callable=lambda x: [e.value for e in x]), nullable=False, info={"display_name": "Método de Pago", "description": "método de pago"})
    purchase_date = Column(TIMESTAMP, nullable=False, info={"display_name": "Fecha de Compra", "description": "fecha de la compra"})
    ticket_number: str = Column(String(100), nullable=True, info={"display_name": "Número de Ticket", "description": "número de ticket de la compra"})
    gathering_center_id = Column(UUID(as_uuid=True), ForeignKey('public.gathering_centers.id'), nullable=True, info={"display_name": "Centro de Acopio", "description": "id del centro de acopio"})
    identity_id = Column(UUID(as_uuid=True), ForeignKey('public.identities.id'), nullable=False, info={"display_name": "Identidad", "description": "id de la identidad asociada"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.current_timestamp())
    disabled_at = Column(TIMESTAMP, nullable=True, default=None)
    
    def __init__(self, **kwargs):
        super(PurchaseModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)
