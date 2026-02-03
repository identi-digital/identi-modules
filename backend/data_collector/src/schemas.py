from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Generic, TypeVar, Union
from typing_extensions import TypedDict
from datetime import datetime
from uuid import UUID
from decimal import Decimal
# Usar importaciones relativas para evitar problemas durante la inicialización del módulo
from .models.forms import ChannelName, FormType, ViewerType, FormPurpose
from .models.action_tools import ChannelType
from .models.core_registers import RegisterStatus

# Tipo genérico para paginación
DataT = TypeVar('DataT')


# Type definitions for detail structure
class EntityValue(TypedDict, total=False):
    """Estructura de value cuando type='entity'"""
    id: str
    display_name: str


class DetailItem(TypedDict, total=False):
    """
    Estructura de cada item en el array detail.
    
    Campos principales:
    - name: Nombre del campo
    - value: Valor capturado (puede ser cualquier tipo)
      * Para entidades: EntityValue o List[EntityValue] (detectado por estructura)
      * Otros tipos: Any (string, number, boolean, etc)
    
    Campos opcionales:
    - display_name: Nombre legible para mostrar
    - is_unique: Indica si el campo es único en la entidad
    - is_multiple: Indica si el campo acepta múltiples valores
    - type_value: Legacy (opcional)
    - type_list_value: Legacy (opcional)
    """
    name: str
    value: Union[Any, EntityValue, List[EntityValue]]
    display_name: Optional[str]
    is_unique: Optional[bool]
    is_multiple: Optional[bool]
    type_value: Optional[str]           # Legacy
    type_list_value: Optional[str]      # Legacy


DetailArray = List[DetailItem]

# Clase base genérica para respuestas paginadas
class PaginationsBase(BaseModel, Generic[DataT]):
    page: int = 1
    per_page: int = 10
    total: int
    items: List[DataT] = []

# Form Schemas
class FormCreate(BaseModel):
    id: Optional[UUID] = None  # ID opcional para permitir IDs personalizados desde config.yaml
    channel_name: Union[ChannelName, str]
    flow_type: Union[FormType, str]
    name: str
    image_path: Optional[str] = None
    description: Optional[str] = None
    schema_id: Optional[UUID] = None
    viewer: Optional[List[Union[ViewerType, str]]] = None
    gps_tracking: Optional[Dict[str, Any]] = None
    entity_name: Optional[str] = None
    form_purpose: Optional[Union[FormPurpose, str]] = None

class FormUpdate(BaseModel):
    channel_name: Optional[ChannelName] = None
    flow_type: Optional[FormType] = None
    name: Optional[str] = None
    image_path: Optional[str] = None
    description: Optional[str] = None
    schema_id: Optional[UUID] = None
    viewer: Optional[List[ViewerType]] = None
    gps_tracking: Optional[Dict[str, Any]] = None
    entity_name: Optional[str] = None
    form_purpose: Optional[FormPurpose] = None

class FormResponse(BaseModel):
    id: UUID
    channel_name: ChannelName
    flow_type: FormType
    name: str
    image_path: Optional[str]
    description: Optional[str]
    schema_id: Optional[UUID]
    viewer: Optional[List[ViewerType]]
    gps_tracking: Optional[Dict[str, Any]]
    entity_name: Optional[str]
    form_purpose: Optional[FormPurpose]
    created_at: datetime
    updated_at: datetime
    disabled_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class PaginatedFormResponse(PaginationsBase[FormResponse]):
    pass

# Form with Schema Response (para obtener form con su schema)
class FormWithSchemaResponse(BaseModel):
    """Respuesta que incluye el form completo con su schema"""
    id: UUID
    channel_name: ChannelName
    flow_type: FormType
    name: str
    image_path: Optional[str]
    description: Optional[str]
    schema_id: Optional[UUID]
    viewer: Optional[List[ViewerType]]
    gps_tracking: Optional[Dict[str, Any]]
    entity_name: Optional[str]
    form_purpose: Optional[FormPurpose]
    created_at: datetime
    updated_at: datetime
    disabled_at: Optional[datetime]
    schema: Optional[Dict[str, Any]] = None  # Schema del schema_form asociado
    
    class Config:
        from_attributes = True

# Action Tool Schemas
class ActionToolCreate(BaseModel):
    category_name: Optional[str] = None
    sub_category_name: Optional[str] = None
    channels: Optional[List[ChannelType]] = None
    name: str
    description: Optional[str] = None
    place_holder: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    on_action: Optional[Dict[str, Any]] = None
    schema_variables: Optional[List[Dict[str, Any]]] = None
    schema_input: Optional[List[Dict[str, Any]]] = None
    config_form: Optional[Dict[str, Any]] = None

class ActionToolUpdate(BaseModel):
    tenant: Optional[str] = None
    category_name: Optional[str] = None
    sub_category_name: Optional[str] = None
    channels: Optional[List[ChannelType]] = None
    name: Optional[str] = None
    description: Optional[str] = None
    place_holder: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    on_action: Optional[Dict[str, Any]] = None
    schema_variables: Optional[List[Dict[str, Any]]] = None
    schema_input: Optional[List[Dict[str, Any]]] = None
    config_form: Optional[Dict[str, Any]] = None

