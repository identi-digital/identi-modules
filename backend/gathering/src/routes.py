from fastapi import APIRouter, Depends, Request, HTTPException, Query
from fastapi.responses import StreamingResponse
from uuid import UUID
from typing import Optional, List
import jwt
from .models.gathering_centers import GatheringCenterModel
from .schemas import (
    LotCreate, LotUpdate, LotResponse, LotListItemResponse, PaginatedLotListResponse,
    GatheringCenterCreate, GatheringCenterUpdate, GatheringCenterResponse, PaginatedGatheringCenterResponse,
    GathererGatheringCenterCreate, GathererGatheringCenterUpdate, GathererGatheringCenterResponse, PaginatedGathererGatheringCenterResponse,
    LotCertificationWithDetailsResponse,
    PurchaseCreate, PurchaseUpdate, PurchaseResponse, PaginatedPurchaseResponse,
    BalanceMovementResponse, BalanceSummaryResponse, BalanceSummaryGatherersResponse, BalanceMovementCreate, PaginatedBalanceMovementResponse,
    GathererCreate, GathererUpdate, GathererResponse, PaginateGathererResponse, 
    GathererByGatheringCenterResponse, PaginateGathererByGatheringCenterResponse, GatheringSummaryResponse, BalanceMovementTypeEnum,
    DispatchLotsRequest, DispatchLotsResponse
)

router = APIRouter(
    prefix="/gathering",
    tags=["Gathering"]
)

def get_funcionalities(request: Request):
    container = request.app.state.container
    return container.get("gathering")

# ========== LOT ROUTES ==========
@router.post("/lots", response_model=LotResponse, status_code=201)
def create_lot(lot_data: LotCreate, svc=Depends(get_funcionalities)):
    """Crea un nuevo lote"""
    try:
        return svc.create_lot(lot_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/lots", response_model=PaginatedLotListResponse)
def get_lots(
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar (name, fresh_weight, cost, created_at)"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda por nombre"),
    status: Optional[str] = Query(None, description="Filtro de estado: 'activo', 'en_stock', 'despachado', 'eliminado'"),
    gathering_center_id: Optional[UUID] = Query(None, description="ID del centro de acopio para filtrar"),
    current_store_center_id: Optional[UUID] = Query(None, description="ID del centro de almacenamiento actual para filtrar"),
    svc=Depends(get_funcionalities)
):
    """Obtiene una lista paginada de lotes con información detallada, campos calculados y compras"""
    return svc.get_lots_paginated(
        page=page, 
        per_page=per_page, 
        sort_by=sort_by, 
        order=order, 
        search=search, 
        status=status,
        gathering_center_id=gathering_center_id,
        current_store_center_id=current_store_center_id
    )

