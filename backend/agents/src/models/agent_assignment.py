from dataclasses import dataclass
from sqlalchemy import Column, TIMESTAMP, func, text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID

from core.models.base_class import Model

@dataclass
class AgentAssignmentModel(Model):
    """ AgentAssignmentModel - Relación entre agentes y farmers """
    
    __tablename__ = "agent_assignment"
    __table_args__ = (
        Index('idx_agent_assignment_agent', 'agent_id'),
        Index('idx_agent_assignment_farmer', 'farmer_id'),
        Index('idx_agent_assignment_disabled_at', 'disabled_at'),
        {"schema": "public", "extend_existing": True}
    )
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    agent_id = Column(UUID(as_uuid=True), ForeignKey('public.agent.id'), nullable=False, info={"display_name": "Agente", "description": "id del agente"})
    farmer_id = Column(UUID(as_uuid=True), ForeignKey('public.farmers.id'), nullable=False, info={"display_name": "Productor", "description": "id del productor asignado"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    disabled_at = Column(TIMESTAMP, nullable=True, default=None)
    
    def __init__(self, **kwargs):
        super(AgentAssignmentModel, self).__init__(**kwargs)
    
    def __hash__(self):
        return hash(self.id)
