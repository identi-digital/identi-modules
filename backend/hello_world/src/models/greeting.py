"""
Modelo de ejemplo - Greeting

📚 Documentación: docs/BACKEND_MODULE_GUIDE.md
"""
from core.models.base_class import Model
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import text

class GreetingModel(Model):
    """
    Modelo de ejemplo para almacenar saludos
    
    Este es un modelo básico que demuestra cómo crear modelos
    en Identi Plugin System.
    """
    __tablename__ = "greetings"
    
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text('uuid_generate_v4()')
    )
    message = Column(String(255), nullable=False)
    language = Column(String(50), nullable=True, default='es')
    created_at = Column(DateTime, server_default=text('now()'))
    updated_at = Column(DateTime, server_default=text('now()'), onupdate=text('now()'))
    disabled_at = Column(DateTime, nullable=True)
    
    def __hash__(self):
        return hash(self.id)

