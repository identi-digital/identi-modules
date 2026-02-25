"""
Schemas para las rutas de storage
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


# Schemas para presigned URLs
class PresignedUploadResponse(BaseModel):
    """Respuesta al obtener una URL pre-firmada para subir"""
    success: bool
    url: str
    expiration: int
    key: str


class PresignedDownloadResponse(BaseModel):
    """Respuesta al obtener una URL pre-firmada para descargar"""
    success: bool
    url: str
    expiration: int
    object_name: str


# Schemas para gestión de medias
class MediaCreate(BaseModel):
    """Schema para crear un nuevo media"""
    key: str  # Ruta/key del archivo en S3
    display_name: str
    type: Optional[str] = None  # MIME type
    size: Optional[int] = None  # Tamaño en bytes

class MediaUpdate(BaseModel):
    """Schema para actualizar un media"""
    display_name: Optional[str] = None
    type: Optional[str] = None
    size: Optional[int] = None

class MediaResponse(BaseModel):
    """Schema de respuesta para un media"""
    id: UUID
    display_name: str
    path: str
    type: Optional[str]
    size: Optional[int]
    created_at: datetime
    updated_at: datetime
    disabled_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class PaginatedMediaResponse(BaseModel):
    """Schema para respuesta paginada de medias"""
    items: list[MediaResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
