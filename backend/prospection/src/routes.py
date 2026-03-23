"""
Rutas del módulo prospection: KYC, métricas y geojson por form_id.
"""
from fastapi import APIRouter, Depends, HTTPException, Request

from modules.prospection.src.service import ProspectionService, ProspectionServiceError
from uuid import UUID

router = APIRouter(prefix="/prospection", tags=["prospection"])


def get_prospection_service(request: Request) -> ProspectionService:
    container = getattr(request.app.state, "container", None)
    if not container:
        raise HTTPException(status_code=503, detail="Container no disponible")
    try:
        return container.get("prospection", "modules")
    except ValueError:
        raise HTTPException(status_code=503, detail="Servicio prospection no registrado")


# --- API 1: KYC results ---
@router.get("/kyc-results", summary="Resultados del servicio KYC")
def kyc_results(service: ProspectionService = Depends(get_prospection_service)):
    """Integración con el servicio KYC. Usa la variable de entorno ApiKeyKYC como ApiKey."""
    try:
        return service.get_kyc_results()
    except ProspectionServiceError as e:
        raise HTTPException(status_code=e.status_code or 502, detail=e.message)


# --- API 2: Metrics ---
@router.get("/metrics", summary="Métricas de prospección (core_registers)")
def metrics(service: ProspectionService = Depends(get_prospection_service)):
    """
    Métricas desde core_registers:
    - prospection_count: formid = 1
    - visit_field_count: formid = 2
    - suivis_count: formid = 3
    - visit_pct: visit_field_count / prospection_count * 100 (sin decimales)
    - suivis_pct: suivis_count / prospection_count * 100 (sin decimales)
    """
    try:
        return service.get_metrics()
    except ProspectionServiceError as e:
        raise HTTPException(status_code=e.status_code or 500, detail=e.message)


# --- API 3: GeoJSON por form_id ---
@router.get("/{form_id}", summary="GeoJSON por form_id")
def geojson_by_form_id(form_id: UUID, service: ProspectionService = Depends(get_prospection_service)):
    """
    Devuelve un objeto donde cada clave es el nombre del atributo en core_registers.detail
    con type_value = 'geojson', y el valor es la lista de geojson para ese atributo.
    """
    try:
        return service.get_geojson_by_form_id(form_id)
    except ProspectionServiceError as e:
        raise HTTPException(status_code=e.status_code or 500, detail=e.message)
