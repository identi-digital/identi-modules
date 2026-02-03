from dataclasses import dataclass
from sqlalchemy import Column, String, Text, TIMESTAMP, ARRAY, func, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import Enum as SQLEnum
import enum

from core.models.base_class import Model

class ChannelType(enum.Enum):
    WSP = "wsp"
    SMS = "sms"
    CALL = "call"
    WEB = "web"

@dataclass
class ActionToolModel(Model):
    """ ActionToolModel """
    
    __tablename__ = "action_tools"
    __table_args__ = {"schema": "public", "extend_existing": True}
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    category_name = Column(String(255), nullable=True, info={"display_name": "Categoría", "description": "categoria de la tool"})
    sub_category_name = Column(String(255), nullable=True, info={"display_name": "Subcategoría", "description": "subcategoria de la tool"})
    channels = Column(ARRAY(SQLEnum(ChannelType, name='channel_type', values_callable=lambda x: [e.value for e in x])), nullable=True, info={"display_name": "Canales", "description": "canales de la tool"})
    name = Column(String(255), nullable=False, info={"display_name": "Nombre", "description": "nombre de la tool"})
    description = Column(Text, nullable=True, info={"display_name": "Descripción", "description": "descripcion de la tool"})
    place_holder = Column(Text, nullable=True, info={"display_name": "Placeholder", "description": "placeholder de la tool"})
    place_holder_icon = Column(String(255), nullable=True, info={"display_name": "Icono Placeholder", "description": "icono placeholder de la tool"})
    icon = Column(String(255), nullable=True, info={"display_name": "Icono", "description": "icono de la tool"})
    color = Column(String(50), nullable=True, info={"display_name": "Color", "description": "color de la tool"})
    on_action = Column(JSONB, nullable=True, info={"display_name": "Acción", "description": "accion de la tool"})  # dict con lógica de éxito, error y condiciones
    schema_variables = Column(ARRAY(JSONB), nullable=True, info={"display_name": "Variables", "description": "variables de la tool"})  # array[dict]
    schema_input = Column(ARRAY(JSONB), nullable=True, info={"display_name": "Inputs", "description": "inputs de la tool"})  # array[dict]
    config_form = Column(JSONB, nullable=True, info={"display_name": "Configuración", "description": "configuracion de la tool"})  # dict con configuración avanzada
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.current_timestamp())
    disabled_at = Column(TIMESTAMP, nullable=True, default=None)
    
    def __init__(self, **kwargs):
        super(ActionToolModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)

