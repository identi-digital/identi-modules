from datetime import datetime
from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session

from .models.agent import AgentModel
from .models.agent_assignment import AgentAssignmentModel
from .schemas import (
    AgentCreate, AgentUpdate, AgentResponse, PaginatedAgentResponse,
    AgentAssignmentCreate, AgentAssignmentResponse
)

class Funcionalities:
    def __init__(self, container, database_key: str = "core_db"):
        self.container = container
        self.database_key = database_key
        
    def _get_db(self) -> Session:
        """Obtiene la sesión de base de datos desde el container"""
        return self.container.get(self.database_key, "databases")
    
    def _get_auth_service(self):
        """Obtiene el servicio de auth desde el container"""
        return self.container.get("auth")
    
    # ========== AGENT METHODS ==========
    def create_agent(self, agent_data: AgentCreate) -> AgentResponse:
        """Crea un nuevo agente y su identidad asociada"""
        db = self._get_db()
        auth_service = self._get_auth_service()
        
        try:
            # Crear la identidad en el módulo auth
            from modules.auth.src.schemas import IdentityCreate
            
            identity_data = IdentityCreate(
                username=agent_data.username,
                email=agent_data.email,
                sms_number=agent_data.sms_number,
                eid=agent_data.dni,  # Using DNI as the external identifier
                first_name=agent_data.first_name,
                last_name=agent_data.last_name
            )
            
            identity = auth_service.create_identity(identity_data)
            
            # Crear el agente con el identity_id devuelto
            agent_dict = agent_data.model_dump(exclude_none=True)
            agent_dict['identity_id'] = identity.id
            
            agent = AgentModel(**agent_dict)
            db.add(agent)
            db.commit()
            db.refresh(agent)
            return AgentResponse.model_validate(agent)
        except Exception as e:
            db.rollback()
            raise e
    
    def get_agents_paginated(
        self, 
        page: int = 1, 
        per_page: int = 10,
        sort_by: Optional[str] = None,
        order: Optional[str] = "desc",
        search: str = ""
    ) -> PaginatedAgentResponse:
        """Obtiene agentes paginados (solo los no deshabilitados)"""
        db = self._get_db()
        
        query = db.query(AgentModel).filter(AgentModel.disabled_at.is_(None))
        
        # Aplicar búsqueda si se proporciona
        if search:
            query = query.filter(
                (AgentModel.first_name.ilike(f"%{search}%")) |
                (AgentModel.last_name.ilike(f"%{search}%")) |
                (AgentModel.dni.ilike(f"%{search}%")) |
                (AgentModel.username.isnot(None) & AgentModel.username.ilike(f"%{search}%")) |
                (AgentModel.email.isnot(None) & AgentModel.email.ilike(f"%{search}%"))
            )
        
        # Aplicar ordenamiento
        if sort_by:
            sort_column = getattr(AgentModel, sort_by, None)
            if sort_column is not None:
                if order and order.lower() == "desc":
                    query = query.order_by(sort_column.desc())
                else:
                    query = query.order_by(sort_column.asc())
        else:
            # Ordenamiento por defecto
            query = query.order_by(AgentModel.created_at.desc())
        
        total = query.count()
        offset = (page - 1) * per_page
        total_pages = (total + per_page - 1) // per_page
        
        agents = query.offset(offset).limit(per_page).all()
        
        return PaginatedAgentResponse(
            items=[AgentResponse.model_validate(agent) for agent in agents],
            total=total,
            page=page,
            page_size=per_page,
            total_pages=total_pages
        )
    
    def get_agent_by_id(self, agent_id: UUID) -> Optional[AgentResponse]:
        """Obtiene un agente específico por ID (solo si no está deshabilitado)"""
        db = self._get_db()
        agent = db.query(AgentModel).filter(
            AgentModel.id == agent_id,
            AgentModel.disabled_at.is_(None)
        ).first()
        
        if not agent:
            return None
        
        return AgentResponse.model_validate(agent)
    
    def update_agent(self, agent_id: UUID, agent_data: AgentUpdate) -> Optional[AgentResponse]:
        """Actualiza un agente existente y su identidad asociada"""
        db = self._get_db()
        auth_service = self._get_auth_service()
        
        try:
            agent = db.query(AgentModel).filter(
                AgentModel.id == agent_id,
                AgentModel.disabled_at.is_(None)
            ).first()
            
            if not agent:
                return None
            
            # Actualizar la identidad en el módulo auth
            from modules.auth.src.schemas import IdentityUpdate
            
            identity_update_data = IdentityUpdate()
            if agent_data.first_name or agent_data.last_name:
                # Obtener los valores actuales o los nuevos
                first_name = agent_data.first_name if agent_data.first_name else agent.first_name
                last_name = agent_data.last_name if agent_data.last_name else agent.last_name
                identity_update_data.name = f"{first_name} {last_name}"
            
            if agent_data.email is not None:
                identity_update_data.email = agent_data.email
            
            # Actualizar la identidad
            auth_service.update_identity(agent.identity_id, identity_update_data)
            
            # Actualizar el agente
            update_data = agent_data.model_dump(exclude_none=True)
            for key, value in update_data.items():
                setattr(agent, key, value)
            
            agent.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(agent)
            return AgentResponse.model_validate(agent)
        except Exception as e:
            db.rollback()
            raise e
    
    # ========== AGENT ASSIGNMENT METHODS ==========
    def assign_farmer_to_agent(self, assignment_data: AgentAssignmentCreate) -> AgentAssignmentResponse:
        """Asigna un farmer a un agente"""
        db = self._get_db()
        try:
            # Verificar que no exista una asignación activa
            existing = db.query(AgentAssignmentModel).filter(
                AgentAssignmentModel.agent_id == assignment_data.agent_id,
                AgentAssignmentModel.farmer_id == assignment_data.farmer_id,
                AgentAssignmentModel.disabled_at.is_(None)
            ).first()
            
            if existing:
                raise ValueError("Ya existe una asignación activa entre este agente y farmer")
            
            # Verificar que el agente existe y no está deshabilitado
            agent = db.query(AgentModel).filter(
                AgentModel.id == assignment_data.agent_id,
                AgentModel.disabled_at.is_(None)
            ).first()
            
            if not agent:
                raise ValueError("Agente no encontrado o está deshabilitado")
            
            assignment = AgentAssignmentModel(**assignment_data.model_dump())
            db.add(assignment)
            db.commit()
            db.refresh(assignment)
            return AgentAssignmentResponse.model_validate(assignment)
        except Exception as e:
            db.rollback()
            raise e
    
    def unassign_farmer_from_agent(self, agent_id: UUID, farmer_id: UUID) -> bool:
        """Quita la asignación de un farmer a un agente (soft delete)"""
        db = self._get_db()
        try:
            assignment = db.query(AgentAssignmentModel).filter(
                AgentAssignmentModel.agent_id == agent_id,
                AgentAssignmentModel.farmer_id == farmer_id,
                AgentAssignmentModel.disabled_at.is_(None)
            ).first()
            
            if not assignment:
                return False
            
            assignment.disabled_at = datetime.utcnow()
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
    
    def get_agent_assignments(self, agent_id: UUID) -> List[AgentAssignmentResponse]:
        """Obtiene todas las asignaciones activas de un agente"""
        db = self._get_db()
        assignments = db.query(AgentAssignmentModel).filter(
            AgentAssignmentModel.agent_id == agent_id,
            AgentAssignmentModel.disabled_at.is_(None)
        ).all()
        
        return [AgentAssignmentResponse.model_validate(assignment) for assignment in assignments]
