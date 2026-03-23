"""
Rutas del módulo sync: integración con el servicio sync (schemas + Parse CRUD).
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from typing import Any, Optional

from modules.sync.src.service import SyncService, SyncServiceError
from modules.sync.src.schemas import SchemaClassesUpdate

router = APIRouter(prefix="/sync", tags=["sync"])


def get_sync_service(request: Request) -> SyncService:
    """Obtiene el servicio sync desde el container (app.state.container)."""
    container = getattr(request.app.state, "container", None)
    if not container:
        raise HTTPException(status_code=503, detail="Container no disponible")
    try:
        return container.get("sync", "modules")
    except ValueError:
        raise HTTPException(status_code=503, detail="Servicio sync no registrado")


# --- Schema (actualizar / listar clases) ---

@router.get("/schema/classes", summary="Lista clases registradas en sync")
def get_schema_classes(service: SyncService = Depends(get_sync_service)):
    """Obtiene la lista de clases actualmente registradas en el servicio sync."""
    try:
        return service.get_schema_classes()
    except SyncServiceError as e:
        raise HTTPException(status_code=e.status_code or 502, detail=e.message)


@router.put("/schema/classes", summary="Actualizar clases en sync")
def update_schema_classes(body: SchemaClassesUpdate, service: SyncService = Depends(get_sync_service)):
    """
    Notifica al servicio sync las clases a registrar (p. ej. tras migraciones).
    El sync registrará beforeSave para las nuevas clases.
    """
    try:
        return service.update_schema_classes(body.classNames)
    except SyncServiceError as e:
        raise HTTPException(status_code=e.status_code or 502, detail=e.message)


# --- Parse: leer / escribir / actualizar datos ---

@router.get(
    "/parse/classes/{class_name}",
    summary="Listar objetos de una clase Parse",
)
def parse_list(
    class_name: str,
    limit: int = Query(100, ge=1, le=1000),
    skip: int = Query(0, ge=0),
    where: Optional[str] = Query(None, description="JSON where clause"),
    service: SyncService = Depends(get_sync_service),
):
    """Lista objetos de la clase Parse (query con where, limit, skip)."""
    import json
    where_dict = json.loads(where) if where else None
    try:
        return service.parse_get_class(class_name, where=where_dict, limit=limit, skip=skip)
    except SyncServiceError as e:
        raise HTTPException(status_code=e.status_code or 502, detail=e.message)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="'where' debe ser JSON válido")


@router.get(
    "/parse/classes/{class_name}/{object_id}",
    summary="Obtener un objeto Parse por id",
)
def parse_get_one(
    class_name: str,
    object_id: str,
    service: SyncService = Depends(get_sync_service),
):
    """Obtiene un objeto de Parse por class name y objectId."""
    try:
        return service.parse_get_one(class_name, object_id)
    except SyncServiceError as e:
        raise HTTPException(status_code=e.status_code or 502, detail=e.message)


@router.post(
    "/parse/classes/{class_name}",
    summary="Crear objeto en Parse",
)
def parse_create(
    class_name: str,
    body: dict[str, Any],
    service: SyncService = Depends(get_sync_service),
):
    """Crea un nuevo objeto en la clase Parse."""
    try:
        return service.parse_create(class_name, body)
    except SyncServiceError as e:
        raise HTTPException(status_code=e.status_code or 502, detail=e.message)


@router.post(
    "/parse/classes/{class_name}/bulk",
    summary="Subir varios objetos a Parse (crear en lote)",
)
def parse_bulk_create(
    class_name: str,
    body: list[dict[str, Any]],
    service: SyncService = Depends(get_sync_service),
):
    """Crea varios objetos en la clase Parse. Body: lista de objetos (cada uno con sus campos)."""
    if not isinstance(body, list) or len(body) > 100:
        raise HTTPException(status_code=400, detail="Body debe ser una lista de hasta 100 objetos")
    try:
        return service.parse_bulk_create(class_name, body)
    except SyncServiceError as e:
        raise HTTPException(status_code=e.status_code or 502, detail=e.message)


@router.put(
    "/parse/classes/{class_name}/{object_id}",
    summary="Actualizar objeto en Parse",
)
def parse_update(
    class_name: str,
    object_id: str,
    body: dict[str, Any],
    service: SyncService = Depends(get_sync_service),
):
    """Actualiza un objeto en Parse (campos enviados en body)."""
    try:
        return service.parse_update(class_name, object_id, body)
    except SyncServiceError as e:
        raise HTTPException(status_code=e.status_code or 502, detail=e.message)


@router.delete(
    "/parse/classes/{class_name}/{object_id}",
    summary="Eliminar objeto en Parse",
)
def parse_delete(
    class_name: str,
    object_id: str,
    service: SyncService = Depends(get_sync_service),
):
    """Elimina un objeto en Parse."""
    try:
        return service.parse_delete(class_name, object_id)
    except SyncServiceError as e:
        raise HTTPException(status_code=e.status_code or 502, detail=e.message)
