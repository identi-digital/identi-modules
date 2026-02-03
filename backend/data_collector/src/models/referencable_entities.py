from dataclasses import dataclass
from sqlalchemy import Column, String, Text, TIMESTAMP, func, text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID

from core.models.base_class import Model


@dataclass
class ReferencableEntityModel(Model):
    """ ReferencableEntityModel - Almacena entidades que pueden ser referenciadas por otros módulos """
    
    __tablename__ = "referencable_entities"
    __table_args__ = (
        UniqueConstraint('module_name', 'entity_name', name='uq_referencable_entity_module_entity'),
        {"schema": "public", "extend_existing": True}
    )
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    module_name = Column(String(255), nullable=False, 
                        info={"display_name": "Módulo", "description": "nombre del módulo al que pertenece la entidad"})
    entity_name = Column(String(255), nullable=False,
                         info={"display_name": "Entidad", "description": "nombre de la entidad (tabla)"})
    display_name = Column(String(255), nullable=True,
                         info={"display_name": "Nombre para mostrar", "description": "nombre amigable de la entidad"})
    description = Column(Text, nullable=True,
                         info={"display_name": "Descripción", "description": "descripción de la entidad"})
    representative_value = Column(Text, nullable=True,
                                 info={"display_name": "Valor representativo", "description": "plantilla para mostrar el valor representativo de la entidad (ej: {{first_name}} {{last_name}})"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.current_timestamp())
    disabled_at = Column(TIMESTAMP, nullable=True, default=None)
    
    def __init__(self, **kwargs):
        super(ReferencableEntityModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)
