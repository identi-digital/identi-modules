"""
Rutas para gestión de archivos en storage
"""
from fastapi import APIRouter, Depends, Request, HTTPException, Query
from typing import Optional
from uuid import UUID

from .schemas import (
    PresignedUploadResponse,
    PresignedDownloadResponse,
    MediaCreate,
    MediaUpdate,
    MediaResponse,
    PaginatedMediaResponse
)

router = APIRouter(
    prefix="/storage",
    tags=["Storage"]
)


def get_storage(request: Request):
    """Obtiene el servicio de storage desde el container (para operaciones de S3)"""
    container = request.app.state.container
    try:
        # Verificar primero si el storage está registrado
        if "storage" not in container.builders.get("modules", {}):
            raise HTTPException(
                status_code=500,
                detail="Servicio de storage no está registrado en el contenedor. Verifica que el módulo de storage se haya cargado correctamente."
            )
        
        # Intentar obtener el storage (esto ejecutará el lambda y puede fallar si faltan credenciales)
        storage = container.get("storage")
        if not storage:
            raise HTTPException(
                status_code=500,
                detail="Servicio de storage no disponible"
            )
        return storage
    except ValueError as e:
        error_msg = str(e)
        # Si el error menciona credenciales, dar un mensaje más específico
        if "Credenciales" in error_msg or "AWS_S3" in error_msg:
            raise HTTPException(
                status_code=500,
                detail=f"Error de configuración de S3: {error_msg}. Verifica que las variables de entorno AWS_S3_ACCESS_KEY_ID, AWS_S3_SECRET_ACCESS_KEY y AWS_S3_BUCKET estén configuradas en tu archivo .env o variables de entorno."
            )
        # Si la clave no está registrada
        raise HTTPException(
            status_code=500,
            detail=f"Servicio de storage no registrado en el contenedor: {error_msg}. Asegúrate de que el módulo de storage se haya cargado correctamente."
        )
    except Exception as e:
        error_msg = str(e)
        # Si el error menciona credenciales, dar un mensaje más específico
        if "Credenciales" in error_msg or "AWS_S3" in error_msg:
            raise HTTPException(
                status_code=500,
                detail=f"Error de configuración de S3: {error_msg}. Verifica que las variables de entorno AWS_S3_ACCESS_KEY_ID, AWS_S3_SECRET_ACCESS_KEY y AWS_S3_BUCKET estén configuradas en tu archivo .env o variables de entorno."
            )
        # Si hay un error al inicializar el storage
        raise HTTPException(
            status_code=500,
            detail=f"Error al inicializar el servicio de storage: {error_msg}"
        )


def get_funcionalities(request: Request):
    """Obtiene el servicio de functionalities desde el container (para operaciones de medias en DB)"""
    container = request.app.state.container
    return container.get("storage_s3")


# ========== Rutas para Presigned URLs (S3) ==========

@router.get("/presigned-upload/{object_name:path}", response_model=PresignedUploadResponse)
async def get_presigned_upload_url(
    object_name: str,
    expiration: int = Query(3600, ge=1, le=604800, description="Tiempo de expiración en segundos (máximo 7 días)"),
    file_type: Optional[str] = Query("application/octet-stream", description="Tipo MIME del archivo"),
    storage=Depends(get_storage)
):
    """
    Obtiene una URL pre-firmada para subir un archivo al storage.
    
    El cliente puede usar esta URL para subir archivos directamente a S3 sin pasar por el servidor.
    """
    try:
        url = storage.get_presigned_url(
            object_name=object_name,
            expiration=expiration,
            is_download=False,
            file_type=file_type
        )
        
        return PresignedUploadResponse(
            success=True,
            url=url,
            expiration=expiration,
            object_name=object_name
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar URL pre-firmada para upload: {str(e)}"
        )


@router.get("/presigned-download/{object_name:path}", response_model=PresignedDownloadResponse)
async def get_presigned_download_url(
    object_name: str,
    expiration: int = Query(3600, ge=1, le=604800, description="Tiempo de expiración en segundos (máximo 7 días)"),
    storage=Depends(get_storage)
):
    """
    Obtiene una URL pre-firmada para descargar un archivo del storage.
    
    El cliente puede usar esta URL para descargar archivos directamente desde S3 sin pasar por el servidor.
    """
    try:
        url = storage.get_presigned_url(
            object_name=object_name,
            expiration=expiration,
            is_download=True
        )
        
        return PresignedDownloadResponse(
            success=True,
            url=url,
            expiration=expiration,
            object_name=object_name
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar URL pre-firmada para download: {str(e)}"
        )


# ========== Rutas para Gestión de Medias (Base de datos) ==========

@router.post("/medias", response_model=MediaResponse, status_code=201)
def create_media(media_data: MediaCreate, svc=Depends(get_funcionalities)):
    """
    Registra un nuevo media en la base de datos.
    
    El media representa un archivo almacenado en S3.
    Recibe:
    - key: Ruta/key del archivo en S3
    - display_name: Nombre descriptivo del archivo
    - type: Tipo MIME del archivo (opcional)
    - size: Tamaño del archivo en bytes (opcional)
    """
    try:
        return svc.create_media(media_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/medias/{media_id}", response_model=MediaResponse)
def get_media(media_id: UUID, svc=Depends(get_funcionalities)):
    """
    Obtiene un media por su ID.
    
    Devuelve toda la información del media incluyendo:
    - id, display_name, path (key en S3), type, size
    - Fechas de creación, actualización y deshabilitación
    """
    media = svc.get_media_by_id(media_id)
    if not media:
        raise HTTPException(status_code=404, detail="Media no encontrado")
    return media


@router.get("/medias", response_model=PaginatedMediaResponse)
def get_medias(
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar (display_name, created_at, size)"),
    order: Optional[str] = Query("desc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda"),
    svc=Depends(get_funcionalities)
):
    """
    Obtiene una lista paginada de medias.
    
    Permite filtrar por búsqueda de texto en display_name, path y type.
    """
    return svc.get_medias_paginated(page=page, per_page=per_page, sort_by=sort_by, order=order, search=search)


@router.put("/medias/{media_id}", response_model=MediaResponse)
def update_media(
    media_id: UUID,
    media_data: MediaUpdate,
    svc=Depends(get_funcionalities)
):
    """
    Actualiza un media existente.
    
    Permite actualizar display_name, type y size.
    """
    media = svc.update_media(media_id, media_data)
    if not media:
        raise HTTPException(status_code=404, detail="Media no encontrado")
    return media


@router.delete("/medias/{media_id}", status_code=204)
def delete_media(media_id: UUID, svc=Depends(get_funcionalities)):
    """
    Elimina (deshabilita) un media.
    
    Realiza un borrado lógico estableciendo disabled_at.
    """
    success = svc.delete_media(media_id)
    if not success:
        raise HTTPException(status_code=404, detail="Media no encontrado")
    return None
