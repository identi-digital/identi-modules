"""
Lógica de negocio del módulo Hello World

📚 Documentación: docs/BACKEND_MODULE_GUIDE.md
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from .models.greeting import GreetingModel
from .schemas import GreetingCreate, GreetingUpdate

class Funcionalities:
    """
    Clase que contiene la lógica de negocio del módulo
    
    Esta clase maneja todas las operaciones de base de datos
    y lógica de negocio para el módulo Hello World.
    """
    def __init__(self, container):
        self.container = container
    
    def get_db(self) -> Session:
        """Obtiene la sesión de base de datos"""
        return self.container.get("db_session")
    
    def create_greeting(self, data: GreetingCreate) -> GreetingModel:
        """Crea un nuevo saludo"""
        db = self.get_db()
        greeting = GreetingModel(**data.dict())
        db.add(greeting)
        db.commit()
        db.refresh(greeting)
        return greeting
    
    def get_greeting_by_id(self, greeting_id: UUID) -> Optional[GreetingModel]:
        """Obtiene un saludo por ID"""
        db = self.get_db()
        return db.query(GreetingModel).filter(
            GreetingModel.id == greeting_id,
            GreetingModel.disabled_at.is_(None)
        ).first()
    
    def get_greetings(self) -> List[GreetingModel]:
        """Obtiene todos los saludos activos"""
        db = self.get_db()
        return db.query(GreetingModel).filter(
            GreetingModel.disabled_at.is_(None)
        ).all()
    
    def update_greeting(self, greeting_id: UUID, data: GreetingUpdate) -> Optional[GreetingModel]:
        """Actualiza un saludo"""
        db = self.get_db()
        greeting = self.get_greeting_by_id(greeting_id)
        if not greeting:
            return None
        
        for key, value in data.dict(exclude_unset=True).items():
            setattr(greeting, key, value)
        
        db.commit()
        db.refresh(greeting)
        return greeting
    
    def delete_greeting(self, greeting_id: UUID) -> bool:
        """Elimina un saludo (soft delete)"""
        db = self.get_db()
        greeting = self.get_greeting_by_id(greeting_id)
        if not greeting:
            return False
        
        from datetime import datetime
        greeting.disabled_at = datetime.utcnow()
        db.commit()
        return True

