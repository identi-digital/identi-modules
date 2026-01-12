"""
Schemas Pydantic para el módulo Hello World

📚 Documentación: docs/BACKEND_MODULE_GUIDE.md
"""
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class GreetingCreate(BaseModel):
    """Schema para crear un saludo"""
    message: str
    language: Optional[str] = 'es'

class GreetingUpdate(BaseModel):
    """Schema para actualizar un saludo"""
    message: Optional[str] = None
    language: Optional[str] = None

class GreetingResponse(BaseModel):
    """Schema de respuesta para un saludo"""
    id: UUID
    message: str
    language: Optional[str]
    created_at: datetime
    updated_at: datetime
    disabled_at: Optional[datetime]
    
    class Config:
        from_attributes = True

