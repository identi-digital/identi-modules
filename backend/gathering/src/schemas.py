from pydantic import UUID1, BaseModel, model_validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum

# Enums
class CertificationCodeEnum(str, Enum):
    NOP = "nop"
    FLO = "flo"
    EU = "eu"
    RA = "ra"
    RTPO = "rtpo"
    BS = "bs"

class PurchasePresentationEnum(str, Enum):
    BABA = "baba"
    SECO = "seco"
    FRUTA = "fruta"

class BalanceMovementTypeEnum(str, Enum):
    PURCHASE = "purchase"
    RECHARGE = "recharge"

class ProductTypeEnum(str, Enum):
    CONVENCIONAL = "convencional"
    ORGANICO = "orgánico"

class CurrentStatusTypeEnum(str, Enum):
    ACTIVO = "activo"
    EN_STOCK = "en stock"

class CurrentProcessTypeEnum(str, Enum):
    BABA = "baba"
    FERMENTADO = "fermentado"
    SECADO = "secado"
    SECO = "seco"

# ========== NESTED SCHEMAS (para respuestas anidadas) ==========
class GatheringCenterNested(BaseModel):
    """Schema simplificado para gathering center anidado"""
    id: UUID
    name: str
    description: Optional[str]
    code: Optional[str]
    
    class Config:
        from_attributes = True

class GathererNested(BaseModel):
    """Schema simplificado para gatherer anidado"""
    id: UUID
    first_name: str
    last_name: str
    dni: str
    call_number: Optional[str]
    email: Optional[str]
    
    class Config:
        from_attributes = True

class FarmerNested(BaseModel):
    """Schema simplificado para farmer anidado"""
    id: UUID
    code: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    dni: Optional[str]
    
    class Config:
        from_attributes = True

class FarmNested(BaseModel):
    """Schema simplificado para farm anidado"""
    id: UUID
    name: Optional[str]
    total_area: Optional[float]
    cultivated_area: Optional[float]
    
    class Config:
        from_attributes = True

class IdentityNested(BaseModel):
    """Schema simplificado para identity anidado"""
    id: UUID
    sub: str
    username: Optional[str]
    email: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    
    class Config:
        from_attributes = True

# ========== LOT SCHEMAS ==========
class LotCreate(BaseModel):
    name: str
    gathering_center_id: UUID
    product_type: ProductTypeEnum
    current_status: CurrentStatusTypeEnum
    current_process: CurrentProcessTypeEnum
    current_store_center_id: Optional[UUID] = None
    gatherer_id: Optional[UUID] = None
    net_weight: Optional[float] = None

class LotUpdate(BaseModel):
    name: Optional[str] = None
    gathering_center_id: Optional[UUID] = None
    product_type: Optional[ProductTypeEnum] = None
    current_status: Optional[CurrentStatusTypeEnum] = None
    current_process: Optional[CurrentProcessTypeEnum] = None
    current_store_center_id: Optional[UUID] = None
    gatherer_id: Optional[UUID] = None
    net_weight: Optional[float] = None

class LotResponse(BaseModel):
    id: UUID
    name: str
    gathering_center_id: UUID  # Mantener para compatibilidad
    gathering_center: Optional[GatheringCenterNested]  # Objeto anidado
    product_type: ProductTypeEnum
    current_status: CurrentStatusTypeEnum
    current_process: CurrentProcessTypeEnum
    current_store_center_id: Optional[UUID]  # Mantener para compatibilidad
    current_store_center: Optional[GatheringCenterNested]  # Objeto anidado
    gatherer_id: Optional[UUID]  # Mantener para compatibilidad
    gatherer: Optional[GathererNested]  # Objeto anidado
    net_weight: Optional[float]
    created_at: datetime
    updated_at: Optional[datetime]
    disabled_at: Optional[datetime]

    class Config:
        from_attributes = True

