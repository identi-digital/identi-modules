"""
Módulo Hello World - Ejemplo de módulo backend

📚 Documentación:
- Guía completa: docs/BACKEND_MODULE_GUIDE.md
- Configuración: docs/CONFIG_YAML_GUIDE.md
- Migraciones: docs/MIGRATIONS_README.md
"""
import sys

# Importar models primero
from .src import models
sys.modules[f'{__name__}.models'] = models

# Importar schemas después
from .src import schemas
sys.modules[f'{__name__}.schemas'] = schemas


class Module:
    """
    Módulo Hello World - Ejemplo básico de un módulo backend
    
    Este es un módulo de ejemplo que demuestra la estructura básica
    de un módulo backend en Identi Plugin System.
    
    Para más información, consulta:
    - docs/BACKEND_MODULE_GUIDE.md - Guía completa de desarrollo
    - docs/CONFIG_YAML_GUIDE.md - Configuración de config.yaml
    """
    name = "hello_world"  # snake_case obligatorio
    dependencies = []  # Lista de módulos de los que depende
    
    def __init__(self, container, **kwargs):
        self.container = container
        self.options = kwargs
    
    def register_services(self):
        """Registra los servicios del módulo en el container"""
        self.log("registrando servicios")
        from .src.functionalities import Funcionalities
        # Obtener el nombre de la base de datos de las opciones del módulo
        database_key = self.options.get("database", "core_db")
        self.container.register("hello_world", lambda: Funcionalities(self.container, database_key=database_key))
    
    def register_routes(self, app):
        """Registra las rutas del módulo en FastAPI"""
        self.log("registrando rutas")
        from .src.routes import router
        app.include_router(router)
    
    def log(self, message):
        print(f"[MODULE::{self.name}] {message}")


__all__ = ['Module']

