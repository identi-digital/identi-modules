from fastapi import APIRouter, Depends, Request, Query
from typing import Optional
# Usar importación relativa para evitar problemas durante la inicialización del módulo
from .schemas import PaginatedAuditLogResponse

router = APIRouter(
    prefix="/monitoring",
    tags=["Monitoring"]
)

def get_funcionalities(request: Request):
    container = request.app.state.container
    return container.get("monitoring")

# Audit Log routes
@router.get("/logs", response_model=PaginatedAuditLogResponse)
def get_logs(
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar"),
    order: Optional[str] = Query("desc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda (UUID o action)"),
    svc=Depends(get_funcionalities)
):
    """Lista todos los logs de auditoría paginados"""
    return svc.get_logs(page=page, per_page=per_page, sort_by=sort_by, order=order, search=search)