class PaginatedLotResponse(BaseModel):
    items: List[LotResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class LotListItemResponse(BaseModel):
    """Schema para listado de lotes con campos calculados"""
    id: UUID
    name: str
    fresh_weight: float  # suma de quantity de las compras del lote
    net_weight: Optional[float]  # peso neto del lote
    created_at: datetime
    gatherer: Optional[GathererNested]  # Objeto anidado
    gathering_center: Optional['GatheringCenterNested'] = None  # Centro de acopio anidado
    current_store_center: Optional['GatheringCenterNested'] = None  # Centro de almacenamiento anidado
    product_type: ProductTypeEnum
    certifications: List[str]  # nombres de certificaciones
    cost: float  # suma de (quantity * price) de las compras
    current_process: CurrentProcessTypeEnum
    current_status: CurrentStatusTypeEnum
    purchases: List['PurchaseItemResponse']  # lista de compras del lote

    class Config:
        from_attributes = True

class PaginatedLotListResponse(BaseModel):
    items: List[LotListItemResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# ========== GATHERING CENTER SCHEMAS ==========
class GatheringCenterCreate(BaseModel):
    name: str
    description: Optional[str] = None
    code: Optional[str] = None

class GatheringCenterUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    code: Optional[str] = None

class GatheringCenterResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    code: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    disabled_at: Optional[datetime]
    gatherers_count: int = 0
    lots_count: int = 0
    balance: float = 0.0

    class Config:
        from_attributes = True

class PaginatedGatheringCenterResponse(BaseModel):
    items: List[GatheringCenterResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class GatheringSummaryResponse(BaseModel):
    gathering_center_id: Optional[UUID]
    last_purchase_amount: float
    today_expense: float
    month_expense: float

# ========== GATHERERS SCHEMAS ==========
class GathererCreate(BaseModel):
    username: str  # ← REQUERIDO para crear la identidad
    first_name: str
    last_name: str
    dni: str
    sms_number: Optional[str] = None
    wsp_number: Optional[str] = None
    call_number: Optional[str] = None
    email: Optional[str] = None

class GathererUpdate(BaseModel):
    identity_id: Optional[UUID] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    dni: Optional[str] = None
    sms_number: Optional[str] = None
    wsp_number: Optional[str] = None
    call_number: Optional[str] = None
    email: Optional[str] = None

class GathererResponse(BaseModel):
    id: UUID
    identity_id: UUID
    first_name: str
    last_name: str
    dni: str
    sms_number: Optional[str]
    wsp_number: Optional[str]
    call_number: Optional[str]
    email: Optional[str]
    last_purchase_date: Optional[datetime] = None  # fecha de la última compra
    status: Optional[str] = None  # "activo" si última compra < 15 días, sino "inactivo"
    created_at: datetime
    updated_at: Optional[datetime]
    disabled_at: Optional[datetime]

    class Config:
        from_attributes = True

class GathererByGatheringCenterResponse(BaseModel):
    """Schema para gatherers filtrados por gathering center"""
    id: UUID
    gatherer_gathering_center_id: UUID  # ID de la relación en gatherer_gathering_center
    first_name: str
    last_name: str
    dni: str
    call_number: Optional[str]
    other_gathering_centers: List[str]  # nombres de otros centros de acopio

    class Config:
        from_attributes = True

class PaginateGathererResponse(BaseModel):
    items: List[GathererResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class PaginateGathererByGatheringCenterResponse(BaseModel):
    items: List[GathererByGatheringCenterResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# ========== GATHERER GATHERING CENTER SCHEMAS ==========
class GathererGatheringCenterCreate(BaseModel):
    gatherer_id: UUID
    gathering_center_id: UUID

class GathererGatheringCenterUpdate(BaseModel):
    gatherer_id: Optional[UUID] = None
    gathering_center_id: Optional[UUID] = None

class GathererGatheringCenterResponse(BaseModel):
    id: UUID
    gatherer_id: UUID
    gathering_center_id: UUID
    created_at: datetime
    disabled_at: Optional[datetime]

    class Config:
        from_attributes = True

class PaginatedGathererGatheringCenterResponse(BaseModel):
    items: List[GathererGatheringCenterResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# ========== CERTIFICATION SCHEMAS ==========
class CertificationResponse(BaseModel):
    id: UUID
    name: str
    code: CertificationCodeEnum
    disabled_at: Optional[datetime]

    class Config:
        from_attributes = True

# ========== LOT CERTIFICATION SCHEMAS ==========
class LotCertificationResponse(BaseModel):
    id: UUID
    lot_id: UUID
    certification_id: UUID
    created_at: datetime
    disabled_at: Optional[datetime]

    class Config:
        from_attributes = True

class LotCertificationWithDetailsResponse(BaseModel):
    id: UUID
    lot_id: UUID
    certification_id: UUID
    certification_name: str
    certification_code: CertificationCodeEnum
    created_at: datetime
    disabled_at: Optional[datetime]

    class Config:
        from_attributes = True

# ========== PURCHASE SCHEMAS ==========
class PurchaseItemResponse(BaseModel):
    """Schema simplificado para compras dentro de lotes"""
    id: UUID
    farmer: Optional[FarmerNested]  # Objeto anidado
    farm: Optional[FarmNested]  # Objeto anidado
    gatherer: Optional[GathererNested]  # Objeto anidado
    quantity: float
    price: float
    price_total: float  # quantity * price
    presentation: PurchasePresentationEnum
    payment_method: Optional[str]
    purchase_date: datetime
    ticket_number: Optional[str]
    gathering_center: Optional[GatheringCenterNested]  # Objeto anidado
    identity: Optional[IdentityNested]  # Objeto anidado

    class Config:
        from_attributes = True

class PurchaseCreate(BaseModel):
    lot_id: UUID
    farmer_id: UUID
    farm_id: UUID
    gatherer_id: UUID
    quantity: float
    price: float
    presentation: PurchasePresentationEnum
    payment_method: Optional[str] = None
    purchase_date: datetime
    ticket_number: Optional[str] = None
    gathering_center_id: Optional[UUID] = None
    identity_id: UUID  # Requerido para crear el balance_movement automático

class PurchaseUpdate(BaseModel):
    lot_id: Optional[UUID] = None
    farmer_id: Optional[UUID] = None
    farm_id: Optional[UUID] = None
    gatherer_id: Optional[UUID] = None
    quantity: Optional[float] = None
    price: Optional[float] = None
    presentation: Optional[PurchasePresentationEnum] = None
    payment_method: Optional[str] = None
    purchase_date: Optional[datetime] = None
    ticket_number: Optional[str] = None
    gathering_center_id: Optional[UUID] = None
    identity_id: Optional[UUID] = None

class PurchaseResponse(BaseModel):
    id: UUID
    lot_id: UUID  # Mantener para compatibilidad
    farmer: Optional[FarmerNested]  # Objeto anidado
    farm: Optional[FarmNested]  # Objeto anidado
    gatherer: Optional[GathererNested]  # Objeto anidado
    quantity: float
    price: float
    presentation: PurchasePresentationEnum
    payment_method: Optional[str]
    purchase_date: datetime
    ticket_number: Optional[str]
    gathering_center: Optional[GatheringCenterNested]  # Objeto anidado
    identity: Optional[IdentityNested]  # Objeto anidado (opcional para retrocompatibilidad)
    created_at: datetime
    updated_at: Optional[datetime]
    disabled_at: Optional[datetime]

    class Config:
        from_attributes = True

class PaginatedPurchaseResponse(BaseModel):
    items: List[PurchaseResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# ========== STORE MOVEMENT SCHEMAS (DISPATCH) ==========
class DispatchLotsRequest(BaseModel):
    """Schema para despachar lotes a un centro de almacenamiento"""
    lot_ids: List[UUID]  # Lista de IDs de lotes a despachar
    store_center_id: UUID  # Centro de almacenamiento destino
    
    class Config:
        json_schema_extra = {
            "example": {
                "lot_ids": ["123e4567-e89b-12d3-a456-426614174000", "234e5678-e89b-12d3-a456-426614174001"],
                "store_center_id": "345e6789-e89b-12d3-a456-426614174002"
            }
        }

class DispatchLotsResponse(BaseModel):
    """Schema para respuesta de despacho de lotes"""
    message: str
    dispatched_lots: int  # Cantidad de lotes despachados
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "2 lotes despachados exitosamente",
                "dispatched_lots": 2
            }
        }

# ========== BALANCE MOVEMENT SCHEMAS ==========
class BalanceMovementCreate(BaseModel):
    gathering_center_id: UUID
    gatherer_id: Optional[UUID] = None
    type_movement: BalanceMovementTypeEnum
    purchase_id: Optional[UUID] = None
    ammount: float = 0
    identity_id: UUID
    created_at: datetime
    @model_validator(mode="after")
    def validate_purchase(cls, values):
        if values.type_movement == BalanceMovementTypeEnum.PURCHASE and not values.purchase_id:
            raise ValueError("purchase_id is required when type_movement is PURCHASE")
        return values

class BalanceMovementResponse(BaseModel):
    id: UUID
    gathering_center: Optional[GatheringCenterNested]  # Objeto anidado
    gatherer: Optional[GathererNested]  # Objeto anidado
    type_movement: BalanceMovementTypeEnum
    purchase_id: Optional[UUID]  # Mantener para compatibilidad
    ammount: float
    identity: Optional[IdentityNested]  # Objeto anidado
    created_at: datetime
    disabled_at: Optional[datetime]

    class Config:
        from_attributes = True

class PaginatedBalanceMovementResponse(BaseModel):
    items: List[BalanceMovementResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class BalanceSummaryResponse(BaseModel):
    gathering_center_id: UUID  # Mantener para compatibilidad
    gathering_center: Optional[GatheringCenterNested]  # Objeto anidado
    gatherer_id: Optional[UUID] = None  # Mantener para compatibilidad
    gatherer: Optional[GathererNested]  # Objeto anidado
    total_balance: float
    movements: List[BalanceMovementResponse]

class BalanceSummaryGatherersResponse(BaseModel):
    total_balance: float
    average_balance: float
    daily_amount: float
    monthly_amount: float

# ========== LOT NET WEIGHT HISTORY SCHEMAS ==========
class LotNetWeightHistoryCreate(BaseModel):
    """Schema para crear un registro de historial de peso neto"""
    lot_id: UUID
    last_net_weight: Optional[float] = None
    new_net_weight: float
    identity_id: Optional[UUID] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "lot_id": "123e4567-e89b-12d3-a456-426614174000",
                "last_net_weight": 100.50,
                "new_net_weight": 150.75,
                "identity_id": "789e0123-e89b-12d3-a456-426614174004"
            }
        }

class LotNetWeightHistoryResponse(BaseModel):
    """Schema para respuesta de historial de peso neto"""
    id: UUID
    lot_id: UUID
    last_net_weight: Optional[float] = None
    new_net_weight: float
    identity_id: Optional[UUID] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class PaginatedLotNetWeightHistoryResponse(BaseModel):
    """Schema para respuesta paginada de historial de peso neto"""
    items: List[LotNetWeightHistoryResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# ========== LOT STATUS HISTORY SCHEMAS ==========
class LotStatusHistoryResponse(BaseModel):
    id: UUID
    lot_id: UUID
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# ========== LOT PROCESS HISTORY SCHEMAS ==========
class LotProcessHistoryResponse(BaseModel):
    id: UUID
    lot_id: UUID
    process: str
    created_at: datetime

    class Config:
        from_attributes = True

# ========== LOT STATUS TRANSITION SCHEMAS ==========
class LotStatusTransitionResponse(BaseModel):
    id: UUID
    lot_id: UUID
    last_status: str
    new_status: str
    identity_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# ========== LOT PROCESS TRANSITION SCHEMAS ==========
class LotProcessTransitionResponse(BaseModel):
    id: UUID
    lot_id: UUID
    last_process: str
    new_process: str
    identity_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
