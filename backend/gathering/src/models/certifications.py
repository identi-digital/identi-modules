from dataclasses import dataclass
from sqlalchemy import Column, String, TIMESTAMP, func, text, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
import enum

from core.models.base_class import Model

class CertificationCodeEnum(enum.Enum):
    NOP = "nop"
    FLO = "flo"
    EU = "eu"
    RA = "ra"
    RTPO = "rtpo"
    BS = "bs"

@dataclass
class CertificationModel(Model):
    """ CertificationModel """
    
    __tablename__ = "certifications"
    __table_args__ = (
        UniqueConstraint('code', name='uq_certifications_code'),
        {"schema": "public", "extend_existing": True}
    )
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    name: str = Column(String(255), nullable=False, info={"display_name": "Nombre", "description": "nombre de la certificación"})
    code = Column(SQLEnum(CertificationCodeEnum, name='certification_code_enum', values_callable=lambda x: [e.value for e in x]), nullable=False, info={"display_name": "Código", "description": "código de la certificación"})
    disabled_at = Column(TIMESTAMP, nullable=True, default=None)
    
    def __init__(self, **kwargs):
        super(CertificationModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)
