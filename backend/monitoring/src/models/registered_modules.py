from dataclasses import dataclass
from sqlalchemy import Column, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import UUID

from core.models.base_class import Model

@dataclass
class RegisteredModuleModel(Model):
    """ RegisteredModuleModel """
    
    __tablename__ = "registered_modules"
    __table_args__ = {"schema": "public", "extend_existing": True}
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    
    def __init__(self, **kwargs):
        super(RegisteredModuleModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)

