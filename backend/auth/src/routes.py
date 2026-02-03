"""
Módulo auth - APIs para gestión de identidades.
"""
from fastapi import APIRouter, Depends, Request, HTTPException, Query
from uuid import UUID
from typing import Optional
from .schemas import (
    IdentityCreate, IdentityUpdate, IdentityResponse, PaginatedIdentityResponse
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


def get_functionalities(request: Request):
    """Obtiene el servicio de auth desde el container"""
    container = request.app.state.container
    return container.get("auth")


@router.post("/identities", response_model=IdentityResponse, status_code=201)
def create_identity(
    identity_data: IdentityCreate,
    svc=Depends(get_functionalities)
):
    """
    Crea una nueva identidad o devuelve la existente si ya tiene ese EID.
    
    Comportamiento:
    - Si se proporciona EID y ya existe una identidad con ese EID: devuelve la identidad existente
    - Si no existe: crea una nueva identidad y la devuelve
    
    Esto evita duplicados por EID y facilita la integración con sistemas externos.
    """
    try:
        return svc.create_identity(identity_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/identities", response_model=PaginatedIdentityResponse)
def get_identities(
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda"),
    svc=Depends(get_functionalities)
):
    """Lista todas las identidades paginadas"""
    return svc.get_identities(page=page, per_page=per_page, sort_by=sort_by, order=order, search=search)


@router.get("/identities/{identity_id}", response_model=IdentityResponse)
def get_identity(
    identity_id: UUID,
    svc=Depends(get_functionalities)
):
    """Obtiene una identidad por ID"""
    identity = svc.get_identity(identity_id)
    if not identity:
        raise HTTPException(status_code=404, detail="Identidad no encontrada")
    return identity


@router.get("/identities/by-eid/{eid}", response_model=IdentityResponse)
def get_identity_by_eid(
    eid: str,
    svc=Depends(get_functionalities)
):
    """Obtiene una identidad por EID (identificador externo)"""
    identity = svc.get_identity_by_eid(eid)
    if not identity:
        raise HTTPException(status_code=404, detail=f"Identidad con EID {eid} no encontrada")
    return identity


@router.put("/identities/{identity_id}", response_model=IdentityResponse)
def update_identity(
    identity_id: UUID,
    identity_data: IdentityUpdate,
    svc=Depends(get_functionalities)
):
    """Actualiza una identidad existente"""
    identity = svc.update_identity(identity_id, identity_data)
    if not identity:
        raise HTTPException(status_code=404, detail="Identidad no encontrada")
    return identity
