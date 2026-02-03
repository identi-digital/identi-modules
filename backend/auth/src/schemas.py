from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Generic, TypeVar
from datetime import datetime
from uuid import UUID

# Tipo genérico para paginación
DataT = TypeVar('DataT')

# Clase base genérica para respuestas paginadas
class PaginationsBase(BaseModel, Generic[DataT]):
    page: int = 1
    per_page: int = 10
    total: int
    items: List[DataT] = []

# Identity Schemas
class IdentityCreate(BaseModel):
    username: str
    email: Optional[str] = None
    eid: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    sms_number: Optional[str] = None

class IdentityUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    eid: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    sms_number: Optional[str] = None
    claims: Optional[Dict[str, Any]] = None
    last_seen_at: Optional[datetime] = None

class IdentityResponse(BaseModel):
    id: UUID
    sub: str
    username: Optional[str]
    email: Optional[str]
    eid: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    sms_number: Optional[str]
    claims: Optional[Dict[str, Any]]
    created_at: datetime
    last_seen_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class PaginatedIdentityResponse(BaseModel):
    items: List[IdentityResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# Auth Session Schemas
class AuthSessionCreate(BaseModel):
    identity_id: UUID
    client_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    started_at: datetime

class AuthSessionUpdate(BaseModel):
    ended_at: Optional[datetime] = None

class AuthSessionResponse(BaseModel):
    id: UUID
    identity_id: UUID
    client_id: Optional[str]
    ip_address: Optional[str]
    user_agent: Optional[str]
    started_at: datetime
    ended_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class PaginatedAuthSessionResponse(PaginationsBase[AuthSessionResponse]):
    pass

# Auth Event Schemas
class AuthEventCreate(BaseModel):
    identity_id: UUID
    type: str
    payload: Optional[Dict[str, Any]] = None

class AuthEventResponse(BaseModel):
    id: UUID
    identity_id: UUID
    type: str
    payload: Optional[Dict[str, Any]]
    created_at: datetime
    
    class Config:
        from_attributes = True

class PaginatedAuthEventResponse(PaginationsBase[AuthEventResponse]):
    pass

# Auth Service Integration Schemas
class AuthLoginRequest(BaseModel):
    """Request para login en el servicio de autenticación"""
    username: Optional[str] = None
    email: Optional[str] = None
    password: str
    client_id: Optional[str] = None

class AuthLoginResponse(BaseModel):
    """Response del servicio de autenticación"""
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: Optional[str] = None
    expires_in: Optional[int] = None
    identity: Optional[Dict[str, Any]] = None

class AuthTokenRequest(BaseModel):
    """Request para validar/refrescar token"""
    token: str
    token_type: Optional[str] = "access"  # "access" o "refresh"

class AuthTokenResponse(BaseModel):
    """Response de validación de token"""
    valid: bool
    identity: Optional[Dict[str, Any]] = None
    claims: Optional[Dict[str, Any]] = None
    expires_at: Optional[datetime] = None

class AuthRefreshRequest(BaseModel):
    """Request para refrescar token"""
    refresh_token: str

class AuthRefreshResponse(BaseModel):
    """Response de refresh token"""
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str
    expires_in: int

class AuthLogoutRequest(BaseModel):
    """Request para logout"""
    token: str
    client_id: Optional[str] = None
