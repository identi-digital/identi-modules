# Módulo sync: integración con el servicio sync (Parse Server, schemas, datos)

class Module:
    name = "sync"
    dependencies = []

    def __init__(self, container, **kwargs):
        self.container = container
        self.options = kwargs

    def register_services(self):
        """Registra el servicio de integración con sync."""
        self.log("registrando servicios")
        from modules.sync.src.service import SyncService
        self.container.register("sync", lambda: SyncService(self.container))

    def register_routes(self, app):
        """Registra las rutas del módulo."""
        self.log("registrando rutas")
        from modules.sync.src.routes import router
        app.include_router(router)

    def log(self, message: str):
        print(f"[MODULE::{self.name}] {message}")


__all__ = ["Module"]
