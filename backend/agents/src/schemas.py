from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum

# Enums
class AgentStatusEnum(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

# ========== AGENT SCHEMAS ==========
class AgentCreate(BaseModel):
    username: str  # ← REQUERIDO para crear la identidad
    first_name: str
    last_name: str
    dni: str
    sms_number: Optional[str] = None
    wsp_number: Optional[str] = None
    cell_number: Optional[str] = None
    email: Optional[EmailStr] = None

class AgentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    dni: Optional[str] = None
    sms_number: Optional[str] = None
    wsp_number: Optional[str] = None
    cell_number: Optional[str] = None
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    status: Optional[AgentStatusEnum] = None

class AgentResponse(BaseModel):
    id: UUID
    identity_id: UUID
    first_name: str
    last_name: str
    dni: str
    sms_number: Optional[str]
    wsp_number: Optional[str]
    cell_number: Optional[str]
    email: Optional[str]
    username: Optional[str]
    status: AgentStatusEnum
    created_at: datetime
    updated_at: Optional[datetime]
    disabled_at: Optional[datetime]

    class Config:
        from_attributes = True

class PaginatedAgentResponse(BaseModel):
    items: List[AgentResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# ========== AGENT ASSIGNMENT SCHEMAS ==========
class AgentAssignmentCreate(BaseModel):
    agent_id: UUID
    farmer_id: UUID

class AgentAssignmentResponse(BaseModel):
    id: UUID
    agent_id: UUID
    farmer_id: UUID
    created_at: datetime
    disabled_at: Optional[datetime]

    class Config:
        from_attributes = True
