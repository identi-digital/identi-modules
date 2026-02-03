from dataclasses import dataclass
from sqlalchemy import Column, TIMESTAMP, func, text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID

from core.models.base_class import Model

@dataclass
class LotCertificationModel(Model):
    """ LotCertificationModel """
    
    __tablename__ = "lot_certifications"
    __table_args__ = (
        Index('uq_lot_certification_active', 'lot_id', 'certification_id', unique=True, postgresql_where=text('disabled_at IS NULL')),
        {"schema": "public", "extend_existing": True}
    )
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    lot_id = Column(UUID(as_uuid=True), ForeignKey('public.lots.id'), nullable=False, info={"display_name": "Lote", "description": "id del lote"})
    certification_id = Column(UUID(as_uuid=True), ForeignKey('public.certifications.id'), nullable=False, info={"display_name": "Certificación", "description": "id de la certificación"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    disabled_at = Column(TIMESTAMP, nullable=True, default=None)
    
    def __init__(self, **kwargs):
        super(LotCertificationModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)
