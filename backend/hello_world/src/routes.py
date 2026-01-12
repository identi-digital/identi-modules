"""
Rutas FastAPI para el módulo Hello World

📚 Documentación: docs/BACKEND_MODULE_GUIDE.md
"""
from fastapi import APIRouter, Depends, Request, HTTPException
from uuid import UUID
from typing import List
from .schemas import GreetingCreate, GreetingUpdate, GreetingResponse

router = APIRouter(
    prefix="/hello-world",  # IMPORTANTE: Este es el "backend" en config.yaml del frontend
    tags=["Hello World"]
)

def get_funcionalities(request: Request):
    """Dependency para obtener el servicio del módulo"""
    container = request.app.state.container
    return container.get("hello_world")


@router.get("/", response_model=dict)
def hello():
    """
    Endpoint de ejemplo - Hello World
    
    Este es un endpoint simple que retorna un mensaje de saludo.
    No requiere autenticación ni base de datos.
    """
    return {
        "message": "Hello World!",
        "module": "hello_world",
        "documentation": "docs/BACKEND_MODULE_GUIDE.md"
    }


@router.post("/greetings", response_model=GreetingResponse, status_code=201)
def create_greeting(data: GreetingCreate, svc=Depends(get_funcionalities)):
    """Crea un nuevo saludo"""
    try:
        return svc.create_greeting(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/greetings", response_model=List[GreetingResponse])
def get_greetings(svc=Depends(get_funcionalities)):
    """Obtiene todos los saludos"""
    return svc.get_greetings()


@router.get("/greetings/{greeting_id}", response_model=GreetingResponse)
def get_greeting(greeting_id: UUID, svc=Depends(get_funcionalities)):
    """Obtiene un saludo específico por ID"""
    greeting = svc.get_greeting_by_id(greeting_id)
    if not greeting:
        raise HTTPException(status_code=404, detail="Saludo no encontrado")
    return greeting


@router.put("/greetings/{greeting_id}", response_model=GreetingResponse)
def update_greeting(
    greeting_id: UUID,
    data: GreetingUpdate,
    svc=Depends(get_funcionalities)
):
    """Actualiza un saludo existente"""
    greeting = svc.update_greeting(greeting_id, data)
    if not greeting:
        raise HTTPException(status_code=404, detail="Saludo no encontrado")
    return greeting


@router.delete("/greetings/{greeting_id}", status_code=204)
def delete_greeting(greeting_id: UUID, svc=Depends(get_funcionalities)):
    """Elimina un saludo (soft delete)"""
    success = svc.delete_greeting(greeting_id)
    if not success:
        raise HTTPException(status_code=404, detail="Saludo no encontrado")
    return None

