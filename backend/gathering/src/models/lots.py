from dataclasses import dataclass
from sqlalchemy import Column, String, TIMESTAMP, func, text, ForeignKey, Enum as SQLEnum, Index, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import enum

from core.models.base_class import Model

class ProductTypeEnum(enum.Enum):
    CONVENCIONAL = "convencional"
    ORGANICO = "orgánico"

class CurrentStatusTypeEnum(enum.Enum):
    ACTIVO = "activo"
    EN_STOCK = "en stock"

class CurrentProcessTypeEnum(enum.Enum):
    BABA = "baba"
    FERMENTADO = "fermentado"
    SECADO = "secado"
    SECO = "seco"

@dataclass
class LotModel(Model):
    """ LotModel """
    
    __tablename__ = "lots"
    __table_args__ = (
        Index('idx_lots_disabled_at', 'disabled_at'),
        {"schema": "public", "extend_existing": True}
    )
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    name: str = Column(String(255), nullable=False, info={"display_name": "Nombre", "description": "nombre del lote"})
    gathering_center_id = Column(UUID(as_uuid=True), ForeignKey('public.gathering_centers.id'), nullable=False, info={"display_name": "Centro de Acopio", "description": "id del centro de acopio"})
    product_type = Column(SQLEnum(ProductTypeEnum, name='product_type_enum', values_callable=lambda x: [e.value for e in x]), nullable=False, info={"display_name": "Tipo de Producto", "description": "tipo de producto"})
    current_status = Column(SQLEnum(CurrentStatusTypeEnum, name='current_status_type_enum', values_callable=lambda x: [e.value for e in x]), nullable=False, info={"display_name": "Estado Actual", "description": "estado actual del lote"})
    current_process = Column(SQLEnum(CurrentProcessTypeEnum, name='current_process_type_enum', values_callable=lambda x: [e.value for e in x]), nullable=False, info={"display_name": "Proceso Actual", "description": "proceso actual del lote"})
    current_store_center_id = Column(UUID(as_uuid=True), ForeignKey('public.store_centers.id'), nullable=True, info={"display_name": "Centro de Almacenamiento", "description": "id del centro de almacenamiento actual"})
    gatherer_id = Column(UUID(as_uuid=True), ForeignKey('public.gatherers.id'), nullable=True, info={"display_name": "Acopiador", "description": "id del acopiador responsable del lote"})
    net_weight = Column(Numeric(precision=15, scale=2), nullable=True, info={"display_name": "Peso Neto", "description": "peso neto del lote en kg"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.current_timestamp())
    disabled_at = Column(TIMESTAMP, nullable=True, default=None)
    # Relación many-to-many con Crops a través de la tabla farm_crops
    certifications = relationship('CertificationModel', secondary='public.lot_certifications', info={"display_name": "Certificaciones", "description": "certificaciones del lote"})
  

    def __init__(self, **kwargs):
        super(LotModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)
