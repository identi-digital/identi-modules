"""Schemas for deforesting module"""
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from enum import Enum

# Deforestation Request Info (nested) - for use in other modules
class DeforestationRequestInfo(BaseModel):
    status: Optional[str] = None
    natural_forest_loss_ha: Optional[float] = None
    natural_forest_coverage_ha: Optional[float] = None
    
    class Config:
        from_attributes = True

# Deforestation Request Schemas
class DeforestationRequestCreate(BaseModel):
    farm_id: UUID
    request_id: str
    status: Optional[str] = "pending"
    natural_forest_loss_ha: Optional[float] = None
    natural_forest_coverage_ha: Optional[float] = None
    data_source: Optional[dict] = None

class DeforestationRequestUpdate(BaseModel):
    status: Optional[str] = None
    natural_forest_loss_ha: Optional[float] = None
    natural_forest_coverage_ha: Optional[float] = None
    data_source: Optional[dict] = None

class DeforestationRequestResponse(BaseModel):
    id: UUID
    farm_id: UUID
    request_id: str
    status: str
    natural_forest_loss_ha: Optional[float]
    natural_forest_coverage_ha: Optional[float]
    data_source: Optional[dict]
    created_at: datetime
    updated_at: Optional[datetime]
    disabled_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class PaginatedDeforestationRequestResponse(BaseModel):
    items: list[DeforestationRequestResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# GFW Validation Schemas
class GFWValidationRequest(BaseModel):
    request_id: str
    api_url: Optional[str] = None

class GFWValidationResponse(BaseModel):
    uploadId: str
    listId: str
    status: str
    resultUrl: str
    errorDetails: list
    creationDate: str
    expirationDate: str
    data: dict

# ========== DEFORESTATION STATUS SCHEMAS ==========
class DeforestationStateEnum(str, Enum):
    """Estados de deforestación basados en pérdida de bosque natural"""
    BAJA_NULA = "baja/nula"  # natural_forest_loss_ha === 0
    PARCIAL = "parcial"  # 0 < natural_forest_loss_ha <= 0.2
    CRITICA = "crítica"  # natural_forest_loss_ha > 0.2

class FarmerResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    dni: str

    class Config:
        from_attributes = True

class locationResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    
    class Config:
        from_attributes = True

class FarmDeforestationResponse(BaseModel):
    """Schema para respuesta de paginación de parcelas con estado de deforestación"""
    id: UUID
    code: Optional[str] = None  # farms.name (código/nombre de la parcela)
    farmer : FarmerResponse
    district : Optional[locationResponse] = None
    province : Optional[locationResponse] = None
    country : Optional[locationResponse] = None
    department : Optional[locationResponse] = None
    district_description: Optional[str] = None  # district.description
    state_deforesting: DeforestationStateEnum  # Estado calculado basado en natural_forest_loss_ha
    natural_forest_loss_ha: Optional[float] = None  # Pérdida de bosque natural en hectáreas
    deforestation_request_id: Optional[UUID] = None  # ID del request si existe
    total_area: Optional[float] = None
    geometry: Optional[dict] = None  # GeoJSON format
    created_at: datetime
    
    class Config:
        from_attributes = True

class PaginatedFarmDeforestationResponse(BaseModel):
    """Schema para respuesta paginada de parcelas con deforestación"""
    items: List[FarmDeforestationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class DeforestationStatusCount(BaseModel):
    """Schema para conteo de parcelas por estado de deforestación"""
    count: int  # Cantidad de parcelas
    percentage: float  # Porcentaje del total
    
class FarmDeforestationMetricsResponse(BaseModel):
    """Schema para métricas de evaluación de deforestación"""
    total_hectares_evaluated: float  # Total de hectáreas evaluadas
    total_farms_evaluated: int  # Total de parcelas evaluadas
    baja_nula: DeforestationStatusCount  # Parcelas con deforestación baja/nula
    parcial: DeforestationStatusCount  # Parcelas con deforestación parcial
    critica: DeforestationStatusCount  # Parcelas con deforestación crítica
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_hectares_evaluated": 1250.5,
                "total_farms_evaluated": 100,
                "baja_nula": {
                    "count": 60,
                    "percentage": 60.0
                },
                "parcial": {
                    "count": 25,
                    "percentage": 25.0
                },
                "critica": {
                    "count": 15,
                    "percentage": 15.0
                }
            }
        }

class FarmerDeforestationMetricsResponse(BaseModel):
    """Schema para métricas de evaluación de deforestación de productores"""
    total_farmers_evaluated: int  # Total de productores evaluados
    baja_nula: DeforestationStatusCount  # Productores con promedio de deforestación baja/nula
    parcial: DeforestationStatusCount  # Productores con promedio de deforestación parcial
    critica: DeforestationStatusCount  # Productores con promedio de deforestación crítica
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_farmers_evaluated": 50,
                "baja_nula": {
                    "count": 30,
                    "percentage": 60.0
                },
                "parcial": {
                    "count": 12,
                    "percentage": 24.0
                },
                "critica": {
                    "count": 8,
                    "percentage": 16.0
                }
            }
        }

# ========== FARM GEOREFERENCE METRICS ==========
class FarmGeoreferenceMetricsResponse(BaseModel):
    """Schema para métricas de georreferenciación de parcelas"""
    farm_georefrence_count: int  # Número de parcelas con geometría
    farm_georefrence_coverage: float  # Porcentaje de parcelas con geometría
    farm_wh_georefeence_count: int  # Número de parcelas sin geometría (without)
    farm_wh_georefeence_coverage: float  # Porcentaje de parcelas sin geometría
    
    class Config:
        json_schema_extra = {
            "example": {
                "farm_georefrence_count": 150,
                "farm_georefrence_coverage": 75.0,
                "farm_wh_georefeence_count": 50,
                "farm_wh_georefeence_coverage": 25.0
            }
        }
