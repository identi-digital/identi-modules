from fastapi import APIRouter, Depends, Request, HTTPException, Query
from fastapi.responses import StreamingResponse
from uuid import UUID
from typing import Optional
from .schemas import (
    DeforestationRequestResponse, GFWValidationRequest, GFWValidationResponse,
    PaginatedFarmDeforestationResponse,
    FarmDeforestationMetricsResponse, FarmerDeforestationMetricsResponse,
    FarmGeoreferenceMetricsResponse
)

router = APIRouter(
    prefix="/deforesting",
    tags=["Deforesting"]
)

def get_funcionalities(request: Request):
    container = request.app.state.container
    return container.get("deforesting")

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


@router.get("/farms/{farm_id}/deforestation", response_model=DeforestationRequestResponse)
def get_farm_deforestation_request(
    farm_id: UUID,
    svc=Depends(get_funcionalities)
):
    """
    Obtiene el registro de análisis de deforestación para una farm específica.
    
    Retorna la información del último análisis enviado a GFW, incluyendo:
    - request_id: ID de la solicitud en GFW
    - status: Estado del análisis (PENDING, COMPLETED, REJECTED)
    - natural_forest_loss_ha: Pérdida de bosque natural en hectáreas
    - natural_forest_coverage_ha: Cobertura de bosque natural en hectáreas
    - data_source: Datos completos de la respuesta de GFW
    """
    result = svc.get_deforestation_request_by_farm_id(farm_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"No se encontró análisis de deforestación para la farm {farm_id}")
    return result

@router.post("/gfw/validate", response_model=GFWValidationResponse)
def validate_gfw_request(
    validation_data: GFWValidationRequest,
    svc=Depends(get_funcionalities),
    token: Optional[str] = Depends(get_auth_token)
):
    """
    Valida el estado de una solicitud de análisis de deforestación en GFW.
    
    Permite consultar el estado actual de un análisis previamente enviado a GFW.
    
    Request body:
    - request_id: ID de la solicitud en GFW (listId/uploadId)
    - api_url: URL base de la API de GFW (opcional, usa variable de entorno por defecto)
    - api_key: API key para autenticación (opcional, usa token de autorización por defecto)
    
    Response incluye:
    - uploadId/listId: ID de la solicitud
    - status: Estado actual (Pending, Completed, Failed, etc.)
    - resultUrl: URL para descargar resultados si está completado
    - errorDetails: Detalles de errores si los hay
    - data: Datos del análisis de deforestación
    - creationDate/expirationDate: Fechas de creación y expiración
    """
    try:
        return svc.validate_gfw_request(validation_data, token=token)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al validar solicitud de GFW: {str(e)}")

