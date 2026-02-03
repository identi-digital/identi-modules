from dataclasses import dataclass
from sqlalchemy import Column, String, Text, TIMESTAMP, ForeignKey, Enum as SQLEnum, ARRAY, func, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
import enum

from core.models.base_class import Model

class ChannelName(enum.Enum):
    wsp = "wsp"
    call = "call"
    sms = "sms"
    identi_connect = "identi connect"

class FormType(enum.Enum):
    linear = "linear"
    branching = "branching"

class ViewerType(enum.Enum):
    app = "app"
    web = "web"

class FormPurpose(enum.Enum):
    entity = "entity"
    free = "free"
    complementary = "complementary"

@dataclass
class FormModel(Model):
    """ FormModel """
    
    __tablename__ = "forms"
    __table_args__ = {"schema": "public", "extend_existing": True}
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    channel_name = Column(SQLEnum(ChannelName, name='channel_name', values_callable=lambda x: [e.value for e in x]), nullable=False, info={"display_name": "Canal", "description": "canal del formulario"})
    flow_type = Column(SQLEnum(FormType, name='form_type', values_callable=lambda x: [e.value for e in x]), nullable=False, info={"display_name": "Tipo de Flujo", "description": "tipo de flujo del formulario"})
    name = Column(String(255), nullable=False, info={"display_name": "Nombre", "description": "nombre del formulario"})
    image_path = Column(Text, nullable=True, info={"display_name": "Ruta de Imagen", "description": "ruta de la imagen del formulario"})
    description = Column(Text, nullable=True, info={"display_name": "Descripción", "description": "descripcion del formulario"})
    schema_id = Column(UUID(as_uuid=True),
                       ForeignKey('public.schema_forms.id'),
                       nullable=True,
                       info={"display_name": "Schema", "description": "schema del formulario"})
    viewer = Column(ARRAY(SQLEnum(ViewerType, name='viewer_type', values_callable=lambda x: [e.value for e in x])), nullable=True, info={"display_name": "Visor", "description": "visor del formulario"})
    gps_tracking = Column(JSONB, nullable=True, info={"display_name": "Seguimiento GPS", "description": "seguimiento gps del formulario"})
    entity_name = Column(String(255), nullable=True, info={"display_name": "Entidad", "description": "entidad del formulario"})
    form_purpose = Column(SQLEnum(FormPurpose, name='form_purpose', values_callable=lambda x: [e.value for e in x]), nullable=True, info={"display_name": "Propósito", "description": "proposito del formulario"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.current_timestamp())
    disabled_at = Column(TIMESTAMP, nullable=True, default=None)
    
    def __init__(self, **kwargs):
        super(FormModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)

