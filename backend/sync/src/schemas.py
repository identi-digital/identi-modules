"""
Schemas Pydantic para el módulo sync.
"""
from pydantic import BaseModel
from typing import Dict, Any, Optional


class SyncStatusResponse(BaseModel):
    """Respuesta con el estado de un cliente Parse."""
    database_key: str
    server_url: Optional[str]
    app_id: Optional[str]
    initialized: bool
    connected: bool


class SyncObjectRequest(BaseModel):
    """Request para sincronizar un objeto."""
    object_data: Dict[str, Any]


class SyncObjectResponse(BaseModel):
    """Respuesta de sincronización de objeto."""
    success: bool
    data: Optional[Dict[str, Any]] = None
