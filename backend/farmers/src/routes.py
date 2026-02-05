from fastapi import APIRouter, Depends, Request, HTTPException, Query
from uuid import UUID
from typing import Optional
from modules.data_collector.src.schemas import PaginatedCoreRegisterResponse
from .schemas import (
    FarmerCreate, FarmerUpdate, FarmerResponse, PaginatedResponse,
    PlotResponse, PlotUpdate, CropResponse, PaginatedCropResponse,
    PlotSectionCreate, PlotSectionUpdate, PlotSectionResponse,
    FarmResponse, PaginatedFarmResponse, FarmGeometryUpload, FarmGeometryResponse,
    FarmUpdate
)

router = APIRouter(
    prefix="/farmers",
    tags=["Farmers"]
)

def get_funcionalities(request: Request):
    container = request.app.state.container
    return container.get("farmers")

def get_auth_token(request: Request) -> Optional[str]:
    """
    Extrae el token de autenticación del header Authorization.
    
    Returns:
        Token completo de autenticación (incluyendo prefijo Bearer/Identi) o None si no está presente
    """
    authorization = request.headers.get("Authorization")
    if not authorization:
        return None
    return authorization


@router.post("/", response_model=FarmerResponse, status_code=201)
def create_farmer(farmer_data: FarmerCreate, svc=Depends(get_funcionalities)):
    """Crea un nuevo farmer"""
    try:
        return svc.create_farmer(farmer_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=PaginatedResponse)
def get_farmers(
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar (first_name, last_name, dni, created_at, last_visit_date, status)"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda"),
    status: Optional[str] = Query("todos", description="Filtro de estado: 'activos', 'inactivos' o 'todos'"),
    svc=Depends(get_funcionalities)
):
    """
    Obtiene una lista paginada de farmers con fecha última visita y estado.
    
    Columnas adicionales:
    - last_visit_date: Fecha del último formulario (core_register) donde el farmer participó en el detail con type_value='entity'
    - status: "activo" si la última visita fue hace menos de 15 días, "inactivo" en caso contrario
    
    Filtros:
    - status: 'activo' (solo activos), 'inactivo' (solo inactivos)
    """
    # Si status es "todos", pasarlo como None para no aplicar filtro
    status_param = None if status == "todos" else status
    return svc.get_farmers_paginated(page=page, per_page=per_page, sort_by=sort_by, order=order, search=search, status=status_param)

@router.get("/{farmer_id}", response_model=FarmerResponse)
def get_farmer(farmer_id: UUID, svc=Depends(get_funcionalities)):
    """Obtiene un farmer específico por ID"""
    farmer = svc.get_farmer_by_id(farmer_id)
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer no encontrado")
    return farmer

@router.patch("/{farmer_id}", response_model=FarmerResponse)
def update_farmer(
    farmer_id: UUID,
    farmer_data: FarmerUpdate,
    svc=Depends(get_funcionalities)
):
    """Actualiza un farmer existente"""
    farmer = svc.update_farmer(farmer_id, farmer_data)
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer no encontrado")
    return farmer

