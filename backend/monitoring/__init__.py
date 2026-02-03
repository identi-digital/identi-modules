# Module exports
# Re-export src.models as models and src.schemas as schemas
# This allows imports like: from modules.monitoring.models.audit_logs import AuditLogModel
import sys

# Import models first
from .src import models

# CRÍTICO: Registrar models en sys.modules ANTES de importar schemas
# porque schemas.py usa importaciones absolutas como 'from modules.monitoring.models...'
sys.modules[f'{__name__}.models'] = models

# Ahora importar schemas (que puede usar modules.monitoring.models)
from .src import schemas

# Registrar schemas en sys.modules
sys.modules[f'{__name__}.schemas'] = schemas


class Module:
    name = "monitoring"  # si o si, snake case
    dependencies = []

    def __init__(self, container, **kwargs):
        self.container = container
        self.options = kwargs

    def register_services(self):
        self.log("registrando servicios")
        # Importación lazy: solo cuando se necesita, después de que el módulo esté inicializado
        from .src.functionalities import Funcionalities
        self.container.register("monitoring", lambda: Funcionalities(self.container))

    def register_routes(self, app):
        self.log("registrando rutas")
        # Importación lazy: solo cuando se necesita, después de que el módulo esté inicializado
        from .src.routes import router
        app.include_router(router)

    def log(self, message):
        print(f"[MODULE::{self.name}] {message}")

__all__ = ['Module']

