from dataclasses import dataclass
from sqlalchemy import Column, String, Text, TIMESTAMP, ForeignKey, Boolean, Integer, ARRAY, func, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import Enum as SQLEnum
import enum

from core.models.base_class import Model

class SchemaFormType(enum.Enum):
    LINEAR = "linear"
    BRANCHING = "branching"

@dataclass
class SchemaFormModel(Model):
    """ SchemaFormModel """
    
    __tablename__ = "schema_forms"
    __table_args__ = {"schema": "public", "extend_existing": True}
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    form_id = Column(UUID(as_uuid=True),
                     ForeignKey('public.forms.id'),
                     nullable=False,
                     info={"display_name": "Formulario", "description": "formulario del schema"})
    schema = Column(JSONB, nullable=False, info={"display_name": "Schema", "description": "schema del formulario"})
    
    created_at = Column(TIMESTAMP, server_default=func.now())

    def __init__(self, **kwargs):
        super(SchemaFormModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)

