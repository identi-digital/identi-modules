from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Country Schemas
class CountryResponse(BaseModel):
    id: str  # String(12) en el modelo, no UUID
    name: str
    description: Optional[str]
    code: Optional[str]
    created_at: datetime
    updated_at: datetime
    disabled_at: Optional[datetime]

    class Config:
        from_attributes = True

# Department Schemas
class DepartmentResponse(BaseModel):
    id: str  # String(12) en el modelo, no UUID
    name: str
    description: Optional[str]
    country_id: str  # String(12) en el modelo, no UUID
    center_point: Optional[str] = None  # Geometry se serializa como WKT string
    created_at: datetime
    updated_at: datetime
    disabled_at: Optional[datetime]

    class Config:
        from_attributes = True

# Province Schemas
class ProvinceResponse(BaseModel):
    id: str  # String(12) en el modelo, no UUID
    name: str
    description: Optional[str]
    department_id: str  # String(12) en el modelo, no UUID
    center_point: Optional[str] = None  # Geometry se serializa como WKT string
    created_at: datetime
    updated_at: datetime
    disabled_at: Optional[datetime]

    class Config:
        from_attributes = True

# District Schemas
class DistrictResponse(BaseModel):
    id: str  # String(12) en el modelo, no UUID
    name: str
    description: Optional[str]
    province_id: str  # String(12) en el modelo, no UUID
    center_point: Optional[str] = None  # Geometry se serializa como WKT string
    created_at: datetime
    updated_at: datetime
    disabled_at: Optional[datetime]

    class Config:
        from_attributes = True

# Paginated Responses
class PaginatedCountryResponse(BaseModel):
    items: list[CountryResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class PaginatedDepartmentResponse(BaseModel):
    items: list[DepartmentResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class PaginatedProvinceResponse(BaseModel):
    items: list[ProvinceResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class PaginatedDistrictResponse(BaseModel):
    items: list[DistrictResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

