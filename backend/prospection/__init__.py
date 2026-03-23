# Módulo prospection: KYC, métricas y geojson por form_id

class Module:
    name = "prospection"
    dependencies = []

    def __init__(self, container, **kwargs):
        self.container = container
        self.options = kwargs

    def register_services(self):
        """Registra el servicio de prospección."""
        self.log("registrando servicios")
        from modules.prospection.src.service import ProspectionService
        database_key = self.options.get("database", "core_db")
        self.container.register("prospection", lambda: ProspectionService(self.container, database_key=database_key))

    def register_routes(self, app):
        """Registra las rutas del módulo."""
        self.log("registrando rutas")
        from modules.prospection.src.routes import router
        app.include_router(router)

    def log(self, message: str):
        print(f"[MODULE::{self.name}] {message}")


__all__ = ["Module"]
