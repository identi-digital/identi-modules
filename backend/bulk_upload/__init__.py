import sys
from .src import models
from .src import schemas

sys.modules[f"{__name__}.models"] = models
sys.modules[f"{__name__}.schemas"] = schemas


class Module:
    name = "bulk_upload"
    dependencies = ["data_collector"]

    def __init__(self, container, **kwargs):
        self.container = container
        self.options = kwargs

    def register_services(self):
        self.log("registrando servicios")
        from .src.functionalities import Funcionalities
        database_key = self.options.get("database", "core_db")
        self.container.register("bulk_upload", lambda: Funcionalities(self.container, database_key=database_key))

    def register_routes(self, app):
        self.log("registrando rutas")
        from .src.routes import router
        app.include_router(router)

    def log(self, message):
        print(f"[MODULE::{self.name}] {message}")


__all__ = ["Module"]
