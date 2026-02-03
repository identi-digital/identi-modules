from fastapi import APIRouter, Depends, Request, HTTPException, Query
from fastapi.responses import StreamingResponse
from uuid import UUID
from typing import Optional
from .schemas import (
    StoreCenterCreate, StoreCenterUpdate, StoreCenterResponse, PaginatedStoreCenterResponse,
    StoreMovementCreate, StoreMovementUpdate, StoreMovementResponse, PaginatedStoreMovementResponse,
    WarehouseSummaryResponse
)

router = APIRouter(
    prefix="/warehouse",
    tags=["Warehouse"]
)

def get_funcionalities(request: Request):
    container = request.app.state.container
    return container.get("warehouse")

# ========== STORE CENTER ROUTES ==========
@router.post("/store-centers", response_model=StoreCenterResponse, status_code=201)
def create_store_center(center_data: StoreCenterCreate, svc=Depends(get_funcionalities)):
    """Crea un nuevo centro de almacenamiento"""
    try:
        return svc.create_store_center(center_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/store-centers", response_model=PaginatedStoreCenterResponse)
def get_store_centers(
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda"),
    svc=Depends(get_funcionalities)
):
    """Obtiene una lista paginada de centros de almacenamiento"""
    return svc.get_store_centers_paginated(page=page, per_page=per_page, sort_by=sort_by, order=order, search=search)

@router.get("/store-centers/{center_id}", response_model=StoreCenterResponse)
def get_store_center(center_id: UUID, svc=Depends(get_funcionalities)):
    """Obtiene un centro de almacenamiento específico por ID"""
    center = svc.get_store_center_by_id(center_id)
    if not center:
        raise HTTPException(status_code=404, detail="Centro de almacenamiento no encontrado")
    return center

@router.put("/store-centers/{center_id}", response_model=StoreCenterResponse)
def update_store_center(
    center_id: UUID,
    center_data: StoreCenterUpdate,
    svc=Depends(get_funcionalities)
):
    """Actualiza un centro de almacenamiento existente"""
    center = svc.update_store_center(center_id, center_data)
    if not center:
        raise HTTPException(status_code=404, detail="Centro de almacenamiento no encontrado")
    return center

@router.delete("/store-centers/{center_id}", response_model=StoreCenterResponse)
def disable_store_center(center_id: UUID, svc=Depends(get_funcionalities)):
    """Deshabilita un centro de almacenamiento"""
    center = svc.disable_store_center(center_id)
    if not center:
        raise HTTPException(status_code=404, detail="Centro de almacenamiento no encontrado")
    return center

@router.post("/store-centers/{center_id}/restore", response_model=StoreCenterResponse)
def restore_store_center(center_id: UUID, svc=Depends(get_funcionalities)):
    """Restaura un centro de almacenamiento deshabilitado"""
    center = svc.restore_store_center(center_id)
    if not center:
        raise HTTPException(status_code=404, detail="Centro de almacenamiento no encontrado o no está deshabilitado")
    return center

@router.get("/store-centers/export/excel")
def export_store_centers_to_excel(
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda"),
    svc=Depends(get_funcionalities)
):
    """
    Descarga en Excel todos los centros de almacenamiento.
    
    **Columnas incluidas:**
    - Nombre
    - Código
    - Capacidad (kg)
    - Cantidad de Lotes
    - Fecha de Creación
    
    **Filtros:**
    - **search**: Busca por nombre o código
    - **sort_by**: Ordena por nombre, code, capacity_kg, lots_count
    - **order**: asc (ascendente) o desc (descendente)
    
    Los datos son idénticos a los mostrados en la paginación (sin IDs).
    """
    excel_file = svc.export_store_centers_to_excel(
        sort_by=sort_by,
        order=order,
        search=search
    )
    
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"centros_almacenamiento_{timestamp}.xlsx"
    
    return StreamingResponse(
        excel_file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.get("/summary", response_model=WarehouseSummaryResponse)
def get_warehouse_summary(
    store_center_id: Optional[UUID] = Query(None, description="ID del centro de almacenamiento (opcional, si no se proporciona devuelve el resumen de todos)"),
    svc=Depends(get_funcionalities)
):
    """
    Obtiene el resumen de almacén con métricas de lotes.
    
    **Métricas incluidas:**
    - **active_lots**: Lotes activos en el/los almacén(es)
    - **last_lot**: Último lote registrado (UUID)
    - **stock_lots**: Lotes en stock
    - **total_lots**: Cantidad total de lotes en el/los almacén(es)
    - **kg_total**: Sumatoria de kilos de todos los lotes
    - **total**: Total de costo de todos los lotes (suma de compras)
    
    **Filtro opcional:**
    - **store_center_id**: Si se proporciona, devuelve el resumen solo de ese almacén
    - Si no se proporciona, devuelve el resumen de todos los almacenes
    """
    return svc.get_warehouse_summary(store_center_id=store_center_id)

# ========== STORE MOVEMENT ROUTES ==========
@router.post("/store-movements", response_model=StoreMovementResponse, status_code=201)
def create_store_movement(movement_data: StoreMovementCreate, svc=Depends(get_funcionalities)):
    """Crea un nuevo movimiento de almacén"""
    try:
        return svc.create_store_movement(movement_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/store-movements", response_model=PaginatedStoreMovementResponse)
def get_store_movements(
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar"),
    order: Optional[str] = Query("desc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda (UUID de lot_id, store_center_id o identity_id)"),
    svc=Depends(get_funcionalities)
):
    """Obtiene una lista paginada de movimientos de almacén"""
    return svc.get_store_movements_paginated(page=page, per_page=per_page, sort_by=sort_by, order=order, search=search)

@router.get("/store-movements/{movement_id}", response_model=StoreMovementResponse)
def get_store_movement(movement_id: UUID, svc=Depends(get_funcionalities)):
    """Obtiene un movimiento de almacén específico por ID"""
    movement = svc.get_store_movement_by_id(movement_id)
    if not movement:
        raise HTTPException(status_code=404, detail="Movimiento de almacén no encontrado")
    return movement

@router.put("/store-movements/{movement_id}", response_model=StoreMovementResponse)
def update_store_movement(
    movement_id: UUID,
    movement_data: StoreMovementUpdate,
    svc=Depends(get_funcionalities)
):
    """Actualiza un movimiento de almacén existente"""
    movement = svc.update_store_movement(movement_id, movement_data)
    if not movement:
        raise HTTPException(status_code=404, detail="Movimiento de almacén no encontrado")
    return movement