@router.get("/lots/export/excel")
def export_lots_excel(
    type_download: str = Query(..., description="Tipo de descarga: 'lots' (una fila por lote) o 'purchases' (una fila por compra)"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar (name, fresh_weight, cost, created_at)"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda por nombre"),
    status: Optional[str] = Query(None, description="Filtro de estado: 'activo', 'en_stock', 'despachado', 'eliminado'"),
    gathering_center_id: Optional[UUID] = Query(None, description="ID del centro de acopio para filtrar"),
    current_store_center_id: Optional[UUID] = Query(None, description="ID del centro de almacenamiento actual para filtrar"),
    svc=Depends(get_funcionalities)
):
    """Exporta lotes a Excel con dos formatos: 'lots' (una fila por lote) o 'purchases' (una fila por compra con datos del lote)"""
    from datetime import datetime
    
    # Validar type_download
    if type_download not in ["lots", "purchases"]:
        raise HTTPException(status_code=400, detail="type_download debe ser 'lots' o 'purchases'")
    
    excel_file = svc.export_lots_to_excel(
        type_download=type_download,
        sort_by=sort_by,
        order=order,
        search=search,
        status=status,
        gathering_center_id=gathering_center_id,
        current_store_center_id=current_store_center_id
    )
    
    # Generar nombre de archivo con timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"lotes_{type_download}_{timestamp}.xlsx"
    
    return StreamingResponse(
        excel_file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.get("/lots/{lot_id}", response_model=LotResponse)
def get_lot(lot_id: UUID, svc=Depends(get_funcionalities)):
    """Obtiene un lote específico por ID"""
    lot = svc.get_lot_by_id(lot_id)
    if not lot:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    return lot

@router.patch("/lots/{lot_id}", response_model=LotResponse)
def update_lot(
    request: Request,
    lot_id: UUID,
    lot_data: LotUpdate,
    svc=Depends(get_funcionalities)
):
    """
    Actualiza un lote existente.
    
    Genera automáticamente registros de historial cuando cambian:
    - **current_status** → Crea registro en `lot_status_history`
    - **current_process** → Crea registro en `lot_process_history`
    - **net_weight** → Crea registro en `lot_net_weight_history` (con identity_id del token)
    
    El identity_id se obtiene automáticamente del token JWT para auditoría.
    """
    # Obtener identity_id del token
    identity_id = get_identity_from_token(request)
    
    lot = svc.update_lot(lot_id, lot_data, identity_id)
    if not lot:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    return lot

@router.delete("/lots/{lot_id}", response_model=LotResponse)
def disable_lot(lot_id: UUID, svc=Depends(get_funcionalities)):
    """Deshabilita un lote"""
    lot = svc.disable_lot(lot_id)
    if not lot:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    return lot

@router.post("/lots/{lot_id}/restore", response_model=LotResponse)
def restore_lot(lot_id: UUID, svc=Depends(get_funcionalities)):
    """Restaura un lote deshabilitado"""
    lot = svc.restore_lot(lot_id)
    if not lot:
        raise HTTPException(status_code=404, detail="Lote deshabilitado no encontrado")
    return lot

# ========== GATHERING CENTER ROUTES ==========
@router.post("/gathering-centers", response_model=GatheringCenterResponse, status_code=201)
def create_gathering_center(center_data: GatheringCenterCreate, svc=Depends(get_funcionalities)):
    """Crea un nuevo centro de acopio"""
    try:
        return svc.create_gathering_center(center_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/gathering-centers", response_model=PaginatedGatheringCenterResponse)
def get_gathering_centers(
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda"),
    svc=Depends(get_funcionalities)
):
    """Obtiene una lista paginada de centros de acopio"""
    return svc.get_gathering_centers_paginated(page=page, per_page=per_page, sort_by=sort_by, order=order, search=search)

@router.get("/gathering-centers/export/excel")
def export_gathering_centers_excel(
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda"),
    svc=Depends(get_funcionalities)
):
    """Exporta todos los centros de acopio a un archivo Excel con los mismos filtros que la paginación"""
    from datetime import datetime
    
    excel_file = svc.export_gathering_centers_to_excel(sort_by=sort_by, order=order, search=search)
    
    # Generar nombre de archivo con timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"centros_acopio_{timestamp}.xlsx"
    
    return StreamingResponse(
        excel_file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.get("/gathering-centers/summary", response_model=GatheringSummaryResponse)
def get_gathering_summary(
    gathering_center_id: Optional[UUID] = Query(None, description="ID del centro de acopio"),
    svc=Depends(get_funcionalities)
):
    """Obtiene el resumen de un centro de acopio"""
    return svc.get_gathering_summary(gathering_center_id)

@router.get("/gathering-centers/{center_id}", response_model=GatheringCenterResponse)
def get_gathering_center(center_id: UUID, svc=Depends(get_funcionalities)):
    """Obtiene un centro de acopio específico por ID"""
    center = svc.get_gathering_center_by_id(center_id)
    if not center:
        raise HTTPException(status_code=404, detail="Centro de acopio no encontrado")
    return center

@router.put("/gathering-centers/{center_id}", response_model=GatheringCenterResponse)
def update_gathering_center(
    center_id: UUID,
    center_data: GatheringCenterUpdate,
    svc=Depends(get_funcionalities)
):
    """Actualiza un centro de acopio existente"""
    center = svc.update_gathering_center(center_id, center_data)
    if not center:
        raise HTTPException(status_code=404, detail="Centro de acopio no encontrado")
    return center



# ========== GATHERERS ROUTES ==========
@router.post("/gatherers", response_model=GathererResponse, status_code=201)
def create_gatherer(gatherer_data: GathererCreate, svc=Depends(get_funcionalities)):
    """Crea un nuevo gatherer"""
    try:
        return svc.create_gatherer(gatherer_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/gatherers", response_model=PaginateGathererResponse)
def get_gatherers(
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(10, ge=1, le=100, description="Tamaño de página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar (first_name, last_name, dni, last_purchase_date, status)"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda"),
    status: Optional[str] = Query(None, description="Filtro de estado: 'activo' o 'inactivo'. Sin especificar devuelve todos"),
    is_disabled: Optional[bool] = Query(None, description="Filtro de deshabilitados: true (solo deshabilitados), false (solo activos), sin especificar (todos)"),
    svc=Depends(get_funcionalities)
):
    """
    Obtiene una lista paginada de gatherers con fecha última compra y estado.
    
    Columnas adicionales:
    - last_purchase_date: Fecha de la última compra registrada del acopiador
    - status: "activo" si la última compra fue hace menos de 15 días, "inactivo" en caso contrario
    
    Filtros disponibles:
    - status: "activo" (compra en últimos 15 días), "inactivo" (sin compras o compra hace más de 15 días), sin especificar (todos)
    - is_disabled: true (solo deshabilitados), false (solo activos), sin especificar (todos)
    """
    return svc.get_gatherers_paginated(page=page, page_size=page_size, sort_by=sort_by, order=order, search=search, status=status, is_disabled=is_disabled)

@router.get("/gatherers/by-gathering-center/{gathering_center_id}", response_model=PaginateGathererByGatheringCenterResponse)
def get_gatherers_by_gathering_center(
    gathering_center_id: UUID,
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar (first_name, last_name, dni)"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda por nombre, apellido o DNI"),
    svc=Depends(get_funcionalities)
):
    """Obtiene una lista paginada de gatherers filtrados por gathering_center_id con otros centros de acopio"""
    return svc.get_gatherers_by_gathering_center(
        gathering_center_id=gathering_center_id,
        page=page,
        per_page=per_page,
        sort_by=sort_by,
        order=order,
        search=search
    )

@router.get("/gatherers/by-gathering-center/{gathering_center_id}/export/excel")
def export_gatherers_by_gathering_center_to_excel(
    gathering_center_id: UUID,
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar (first_name, last_name, dni)"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda por nombre, apellido o DNI"),
    svc=Depends(get_funcionalities)
):
    """
    Descarga en Excel todos los acopiadores de un centro de acopio específico.
    
    **Columnas incluidas:**
    - ID del acopiador
    - ID de la relación (gatherer_gathering_center)
    - Nombres
    - Apellidos
    - DNI
    - Teléfono
    - Otros centros de acopio (lista separada por comas)
    
    **Filtros:**
    - **search**: Busca por nombre, apellido o DNI
    - **sort_by**: Ordena por first_name, last_name o dni
    - **order**: asc (ascendente) o desc (descendente)
    
    Los datos son idénticos a los mostrados en la paginación.
    """
    excel_file = svc.export_gatherers_by_gathering_center_to_excel(
        gathering_center_id=gathering_center_id,
        sort_by=sort_by,
        order=order,
        search=search
    )
    
    # Obtener nombre del centro para el archivo
    gathering_center = svc._get_db().query(GatheringCenterModel).filter(
        GatheringCenterModel.id == gathering_center_id
    ).first()
    center_name = gathering_center.name if gathering_center else "centro_acopio"
    
    # Limpiar nombre para usar en archivo
    safe_name = "".join(c for c in center_name if c.isalnum() or c in (' ', '_')).replace(' ', '_')
    
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"acopiadores_{safe_name}_{timestamp}.xlsx"
    
    return StreamingResponse(
        excel_file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.get("/gatherers/{gatherer_id}", response_model=GathererResponse)
def get_gatherer(gatherer_id: UUID, svc=Depends(get_funcionalities)):
    """Obtiene un gatherer específico por ID"""
    gatherer = svc.get_gatherer_by_id(gatherer_id)
    if not gatherer:
        raise HTTPException(status_code=404, detail="Gatherer no encontrado")
    return gatherer

@router.put("/gatherers/{gatherer_id}", response_model=GathererResponse)
def update_gatherer(
    gatherer_id: UUID,
    gatherer_data: GathererUpdate,
    svc=Depends(get_funcionalities)
):
    """Actualiza un gatherer existente"""
    gatherer = svc.update_gatherer(gatherer_id, gatherer_data)
    if not gatherer:
        raise HTTPException(status_code=404, detail="Gatherer no encontrado")
    return gatherer

@router.delete("/gatherers/{gatherer_id}", response_model=GathererResponse)
def disable_gatherer(gatherer_id: UUID, svc=Depends(get_funcionalities)):
    """Deshabilita un gatherer"""
    gatherer = svc.disable_gatherer(gatherer_id)
    if not gatherer:
        raise HTTPException(status_code=404, detail="Gatherer no encontrado")
    return gatherer

@router.post("/gatherers/{gatherer_id}/restore", response_model=GathererResponse)
def restore_gatherer(gatherer_id: UUID, svc=Depends(get_funcionalities)):
    """Restaura un gatherer deshabilitado"""
    gatherer = svc.restore_gatherer(gatherer_id)
    if not gatherer:
        raise HTTPException(status_code=404, detail="Gatherer deshabilitado no encontrado")
    return gatherer

# ========== GATHERER GATHERING CENTER ROUTES ==========
@router.post("/gatherer-gathering-centers", response_model=GathererGatheringCenterResponse, status_code=201)
def create_gatherer_gathering_center(data: GathererGatheringCenterCreate, svc=Depends(get_funcionalities)):
    """Crea una nueva relación acopiador-centro de acopio"""
    try:
        return svc.create_gatherer_gathering_center(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/gatherer-gathering-centers", response_model=PaginatedGathererGatheringCenterResponse)
def get_gatherer_gathering_centers(
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda (UUID de gatherer_id o gathering_center_id)"),
    svc=Depends(get_funcionalities)
):
    """Obtiene una lista paginada de relaciones acopiador-centro de acopio"""
    return svc.get_gatherer_gathering_centers_paginated(page=page, per_page=per_page, sort_by=sort_by, order=order, search=search)

@router.get("/gatherer-gathering-centers/{relation_id}", response_model=GathererGatheringCenterResponse)
def get_gatherer_gathering_center(relation_id: UUID, svc=Depends(get_funcionalities)):
    """Obtiene una relación acopiador-centro de acopio específica por ID"""
    relation = svc.get_gatherer_gathering_center_by_id(relation_id)
    if not relation:
        raise HTTPException(status_code=404, detail="Relación no encontrada")
    return relation

@router.put("/gatherer-gathering-centers/{relation_id}", response_model=GathererGatheringCenterResponse)
def update_gatherer_gathering_center(
    relation_id: UUID,
    data: GathererGatheringCenterUpdate,
    svc=Depends(get_funcionalities)
):
    """Actualiza una relación acopiador-centro de acopio existente"""
    try:
        relation = svc.update_gatherer_gathering_center(relation_id, data)
        if not relation:
            raise HTTPException(status_code=404, detail="Relación no encontrada")
        return relation
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/gatherer-gathering-centers/{relation_id}", response_model=GathererGatheringCenterResponse)
def disable_gatherer_gathering_center(
    relation_id: UUID,
    svc=Depends(get_funcionalities)
):
    """Deshabilita una relación acopiador-centro de acopio"""
    relation = svc.disable_gatherer_gathering_center(relation_id)
    if not relation:
        raise HTTPException(status_code=404, detail="Relación no encontrada")
    return relation

# ========== BALANCE ROUTES ==========
# crea un nuevo movimiento de balance
@router.post("/balances", response_model=BalanceMovementResponse, status_code=201)
def create_balance(data: BalanceMovementCreate, svc=Depends(get_funcionalities)):
    """Crea un nuevo movimiento de balance"""
    return svc.create_balance(data)

@router.get("/balances", response_model=PaginatedBalanceMovementResponse)
def get_balances(
    gathering_center_id: Optional[UUID] = Query(None, description="ID del centro de acopio"),
    gatherer_id: Optional[UUID] = Query(None, description="ID del acopiador"),
    type_movement: Optional[BalanceMovementTypeEnum] = Query(None, description="Tipo de movimiento (RECHARGE o PURCHASE)"),
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(10, ge=1, le=100, description="Elementos por página"),
    svc=Depends(get_funcionalities)
):
    """Obtiene movimientos de balance paginados con filtros opcionales"""
    return svc.get_balances(
        gathering_center_id=gathering_center_id,
        gatherer_id=gatherer_id,
        type_movement=type_movement,
        page=page,
        page_size=page_size
    )

@router.get("/balances/export/excel")
def export_balances_to_excel(
    gathering_center_id: Optional[UUID] = Query(None, description="ID del centro de acopio"),
    gatherer_id: Optional[UUID] = Query(None, description="ID del acopiador"),
    type_movement: Optional[BalanceMovementTypeEnum] = Query(None, description="Tipo de movimiento (RECHARGE o PURCHASE)"),
    svc=Depends(get_funcionalities)
):
    """
    Descarga en Excel todos los movimientos de caja (balance movements).
    
    **Columnas incluidas:**
    - ID del movimiento
    - Centro de Acopio (nombre)
    - Acopiador (nombre completo)
    - Tipo de Movimiento (RECHARGE/PURCHASE)
    - ID de Compra (si aplica)
    - Monto
    - Identidad que registró (nombre)
    - Fecha de Creación
    
    **Filtros opcionales:**
    - **gathering_center_id**: Filtra por centro de acopio
    - **gatherer_id**: Filtra por acopiador
    - **type_movement**: Filtra por tipo (RECHARGE o PURCHASE)
    
    Los datos son idénticos a los mostrados en la paginación.
    """
    excel_file = svc.export_balances_to_excel(
        gathering_center_id=gathering_center_id,
        gatherer_id=gatherer_id,
        type_movement=type_movement
    )
    
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Construir nombre de archivo basado en filtros
    filename_parts = ["movimientos_caja"]
    
    if gathering_center_id:
        gathering_center = svc._get_db().query(GatheringCenterModel).filter(
            GatheringCenterModel.id == gathering_center_id
        ).first()
        if gathering_center:
            safe_name = "".join(c for c in gathering_center.name if c.isalnum() or c in (' ', '_')).replace(' ', '_')
            filename_parts.append(safe_name)
    
    if type_movement:
        filename_parts.append(type_movement.value)
    
    filename_parts.append(timestamp)
    filename = f"{'_'.join(filename_parts)}.xlsx"
    
    return StreamingResponse(
        excel_file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.get("/balances/summary", response_model=BalanceSummaryResponse)
def get_balance_summary(
    gathering_center_id: UUID = Query(..., description="ID del centro de acopio"),
    gatherer_id: Optional[UUID] = Query(None, description="ID del acopiador"),
    svc=Depends(get_funcionalities)
):
    """Obtiene el resumen de balance para un acopiador en un centro de acopio"""
    return svc.get_balance_summary(gathering_center_id, gatherer_id)

@router.get("/balances/gatherers/summary", response_model=BalanceSummaryGatherersResponse)
def get_balance_summary(
    gatherer_id: Optional[UUID] = Query(None, description="ID del acopiador"),
    svc=Depends(get_funcionalities)
):
    """Obtiene el resumen de balance para todos o un acopiador en todos los centros de acopio"""
    return svc.get_balance_gatherers_summary(gatherer_id)

# ========== LOT CERTIFICATION ROUTES ==========
@router.get("/lots/{lot_id}/certifications", response_model=List[LotCertificationWithDetailsResponse])
def get_certifications_by_lot(lot_id: UUID, svc=Depends(get_funcionalities)):
    """Obtiene las certificaciones de un lote"""
    return svc.get_certifications_by_lot(lot_id)

# ========== PURCHASE ROUTES ==========
@router.post("/purchases", response_model=PurchaseResponse, status_code=201)
def create_purchase(purchase_data: PurchaseCreate, svc=Depends(get_funcionalities)):
    """Crea una nueva compra"""
    try:
        return svc.create_purchase(purchase_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/purchases", response_model=PaginatedPurchaseResponse)
def get_purchases(
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda (UUID o payment_method)"),
    svc=Depends(get_funcionalities)
):
    """Obtiene una lista paginada de compras"""
    return svc.get_purchases_paginated(page=page, per_page=per_page, sort_by=sort_by, order=order, search=search)

@router.get("/purchases/{purchase_id}", response_model=PurchaseResponse)
def get_purchase(purchase_id: UUID, svc=Depends(get_funcionalities)):
    """Obtiene una compra específica por ID"""
    purchase = svc.get_purchase_by_id(purchase_id)
    if not purchase:
        raise HTTPException(status_code=404, detail="Compra no encontrada")
    return purchase

@router.put("/purchases/{purchase_id}", response_model=PurchaseResponse)
def update_purchase(
    purchase_id: UUID,
    purchase_data: PurchaseUpdate,
    svc=Depends(get_funcionalities)
):
    """Actualiza una compra existente"""
    purchase = svc.update_purchase(purchase_id, purchase_data)
    if not purchase:
        raise HTTPException(status_code=404, detail="Compra no encontrada")
    return purchase

# ========== STORE MOVEMENT ROUTES ==========
def get_identity_from_token(request: Request) -> Optional[UUID]:
    """
    Extrae el identity_id del token JWT del header Authorization.
    El token ya fue validado por el middleware, solo necesitamos decodificarlo.
    
    Returns:
        UUID del identity (sub del token) o None si no está presente
    """
    authorization = request.headers.get("Authorization", "")
    if not authorization:
        return None
    
    # Extraer el token (formato: "Bearer <token>" o "Identi <token>")
    parts = authorization.split(" ")
    if len(parts) != 2:
        return None
    
    token = parts[1]
    
    try:
        # Decodificar sin verificar (ya fue verificado por el middleware)
        decoded = jwt.decode(token, options={"verify_signature": False})
        
        # El 'sub' (subject) del token contiene el identity_id
        sub = decoded.get("sub")
        if sub:
            return UUID(sub)
        return None
    except Exception as e:
        print(f"⚠️  Error al decodificar token para obtener identity_id: {e}")
        return None

@router.post("/lots/dispatch", response_model=DispatchLotsResponse, status_code=201)
def dispatch_lots(
    request: Request,
    dispatch_data: DispatchLotsRequest,
    svc=Depends(get_funcionalities)
):
    """
    Despacha múltiples lotes a un centro de almacenamiento.
    
    **Funcionalidad:**
    - Recibe una lista de IDs de lotes y un ID de centro de almacenamiento destino
    - Para cada lote:
      1. Actualiza el `current_store_center_id` del lote
      2. Crea un registro en `store_movement` (módulo warehouse) de tipo INGRESO
    - El `identity_id` se obtiene automáticamente del token de autenticación
    - El `weight_kg` se obtiene del campo `net_weight` del lote
    
    **Parámetros:**
    - **lot_ids**: Lista de UUIDs de los lotes a despachar
    - **store_center_id**: UUID del centro de almacenamiento destino
    
    **Retorna:**
    - **message**: Mensaje de confirmación
    - **dispatched_lots**: Cantidad de lotes despachados exitosamente
    
    **Notas:**
    - Los lotes que no existan, estén deshabilitados o no tengan peso registrado serán omitidos sin generar error
    - El identity_id se extrae automáticamente del token JWT (claim 'sub')
    - Cada movimiento queda registrado en la tabla `store_movement` del módulo warehouse
    """
    try:
        # Obtener identity_id del token
        identity_id = get_identity_from_token(request)
        
        if not identity_id:
            print("⚠️  No se pudo obtener identity_id del token")
        else:
            print(f"🔑 Identity ID obtenido del token: {identity_id}")
        
        return svc.dispatch_lots(dispatch_data, identity_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
