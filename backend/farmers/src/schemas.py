from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum

class FarmerCreate(BaseModel):
    code: Optional[str] = None
    first_name: str
    last_name: str
    dni: str
    wsp_number: Optional[str] = None
    sms_number: Optional[str] = None
    call_number: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    country_id: Optional[str] = None
    department_id: Optional[str] = None
    province_id: Optional[str] = None
    district_id: Optional[str] = None

class FarmerUpdate(BaseModel):
    code: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    dni: Optional[str] = None
    wsp_number: Optional[str] = None
    sms_number: Optional[str] = None
    call_number: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    country_id: Optional[str] = None
    department_id: Optional[str] = None
    province_id: Optional[str] = None
    district_id: Optional[str] = None

# Schemas de información relacionada (deben estar antes de FarmerResponse)
class CountryInfo(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None

class DepartmentInfo(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None

class ProvinceInfo(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None

class DistrictInfo(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None

class FarmerResponse(BaseModel):
    id: UUID
    code: Optional[str]
    first_name: str
    last_name: str
    dni: str
    wsp_number: Optional[str]
    sms_number: Optional[str]
    call_number: Optional[str]
    email: Optional[str]
    address: Optional[str]
    # Campos adicionales de relaciones
    country: Optional[CountryInfo] = None
    department: Optional[DepartmentInfo] = None
    province: Optional[ProvinceInfo] = None
    district: Optional[DistrictInfo] = None
    last_visit_date: Optional[datetime] = None  # fecha del último formulario donde participó
    status: Optional[str] = None  # "activo" si última visita < 15 días, sino "inactivo"
    created_at: datetime
    updated_at: datetime
    disabled_at: Optional[datetime]

    class Config:
        from_attributes = True

class PaginationParams(BaseModel):
    page: int = 1
    page_size: int = 10

class PaginatedResponse(BaseModel):
    items: list[FarmerResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# Plot Schemas
class PlotResponse(BaseModel):
    id: UUID
    farm_id: UUID
    name: Optional[str]
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
    disabled_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class PlotUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

# Crop Schemas
class CropResponse(BaseModel):
    id: str
    name: Optional[str]
    crop_type: Optional[str]
    created_at: datetime
    updated_at: datetime
    disabled_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class PaginatedCropResponse(BaseModel):
    items: list[CropResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# Plot Section Schemas
class PlotSectionCreate(BaseModel):
    name: str
    description: Optional[str] = None

class PlotSectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class PlotSectionResponse(BaseModel):
    id: UUID
    plot_id: UUID
    name: Optional[str]
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
    disabled_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class PaginatedPlotResponse(BaseModel):
    items: list[PlotResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# Farm Schemas - Schemas anidados para relaciones
class FarmerInfo(BaseModel):
    id: Optional[UUID] = None
    full_name: Optional[str] = None  # first_name + last_name

# Import DeforestationRequestInfo from deforesting module
from modules.deforesting.src.schemas import DeforestationRequestInfo

class FarmResponse(BaseModel):
    id: UUID
    farmer_id: UUID
    name: Optional[str]
    total_area: Optional[float]
    cultivated_area: Optional[float]
    geometry: Optional[dict] = None  # GeoJSON format
    latitude: Optional[float]
    longitude: Optional[float]
    country_id: Optional[str] = None
    department_id: Optional[str] = None
    province_id: Optional[str] = None
    district_id: Optional[str] = None
    # Campos adicionales de relaciones agrupados
    farmer: Optional[FarmerInfo] = None
    country: Optional[CountryInfo] = None
    department: Optional[DepartmentInfo] = None
    province: Optional[ProvinceInfo] = None
    district: Optional[DistrictInfo] = None
    crops: list[CropResponse] = []  # Lista de cultivos asociados a la parcela
    deforestation_request: Optional[DeforestationRequestInfo] = None  # Información de deforestación
    created_at: datetime
    updated_at: datetime
    disabled_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class PaginatedFarmResponse(BaseModel):
    items: list[FarmResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class FarmGeometryUpload(BaseModel):
    """Schema para subir geometría de una farm en formato GeoJSON FeatureCollection"""
    geojson: dict  # GeoJSON FeatureCollection con al menos una feature de tipo Polygon o MultiPolygon
    is_principal: bool = False  # Si es el polígono principal de la parcela (farms) o secundario (farm_plots)
    name: Optional[str] = None  # Nombre del plot (solo si is_principal=False)
    description: Optional[str] = None  # Descripción del plot (solo si is_principal=False)
    
    class Config:
        json_schema_extra = {
            "example": {
                "geojson": {
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "type": "Feature",
                            "properties": {},
                            "geometry": {
                                "type": "Polygon",
                                "coordinates": [
                                    [
                                        [-76.12345, -12.12345],
                                        [-76.12355, -12.12345],
                                        [-76.12355, -12.12355],
                                        [-76.12345, -12.12355],
                                        [-76.12345, -12.12345]
                                    ]
                                ]
                            }
                        }
                    ]
                },
                "is_principal": True
            }
        }

class FarmGeometryResponse(BaseModel):
    """Schema de respuesta después de subir geometría"""
    id: UUID  # farm_id
    farmer_id: UUID
    name: Optional[str]
    geometry: Optional[dict] = None  # GeoJSON format
    plot_id: Optional[UUID] = None  # ID del plot creado (solo si is_principal=False)
    is_principal: bool  # Indica si es geometría principal o plot secundario
    message: str
    
    class Config:
        from_attributes = True


class FarmUpdate(BaseModel):
    name: Optional[str] = None
    total_area: Optional[float] = None
    cultivated_area: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    country_id: Optional[str] = None
    department_id: Optional[str] = None
    province_id: Optional[str] = None
    district_id: Optional[str] = None
    