# Sync module exports
import sys
import importlib

# Import src submodules explícitos para que funcione en ambos contextos
# (modules.sync o backend.modules.sync)
try:
    # Intentar importación relativa primero (funciona cuando se importa como modules.sync)
    resources = importlib.import_module('.src.resources', __name__)
    functionalities = importlib.import_module('.src.functionalities', __name__)
except (ImportError, ValueError) as e:
    # Si falla, intentar importación absoluta basada en el nombre del módulo
    module_name = __name__
    if module_name.startswith('backend.modules.'):
        # Si se importó como backend.modules.sync, usar ese path
        base_name = module_name.replace('backend.modules.', '')
        resources = importlib.import_module(f'backend.modules.{base_name}.src.resources')
        functionalities = importlib.import_module(f'backend.modules.{base_name}.src.functionalities')
    elif module_name.startswith('modules.'):
        # Si se importó como modules.sync, usar ese path
        base_name = module_name.replace('modules.', '')
        resources = importlib.import_module(f'modules.{base_name}.src.resources')
        functionalities = importlib.import_module(f'modules.{base_name}.src.functionalities')
    else:
        raise ImportError(f"No se pudo determinar el path base del módulo desde: {module_name}")

# Make src.resources accessible como modules.sync.resources o backend.modules.sync.resources
sys.modules[f'{__name__}.resources'] = resources

# Make src.functionalities accessible como modules.sync.functionalities o backend.modules.sync.functionalities
sys.modules[f'{__name__}.functionalities'] = functionalities

class Module:
    name = "sync"  # si o si, snake case
    dependencies = []

    def __init__(self, container, **kwargs):
        self.container = container
        self.options = kwargs

    def register_services(self):
        self.log("registrando servicios")
        # Importación lazy: solo cuando se necesita, después de que el módulo esté inicializado
        from .src.functionalities import SyncManager, ParserService
        # El SyncManager se inicializa inmediatamente para que _initialize_clients() se ejecute
        # Esto asegura que la configuración de Parse se guarde en app_config al levantar
        sync_manager = SyncManager(self.container)
        parser_service = ParserService(self.options)
        self.container.register("sync", lambda: sync_manager)
        self.container.register("parser_service", lambda: parser_service)

    def register_routes(self, app):
        self.log("registrando rutas")
        # Importación lazy: solo cuando se necesita, después de que el módulo esté inicializado
        from .src.routes import router
        app.include_router(router)

    def log(self, message):
        print(f"[MODULE::{self.name}] {message}")

__all__ = ['Module']