class ActionToolResponse(BaseModel):
    id: UUID
    category_name: Optional[str]
    sub_category_name: Optional[str]
    channels: Optional[List[ChannelType]]
    name: str
    description: Optional[str]
    place_holder: Optional[str]
    icon: Optional[str]
    color: Optional[str]
    on_action: Optional[Dict[str, Any]]
    schema_variables: Optional[List[Dict[str, Any]]]
    schema_input: Optional[List[Dict[str, Any]]]
    config_form: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    disabled_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class PaginatedActionToolResponse(PaginationsBase[ActionToolResponse]):
    pass

# Core Register Schemas
class CoreRegisterCreate(BaseModel):
    form_id: UUID
    schema_form_id: UUID
    detail: Optional[DetailArray] = None  # Array de objetos con estructura DetailItem
    location: Optional[str] = None  # Geometry como WKT string (ej: "POINT(0 0)")
    identity_id: Optional[UUID] = None
    duration: Optional[Decimal] = None  # Duración en segundos
    
    class Config:
        json_schema_extra = {
            "example": {
                "form_id": "uuid...",
                "schema_form_id": "uuid...",
                "detail": [
                    {
                        "name": "first_name",
                        "value": "Juan",
                        "type_value": "text",
                        "display_name": "Nombre"
                    },
                    {
                        "name": "farmer_id",
                        "value": {
                            "id": "550e8400-e29b-41d4-a716-446655440000",
                            "display_name": "Juan Pérez"
                        },
                        "type_value": "entity",
                        "display_name": "Agricultor",
                        "is_unique": False
                    }
                ],
                "identity_id": "uuid...",
                "duration": 38900 #(ms)
            }
        }

class CoreRegisterUpdate(BaseModel):
    detail: Optional[DetailArray] = None
    status: Optional[RegisterStatus] = None
    error: Optional[Dict[str, Any]] = None
    location: Optional[str] = None  # Geometry como WKT string
    entity_name: Optional[str] = None
    entity_id: Optional[UUID] = None
    identity_id: Optional[UUID] = None
    duration: Optional[Decimal] = None  # Duración en segundos

class FormInfo(BaseModel):
    """Schema para información básica del formulario"""
    id: UUID
    name: str

class CoreRegisterResponse(BaseModel):
    id: UUID
    form_id: UUID
    form: Optional[FormInfo] = None  # Objeto form con id y name
    schema_form_id: UUID
    detail: Optional[DetailArray] = None  # Array con estructura DetailItem
    status: RegisterStatus
    error: Optional[Dict[str, Any]]
    location: Optional[str] = None  # Geometry se serializa como WKT string
    entity_name: Optional[str] = None
    entity_id: Optional[UUID] = None
    identity_id: Optional[UUID] = None
    duration: Optional[Decimal] = None  # Duración en segundos
    created_at: datetime
    updated_at: datetime
    disabled_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class PaginatedCoreRegisterResponse(PaginationsBase[CoreRegisterResponse]):
    pass

# Referencable Entity Schemas
class ReferencableEntityResponse(BaseModel):
    id: UUID
    module_name: str
    entity_name: str
    display_name: Optional[str]
    description: Optional[str]
    representative_value: Optional[str]
    created_at: datetime
    updated_at: datetime
    disabled_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# Schema simplificado para la API de entidades (solo campos esenciales)
class EntityListItemResponse(BaseModel):
    """Schema simplificado que solo devuelve id (entity_name), display_name y description"""
    id: str  # entity_name (se usa como id en lugar del UUID de la BD)
    display_name: Optional[str]
    description: Optional[str]
    
    class Config:
        from_attributes = True

class PaginatedReferencableEntityResponse(PaginationsBase[ReferencableEntityResponse]):
    pass

# Respuesta paginada simplificada para la API de entidades
class PaginatedEntityListItemResponse(PaginationsBase[EntityListItemResponse]):
    pass

# Entity Data Response (para datos paginados de una entidad específica)
class EntityDataItemResponse(BaseModel):
    """Respuesta simplificada para datos de una entidad: solo id y name"""
    id: Any  # ID del registro (puede ser UUID o String)
    name: str  # Nombre generado desde representative_value
    
    class Config:
        from_attributes = True

class PaginatedEntityDataResponse(PaginationsBase[EntityDataItemResponse]):
    pass

# Schema Form Request (para crear/actualizar schema de un form)
class FormSchemaCreate(BaseModel):
    """Schema para crear/actualizar el schema de un formulario"""
    schema: Dict[str, Any]  # Debe contener instructions y instruction_start

# Unique Field Validation Schemas
class UniqueFieldValidationRequest(BaseModel):
    """Request para validar si un campo es único en una entidad"""
    entity_name: str  # Nombre de la entidad (ej: "farmers", "farms")
    entity_field: Dict[str, Any]  # Campo y valor a validar (ej: {"dni": "12345678"})
    entity_exclude_id: Optional[UUID] = None  # ID de la entidad a excluir (útil para updates)
    
    class Config:
        json_schema_extra = {
            "example": {
                "entity_name": "farmers",
                "entity_field": {"dni": "12345678"},
                "entity_exclude_id": None
            }
        }

class UniqueFieldValidationResponse(BaseModel):
    """Respuesta de validación de campo único"""
    exist: bool  # True si el valor ya existe, False si no existe