@router.delete("/{farmer_id}", status_code=204)
def delete_farmer(farmer_id: UUID, svc=Depends(get_funcionalities)):
    """Elimina un farmer (deshabilitado lógico)"""
    success = svc.delete_farmer(farmer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Farmer no encontrado")
    return None

# Farm routes
@router.get("/{farmer_id}/farms", response_model=PaginatedFarmResponse)
def get_farms_by_farmer(
    farmer_id: UUID,
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar"),
    order: Optional[str] = Query("desc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda"),
    svc=Depends(get_funcionalities),
    token: Optional[str] = Depends(get_auth_token)
):
    """Obtiene una lista paginada de farms de un farmer. La geometría se devuelve en formato GeoJSON."""
    return svc.get_farms_by_farmer_paginated(farmer_id, page=page, per_page=per_page, sort_by=sort_by, order=order, search=search, token=token)

@router.patch("/farms/{farm_id}", response_model=FarmResponse)
def update_farm(
    farm_id: UUID,
    farm_data: FarmUpdate,
    svc=Depends(get_funcionalities),
    token: Optional[str] = Depends(get_auth_token)
):
    """Actualiza un farm existente"""
    farm = svc.patch_farms(farm_id, farm_data, token=token)
    if not farm:
        raise HTTPException(status_code=404, detail="Farm no encontrada")
@router.post("/farms/{farm_id}/geometry", response_model=FarmGeometryResponse)
def upload_farm_geometry(
    farm_id: UUID,
    geometry_data: FarmGeometryUpload,
    svc=Depends(get_funcionalities),
    token: Optional[str] = Depends(get_auth_token)
):
    """
    Sube un polígono (geometría) para una farm en formato GeoJSON FeatureCollection.
    
    **IMPORTANTE**: El GeoJSON debe ser de tipo `FeatureCollection` con al menos una feature.
    La geometría de la feature puede ser Polygon o MultiPolygon.
    
    Comportamiento según is_principal:
    - Si `is_principal=True`: guarda en tabla `farms` campo `geometry` (MultiPolygon)
      - Si se envía Polygon, se convierte automáticamente a MultiPolygon
      - **Automáticamente envía el polígono a GFW para análisis de deforestación**
    - Si `is_principal=False`: crea un nuevo registro en tabla `farm_plots` (Polygon)
      - Si se envía MultiPolygon, toma el primer polígono
      - Requiere opcionalmente `name` y `description`
    
    La geometría se transforma internamente y se devuelve en formato GeoJSON.
    """
    try:
        return svc.upload_farm_geometry(farm_id, geometry_data, token=token)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Plot routes
@router.get("/{farmer_id}/plots", response_model=list[PlotResponse])
def get_plots_by_farmer(farmer_id: UUID, svc=Depends(get_funcionalities)):
    """Lista todas las parcelas de un agricultor"""
    return svc.get_plots_by_farmer(farmer_id)

@router.get("/plots/{plot_id}", response_model=PlotResponse)
def get_plot(plot_id: UUID, svc=Depends(get_funcionalities)):
    """Obtiene el detalle de una parcela"""
    plot = svc.get_plot_by_id(plot_id)
    if not plot:
        raise HTTPException(status_code=404, detail="Parcela no encontrada")
    return plot

@router.put("/plots/{plot_id}", response_model=PlotResponse)
def update_plot(
    plot_id: UUID,
    plot_data: PlotUpdate,
    svc=Depends(get_funcionalities)
):
    """Actualiza los datos de una parcela"""
    plot = svc.update_plot(plot_id, plot_data)
    if not plot:
        raise HTTPException(status_code=404, detail="Parcela no encontrada")
    return plot

@router.delete("/plots/{plot_id}", status_code=204)
def delete_plot(plot_id: UUID, svc=Depends(get_funcionalities)):
    """Elimina una parcela (deshabilitado lógico)"""
    success = svc.delete_plot(plot_id)
    if not success:
        raise HTTPException(status_code=404, detail="Parcela no encontrada")
    return None

# Crop routes
@router.get("/crops", response_model=PaginatedCropResponse)
def get_crops(
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda"),
    svc=Depends(get_funcionalities)
):
    """Lista todos los cultivos paginados"""
    return svc.get_crops(page=page, per_page=per_page, sort_by=sort_by, order=order, search=search)

@router.get("/plots/{plot_id}/crops", response_model=list[CropResponse])
def get_crops_by_plot(plot_id: UUID, svc=Depends(get_funcionalities)):
    """Obtiene los cultivos de una parcela"""
    return svc.get_crops_by_plot(plot_id)

# Plot Section routes
@router.post("/plots/{plot_id}/sections", response_model=PlotSectionResponse, status_code=201)
def create_plot_section(
    plot_id: UUID,
    section_data: PlotSectionCreate,
    svc=Depends(get_funcionalities)
):
    """Agrega una nueva sección a una parcela"""
    try:
        return svc.create_plot_section(plot_id, section_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/plots/{plot_id}/sections", response_model=list[PlotSectionResponse])
def get_plot_sections(plot_id: UUID, svc=Depends(get_funcionalities)):
    """Obtiene todas las secciones de una parcela"""
    return svc.get_plot_sections(plot_id)

@router.put("/plots/{plot_id}/sections/{section_id}", response_model=PlotSectionResponse)
def update_plot_section(
    plot_id: UUID,
    section_id: UUID,
    section_data: PlotSectionUpdate,
    svc=Depends(get_funcionalities)
):
    """Actualiza una sección de parcela"""
    section = svc.update_plot_section(plot_id, section_id, section_data)
    if not section:
        raise HTTPException(status_code=404, detail="Sección no encontrada")
    return section

@router.delete("/plots/{plot_id}/sections/{section_id}", status_code=204)
def delete_plot_section(plot_id: UUID, section_id: UUID, svc=Depends(get_funcionalities)):
    """Elimina una sección de parcela (deshabilitado lógico)"""
    success = svc.delete_plot_section(plot_id, section_id)
    if not success:
        raise HTTPException(status_code=404, detail="Sección no encontrada")
    return None

# Core Register routes
@router.get("/{farmer_id}/registers", response_model=PaginatedCoreRegisterResponse)
def get_registers_by_farmer(
    farmer_id: UUID,
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar"),
    order: Optional[str] = Query("desc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda (UUID o entity_name)"),
    svc=Depends(get_funcionalities)
):
    """
    Obtiene todos los registros de core_registers donde entity_id coincide con farmer_id.
    
    Filtra los registros de la tabla core_registers donde entity_id = farmer_id.
    """
    return svc.get_registers_by_farmer(
        farmer_id=farmer_id,
        page=page,
        per_page=per_page,
        sort_by=sort_by,
        order=order,
        search=search
    )