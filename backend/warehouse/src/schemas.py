from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum
from decimal import Decimal

# Enums
class StoreMovementTypeEnum(str, Enum):
    INGRESO = "ingreso"
    SALIDA = "salida"

# ========== STORE CENTER SCHEMAS ==========
class StoreCenterCreate(BaseModel):
    name: str
    capacity_kg: Decimal
    code: Optional[str] = None

class StoreCenterUpdate(BaseModel):
    name: Optional[str] = None
    capacity_kg: Optional[Decimal] = None
    code: Optional[str] = None

class StoreCenterResponse(BaseModel):
    id: UUID
    name: str
    capacity_kg: Decimal
    code: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    disabled_at: Optional[datetime]
    lots_count: int = 0

    class Config:
        from_attributes = True

class PaginatedStoreCenterResponse(BaseModel):
    items: List[StoreCenterResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# ========== STORE MOVEMENT SCHEMAS ==========
class StoreMovementCreate(BaseModel):
    lot_id: UUID
    store_center_id: UUID
    type_movement: StoreMovementTypeEnum
    weight_kg: Decimal
    identity_id: UUID

class StoreMovementUpdate(BaseModel):
    lot_id: Optional[UUID] = None
    store_center_id: Optional[UUID] = None
    type_movement: Optional[StoreMovementTypeEnum] = None
    weight_kg: Optional[Decimal] = None
    identity_id: Optional[UUID] = None

class StoreMovementResponse(BaseModel):
    id: UUID
    lot_id: UUID
    store_center_id: UUID
    type_movement: StoreMovementTypeEnum
    weight_kg: Decimal
    identity_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class PaginatedStoreMovementResponse(BaseModel):
    items: List[StoreMovementResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# ========== WAREHOUSE SUMMARY SCHEMAS ==========
class LotsSimpleResponse(BaseModel):
    id: UUID
    name: str

    class Config:
        from_attributes = True
        
class WarehouseSummaryResponse(BaseModel):
    """Schema para resumen de almacén"""
    active_lots: int  # Lotes activos en el/los almacén(es)
    last_lot: Optional[LotsSimpleResponse] = None  # Último lote registrado a cualquier almacén
    stock_lots: int  # Lotes en stock en el/los almacén(es)
    total_lots: int  # Cantidad total de lotes en el/los almacén(es)
    kg_total: float  # Sumatoria de kilos de todos los lotes
    total: float  # Total de costo de todos los lotes
    
    class Config:
        json_schema_extra = {
            "example": {
                "active_lots": 50,
                "last_lot": "123e4567-e89b-12d3-a456-426614174000",
                "stock_lots": 30,
                "total_lots": 100,
                "kg_total": 5000.50,
                "total": 150000.00
            }
        }
