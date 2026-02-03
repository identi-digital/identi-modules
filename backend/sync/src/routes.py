"""
Rutas API para el módulo sync.
"""
from fastapi import APIRouter, Depends, Request
from typing import Dict, Any, Optional, List
from .schemas import SyncStatusResponse, SyncObjectRequest, SyncObjectResponse

router = APIRouter(prefix="/sync", tags=["sync"])


def get_sync_manager(request: Request):
    """
    Dependency para obtener el SyncManager desde el container.
    """
    container = request.app.state.container
    return container.get("sync", "modules")


def get_auth_token(request: Request) -> Optional[str]:
    """
    Extrae el token de autenticación del header Authorization.
    
    Returns:
        Token de autenticación o None si no está presente
    """
    authorization = request.headers.get("Authorization")
    if not authorization:
        return None
    
    # Soporta tanto "Bearer <token>" como "Identi <token>"
    if authorization.startswith("Bearer "):
        return authorization.replace("Bearer ", "").strip()
    elif authorization.startswith("Identi "):
        return authorization.replace("Identi ", "").strip()
    
    return None


@router.get("/status", response_model=Dict[str, SyncStatusResponse])
async def get_sync_status(sync_manager=Depends(get_sync_manager)):
    """
    Obtiene el estado de todos los clientes Parse.
    """
    status = sync_manager.get_all_clients_status()
    return status


@router.post("/{database_key}/{class_name}", response_model=SyncObjectResponse)
async def sync_object(
    database_key: str,
    class_name: str,
    request: SyncObjectRequest,
    sync_manager=Depends(get_sync_manager),
    token: Optional[str] = Depends(get_auth_token)
):
    """
    Sincroniza un objeto con Parse Server usando token de autenticación.
    """
    result = sync_manager.sync_object(database_key, class_name, request.object_data, token=token)
    return SyncObjectResponse(success=result is not None, data=result)


@router.get("/{database_key}/{class_name}", response_model=List[Dict[str, Any]])
async def query_objects(
    database_key: str,
    class_name: str,
    filters: Optional[Dict[str, Any]] = None,
    sync_manager=Depends(get_sync_manager),
    token: Optional[str] = Depends(get_auth_token)
):
    """
    Consulta objetos desde Parse Server usando token de autenticación.
    """
    return sync_manager.query_objects(database_key, class_name, filters, token=token)
