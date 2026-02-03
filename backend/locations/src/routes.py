from fastapi import APIRouter, Depends, Request, Query
from typing import Optional
from .schemas import (
    PaginatedCountryResponse, PaginatedDepartmentResponse,
    PaginatedProvinceResponse, PaginatedDistrictResponse
)

router = APIRouter(
    prefix="/locations",
    tags=["Locations"]
)

def get_funcionalities(request: Request):
    container = request.app.state.container
    return container.get("locations")

@router.get("/countries", response_model=PaginatedCountryResponse)
def get_countries(
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda"),
    svc=Depends(get_funcionalities)
):
    """Obtiene una lista paginada de countries"""
    return svc.get_countries_paginated(page=page, per_page=per_page, sort_by=sort_by, order=order, search=search)

@router.get("/departments", response_model=PaginatedDepartmentResponse)
def get_departments(
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda"),
    svc=Depends(get_funcionalities)
):
    """Obtiene una lista paginada de departments"""
    return svc.get_departments_paginated(page=page, per_page=per_page, sort_by=sort_by, order=order, search=search)

@router.get("/provinces", response_model=PaginatedProvinceResponse)
def get_provinces(
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda"),
    svc=Depends(get_funcionalities)
):
    """Obtiene una lista paginada de provinces"""
    return svc.get_provinces_paginated(page=page, per_page=per_page, sort_by=sort_by, order=order, search=search)

@router.get("/districts", response_model=PaginatedDistrictResponse)
def get_districts(
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda"),
    svc=Depends(get_funcionalities)
):
    """Obtiene una lista paginada de districts"""
    return svc.get_districts_paginated(page=page, per_page=per_page, sort_by=sort_by, order=order, search=search)

