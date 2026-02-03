# Auth module exports
import sys
from typing import Optional
from fastapi import Request, HTTPException

# Import src submodules explicitly
from .src import models
from .src import schemas

# Make src.models accessible as modules.auth.models
sys.modules[f'{__name__}.models'] = models

# Make src.schemas accessible as modules.auth.schemas
sys.modules[f'{__name__}.schemas'] = schemas

class Module:
    name = "auth"  # si o si, snake case
    dependencies = []

    def __init__(self, container, **kwargs):
        self.container = container
        self.options = kwargs

    def register_services(self):
        self.log("registrando servicios")
        # Importación lazy: solo cuando se necesita, después de que el módulo esté inicializado
        try:
            from .src.functionalities import Funcionalities
            self.container.register("auth", lambda: Funcionalities(self.container))
        except Exception as e:
            self.log(f"ERROR al registrar servicio: {e}")
            import traceback
            traceback.print_exc()
            raise

    def register_routes(self, app):
        self.log("registrando rutas")
        # Importación lazy: solo cuando se necesita, después de que el módulo esté inicializado
        from .src.routes import router
        app.include_router(router)

    def log(self, message):
        print(f"[MODULE::{self.name}] {message}")

__all__ = ['Module']
