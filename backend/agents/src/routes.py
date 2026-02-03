from fastapi import APIRouter, Depends, Request, HTTPException, Query
from uuid import UUID
from typing import List, Optional
from .schemas import (
    AgentCreate, AgentUpdate, AgentResponse, PaginatedAgentResponse,
    AgentAssignmentCreate, AgentAssignmentResponse
)

router = APIRouter(
    prefix="/agents",
    tags=["Agents"]
)

def get_funcionalities(request: Request):
    container = request.app.state.container
    return container.get("agents")

# ========== AGENT ROUTES ==========
@router.post("/", response_model=AgentResponse, status_code=201)
def create_agent(agent_data: AgentCreate, svc=Depends(get_funcionalities)):
    """Crea un nuevo agente y su identidad asociada"""
    try:
        return svc.create_agent(agent_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=PaginatedAgentResponse)
def get_agents(
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar"),
    order: Optional[str] = Query("desc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda"),
    svc=Depends(get_funcionalities)
):
    """Obtiene una lista paginada de agentes"""
    return svc.get_agents_paginated(page=page, per_page=per_page, sort_by=sort_by, order=order, search=search)

@router.get("/{agent_id}", response_model=AgentResponse)
def get_agent(agent_id: UUID, svc=Depends(get_funcionalities)):
    """Obtiene un agente específico por ID"""
    agent = svc.get_agent_by_id(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agente no encontrado")
    return agent

@router.put("/{agent_id}", response_model=AgentResponse)
def update_agent(
    agent_id: UUID,
    agent_data: AgentUpdate,
    svc=Depends(get_funcionalities)
):
    """Actualiza un agente existente y su identidad asociada"""
    agent = svc.update_agent(agent_id, agent_data)
    if not agent:
        raise HTTPException(status_code=404, detail="Agente no encontrado")
    return agent

# ========== AGENT ASSIGNMENT ROUTES ==========
@router.post("/assignments", response_model=AgentAssignmentResponse, status_code=201)
def assign_farmer_to_agent(assignment_data: AgentAssignmentCreate, svc=Depends(get_funcionalities)):
    """Asigna un farmer a un agente"""
    try:
        return svc.assign_farmer_to_agent(assignment_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/assignments", status_code=204)
def unassign_farmer_from_agent(
    agent_id: UUID = Query(..., description="ID del agente"),
    farmer_id: UUID = Query(..., description="ID del farmer"),
    svc=Depends(get_funcionalities)
):
    """Quita la asignación de un farmer a un agente"""
    success = svc.unassign_farmer_from_agent(agent_id, farmer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Asignación no encontrada")
    return None

@router.get("/{agent_id}/assignments", response_model=List[AgentAssignmentResponse])
def get_agent_assignments(agent_id: UUID, svc=Depends(get_funcionalities)):
    """Obtiene todas las asignaciones activas de un agente"""
    return svc.get_agent_assignments(agent_id)