# ========== DEFORESTATION STATUS ROUTES ==========
@router.get("/farms", response_model=PaginatedFarmDeforestationResponse)
def get_farms_deforestation_paginated(
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    status: Optional[str] = Query(None, description="Filtro por estado: baja/nula, parcial, crítica"),
    sort_by: Optional[str] = Query(None, description="Campo para ordenar"),
    order: Optional[str] = Query("asc", description="Orden: asc o desc"),
    search: str = Query("", description="Búsqueda por nombre de parcela o productor"),
    svc=Depends(get_funcionalities)
):
    """
    Obtiene una lista paginada de parcelas con estado de deforestación.
    
    **IMPORTANTE:** Solo se incluyen parcelas que tienen un registro de deforestación 
    con status COMPLETED (análisis completado exitosamente).
    
    **Estados de deforestación basados en pérdida de bosque natural:**
    - **baja/nula**: natural_forest_loss_ha === 0
    - **parcial**: 0 < natural_forest_loss_ha <= 0.4
    - **crítica**: natural_forest_loss_ha > 0.4
    
    **Respuesta incluye:**
    - Código/nombre de la parcela
    - Nombre completo del productor
    - Descripción del distrito
    - Estado de deforestación
    - Pérdida de bosque natural (ha)
    """
    try:
        return svc.get_farms_deforestation_paginated(
            page=page,
            per_page=per_page,
            status=status,
            sort_by=sort_by,
            order=order,
            search=search
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/farms/metrics", response_model=FarmDeforestationMetricsResponse)
def get_farm_deforestation_metrics(
    svc=Depends(get_funcionalities)
):
    """
    Obtiene métricas de evaluación de deforestación de parcelas.
    
    **IMPORTANTE:** Solo se consideran parcelas con análisis de deforestación 
    completado exitosamente (status COMPLETED).
    
    **Métricas incluidas:**
    - **total_hectares_evaluated**: Total de hectáreas evaluadas (suma de farm.total_area)
    - **total_farms_evaluated**: Total de parcelas evaluadas
    - **baja_nula**: Parcelas con deforestación baja/nula (loss === 0)
      - count: Cantidad de parcelas
      - percentage: Porcentaje del total
    - **parcial**: Parcelas con deforestación parcial (0 < loss <= 0.4)
      - count: Cantidad de parcelas
      - percentage: Porcentaje del total
    - **critica**: Parcelas con deforestación crítica (loss > 0.4)
      - count: Cantidad de parcelas
      - percentage: Porcentaje del total
    """
    try:
        return svc.get_farm_deforestation_metrics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/farmers/metrics", response_model=FarmerDeforestationMetricsResponse)
def get_farmer_deforestation_metrics(
    svc=Depends(get_funcionalities)
):
    """
    Obtiene métricas de evaluación de deforestación de productores.
    
    **IMPORTANTE:** Solo se consideran productores que tienen al menos una parcela 
    con análisis de deforestación completado exitosamente (status COMPLETED).
    
    **Clasificación por promedio:**
    Para cada productor, se calcula el promedio de natural_forest_loss_ha de todas 
    sus parcelas evaluadas, y se clasifica en:
    - **baja/nula**: promedio === 0
    - **parcial**: 0 < promedio <= 0.4
    - **crítica**: promedio > 0.4
    
    **Métricas incluidas:**
    - **total_farmers_evaluated**: Total de productores evaluados
    - **baja_nula**: Productores con promedio de deforestación baja/nula
      - count: Cantidad de productores
      - percentage: Porcentaje del total
    - **parcial**: Productores con promedio de deforestación parcial
      - count: Cantidad de productores
      - percentage: Porcentaje del total
    - **critica**: Productores con promedio de deforestación crítica
      - count: Cantidad de productores
      - percentage: Porcentaje del total
    """
    try:
        return svc.get_farmer_deforestation_metrics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/farms/georeference-metrics", response_model=FarmGeoreferenceMetricsResponse)
def get_farm_georeference_metrics(
    svc=Depends(get_funcionalities)
):
    """
    Obtiene métricas de georreferenciación de parcelas.
    
    **Métricas incluidas:**
    - **farm_georefrence_count**: Número de parcelas con geometría definida
    - **farm_georefrence_coverage**: Porcentaje de parcelas georreferenciadas
    - **farm_wh_georefeence_count**: Número de parcelas sin geometría (without)
    - **farm_wh_georefeence_coverage**: Porcentaje de parcelas sin georreferenciar
    
    Solo se consideran parcelas activas (disabled_at IS NULL).
    """
    try:
        return svc.get_farm_georeference_metrics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/farms/export/excel")
def export_farms_deforestation_to_excel(
    status: Optional[str] = Query(None, description="Filtro por estado: baja/nula, parcial, crítica"),
    sort_by: Optional[str] = Query(None, description="Campo para ordenar"),
    order: Optional[str] = Query("asc", description="Orden: asc o desc"),
    search: str = Query("", description="Búsqueda por nombre de parcela o productor"),
    svc=Depends(get_funcionalities)
):
    """
    Descarga un archivo Excel con las parcelas evaluadas y su estado de deforestación.
    
    **IMPORTANTE:** Solo incluye parcelas con análisis de deforestación 
    completado exitosamente (status COMPLETED).
    
    **Filtros disponibles:**
    - **status**: Filtrar por estado de deforestación (baja/nula, parcial, crítica)
    - **sort_by**: Ordenar por campo específico
    - **order**: Orden ascendente (asc) o descendente (desc)
    - **search**: Buscar por nombre de parcela o productor
    
    **Columnas incluidas en el Excel:**
    - ID Parcela
    - Código/Nombre Parcela
    - Productor
    - Distrito
    - Estado Deforestación
    - Pérdida Bosque Natural (ha)
    - ID Solicitud Deforestación
    - Fecha Creación Parcela
    
    **Retorna:** Archivo Excel (.xlsx)
    """
    try:
        excel_file = svc.export_farms_deforestation_to_excel(
            status=status,
            sort_by=sort_by,
            order=order,
            search=search
        )
        
        from datetime import datetime
        filename = f"parcelas_deforestacion_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        
        return StreamingResponse(
            excel_file,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
