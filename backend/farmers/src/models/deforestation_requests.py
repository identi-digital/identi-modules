from dataclasses import dataclass
from sqlalchemy import Column, String, TIMESTAMP, func, text, ForeignKey, Numeric, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
import enum
from core.models.base_class import Model

class DeforestationRequestStatusEnum(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    REJECTED = "rejected"

@dataclass
class DeforestationRequestModel(Model):
    """ DeforestationRequestModel """

    __tablename__ = "deforestation_requests"
    __table_args__ = {"schema": "public", "extend_existing": True}
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    farm_id = Column(UUID(as_uuid=True), ForeignKey('public.farms.id'), nullable=False, info={"display_name": "Parcela", "description": "parcela relacionada a la solicitud"})
    request_id = Column(UUID(as_uuid=True), nullable=False, unique=True, info={"display_name": "ID de Solicitud", "description": "identificador único de la solicitud"})
    status = Column(SQLEnum(DeforestationRequestStatusEnum, name='deforestation_request_status_enum', values_callable=lambda x: [e.value for e in x]), nullable=False, default=DeforestationRequestStatusEnum.PENDING, server_default='pending', info={"display_name": "Estado", "description": "estado de la solicitud"})
    natural_forest_loss_ha = Column(Numeric(15, 2), nullable=True, info={"display_name": "Pérdida de Bosque Natural (ha)", "description": "pérdida de bosque natural en hectáreas"})
    natural_forest_coverage_ha = Column(Numeric(15, 2), nullable=True, info={"display_name": "Cobertura de Bosque Natural (ha)", "description": "cobertura de bosque natural en hectáreas"})
    data_source = Column(JSONB, nullable=True, info={"display_name": "Fuente de Datos", "description": "datos fuente en formato JSON"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.current_timestamp())
    disabled_at = Column(TIMESTAMP, nullable=True, default=None)
    
    def __init__(self, **kwargs):
        super(DeforestationRequestModel, self).__init__(**kwargs)

    def __hash__(self):
        return hash(self.id)
