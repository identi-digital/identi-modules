# Re-export src.models as models and src.schemas as schemas
# This allows imports like: from modules.locations.models.countries import CountryModel
import sys

# Import src submodules explicitly
from .src import models
from .src import schemas

# Make src.models accessible as modules.locations.models
sys.modules[f'{__name__}.models'] = models
sys.modules[f'{__name__}.schemas'] = schemas

# NO importar functionalities y routes aquí a nivel de módulo
# Hacerlo causaría importaciones circulares porque functionalities.py usa
# importaciones absolutas que requieren que el módulo esté completamente inicializado
# En su lugar, importamos lazy dentro de los métodos cuando se necesiten

class Module:
    name = "locations"  # si o si, snake case
    dependencies = []

    def __init__(self, container, **kwargs):
        self.container = container
        self.options = kwargs

    def register_services(self):
        self.log("registrando servicios")
        # Importación lazy: solo cuando se necesita, después de que el módulo esté inicializado
        from .src.functionalities import Funcionalities
        # Obtener el nombre de la base de datos de las opciones del módulo
        database_key = self.options.get("database", "core_db")
        self.container.register("locations", lambda: Funcionalities(self.container, database_key=database_key))

    def register_routes(self, app):
        self.log("registrando rutas")
        # Importación lazy: solo cuando se necesita, después de que el módulo esté inicializado
        from .src.routes import router
        app.include_router(router)

    def log(self, message):
        print(f"[MODULE::{self.name}] {message}")

__all__ = ['Module']

