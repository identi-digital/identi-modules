from dataclasses import dataclass
from sqlalchemy import Column, String, Text, TIMESTAMP, ForeignKey, ARRAY, func, text, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import Enum as SQLEnum
from geoalchemy2 import Geometry
import enum

from core.models.base_class import Model

class RegisterStatus(enum.Enum):
    success = "success"
    failed = "failed"
    partial = "partial"
    cancelled = "cancelled"

@dataclass
class CoreRegisterModel(Model):
    """ CoreRegisterModel """
    
    __tablename__ = "core_registers"
    __table_args__ = {"schema": "public", "extend_existing": True}
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    form_id = Column(UUID(as_uuid=True),
                     ForeignKey('public.forms.id'),
                     nullable=False,
                     info={"display_name": "Formulario", "description": "formulario del registro"})
    schema_form_id = Column(UUID(as_uuid=True),
                            ForeignKey('public.schema_forms.id'),
                            nullable=False,
                            info={"display_name": "Schema Form", "description": "schema form del registro"})
    detail = Column(ARRAY(JSONB), nullable=True, info={"display_name": "Detalle", "description": "detalle del registro"})  # array[dict] - Datos finales capturados
    status = Column(SQLEnum(RegisterStatus, name='register_status', values_callable=lambda x: [e.value for e in x]), nullable=False, info={"display_name": "Estado", "description": "estado del registro"})
    error = Column(JSONB, nullable=True, info={"display_name": "Error", "description": "error del registro"})  # dict | null - Información del error
    location = Column(Geometry(geometry_type='GEOMETRY', srid=4326), nullable=True, info={"display_name": "Ubicación", "description": "ubicacion del registro"})  # Puede ser POINT, LINESTRING, POLYGON, etc.
    entity_name = Column(String(255), nullable=True, info={"display_name": "Entidad", "description": "entidad del registro"})  # Nombre de la entidad relacionada
    entity_id = Column(UUID(as_uuid=True), nullable=True, info={"display_name": "ID Entidad", "description": "id de la entidad del registro"})  # ID de la entidad relacionada
    identity_id = Column(UUID(as_uuid=True), ForeignKey('public.identities.id'), nullable=True, info={"display_name": "Usuario", "description": "usuario quien registra"})
    duration = Column(Numeric(precision=10, scale=3), nullable=True, info={"display_name": "Duración", "description": "tiempo que demoró el registro en segundos"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.current_timestamp())
    disabled_at = Column(TIMESTAMP, nullable=True, default=None)
    
    def __init__(self, **kwargs):
        super(CoreRegisterModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)

