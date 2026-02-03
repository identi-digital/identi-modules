# Module exports
# Re-export src.models as models and src.schemas as schemas
# This allows imports like: from modules.data_collector.models.forms import FormModel
import sys

# Import models from src.models (not src)
from .src import models
from .src import schemas

# CRÍTICO: Registrar models en sys.modules ANTES de importar schemas
# porque schemas.py usa importaciones absolutas como 'from modules.data_collector.models...'
sys.modules[f'{__name__}.models'] = models

# Registrar schemas en sys.modules
sys.modules[f'{__name__}.schemas'] = schemas

# NO importar functionalities y routes aquí a nivel de módulo
# Hacerlo causaría importaciones circulares porque functionalities.py usa
# importaciones absolutas que requieren que el módulo esté completamente inicializado
# En su lugar, importamos lazy dentro de los métodos cuando se necesiten

class Module:
    name = "data_collector"  # si o si, snake case
    dependencies = []

    def __init__(self, container, **kwargs):
        self.container = container
        self.options = kwargs

    def register_services(self):
        self.log("registrando servicios")
        # Importación lazy: solo cuando se necesita, después de que el módulo esté inicializado
        try:
            from .src.functionalities import Funcionalities
            self.container.register("data_collector", lambda: Funcionalities(self.container))
            self.log("servicio data_collector registrado correctamente")
            
            # Actualizar configuración del trigger al iniciar
            self._update_trigger_config()
        except Exception as e:
            self.log(f"ERROR al registrar servicio: {e}")
            import traceback
            traceback.print_exc()
            raise
    
    def _update_trigger_config(self):
        """
        Actualiza la configuración del trigger en app_config al iniciar el módulo.
        
        Prioridad de configuración:
        1. Variable de entorno TRIGGER_BACKEND_API_URL (más alta)
        2. config.yaml → backend.server.baseUrl + backend.server.port
        3. Valor por defecto: http://host.docker.internal:8000
        """
        import os
        import yaml
        from pathlib import Path
        from uuid import uuid4
        from datetime import datetime
        
        try:
            # Obtener la base de datos
            db = self.container.get("core_db", "databases")
            
            # Verificar si la tabla app_config existe antes de intentar usarla
            from sqlalchemy import inspect, text
            from sqlalchemy.exc import ProgrammingError, OperationalError
            
            try:
                inspector = inspect(db.bind)
                if 'app_config' not in inspector.get_table_names(schema='public'):
                    self.log(f"⚠️  Tabla app_config aún no existe. La configuración del trigger se actualizará después de ejecutar las migraciones.")
                    return
            except (ProgrammingError, OperationalError, AttributeError) as e:
                # Si no se puede inspeccionar, intentar una consulta directa
                try:
                    db.execute(text("SELECT 1 FROM app_config LIMIT 1"))
                except (ProgrammingError, OperationalError) as e2:
                    error_msg = str(e2)
                    if "does not exist" in error_msg or "UndefinedTable" in error_msg:
                        self.log(f"⚠️  Tabla app_config aún no existe. La configuración del trigger se actualizará después de ejecutar las migraciones.")
                        return
                    raise
            
            # Importar el modelo
            from core.models.core import AppConfigModel
            
            # Determinar la URL del backend
            backend_api_url = None
            
            # 1. Prioridad: Variable de entorno
            if os.getenv("TRIGGER_BACKEND_API_URL"):
                backend_api_url = os.getenv("TRIGGER_BACKEND_API_URL").strip()
                self.log(f"Usando TRIGGER_BACKEND_API_URL desde variable de entorno: {backend_api_url}")
            else:
                # 2. Leer desde config.yaml
                try:
                    current_file = Path(__file__).resolve()
                    project_root = current_file.parent.parent.parent.parent
                    config_path = project_root / "config.yaml"
                    
                    if config_path.exists():
                        with open(config_path, 'r') as f:
                            config = yaml.safe_load(f)
                        
                        backend_config = config.get("backend", {})
                        server_config = backend_config.get("server", {})
                        
                        base_url = server_config.get("baseUrl", "127.0.0.1")
                        port = server_config.get("port", 8000)
                        
                        # Construir URL completa
                        if base_url.startswith("http://") or base_url.startswith("https://"):
                            backend_api_url = f"{base_url}:{port}"
                        else:
                            backend_api_url = f"http://{base_url}:{port}"
                        
                        self.log(f"Usando URL desde config.yaml: {backend_api_url}")
                    else:
                        # 3. Valor por defecto
                        backend_api_url = "http://host.docker.internal:8000"
                        self.log(f"Usando URL por defecto: {backend_api_url}")
                except Exception as e:
                    self.log(f"Error al leer config.yaml: {e}, usando valor por defecto")
                    backend_api_url = "http://host.docker.internal:8000"
            
            # Actualizar o crear trigger_backend_api_url
            config_url = db.query(AppConfigModel).filter(
                AppConfigModel.key == 'trigger_backend_api_url',
                AppConfigModel.disabled_at.is_(None)
            ).first()
            
            if config_url:
                if config_url.value != backend_api_url:
                    config_url.value = backend_api_url
                    config_url.updated_at = datetime.utcnow()
                    db.commit()
                    self.log(f"Actualizado trigger_backend_api_url: {backend_api_url}")
                else:
                    self.log(f"trigger_backend_api_url ya está configurado: {backend_api_url}")
            else:
                # Crear nuevo registro
                config_url = AppConfigModel(
                    key='trigger_backend_api_url',
                    value=backend_api_url,
                    description='URL completa del backend para llamadas desde triggers de PostgreSQL'
                )
                db.add(config_url)
                db.commit()
                self.log(f"Creado trigger_backend_api_url: {backend_api_url}")
            
            # Verificar/crear trigger_internal_token
            config_token = db.query(AppConfigModel).filter(
                AppConfigModel.key == 'trigger_internal_token',
                AppConfigModel.disabled_at.is_(None)
            ).first()
            
            if not config_token:
                # Crear nuevo token si no existe
                new_token = str(uuid4())
                config_token = AppConfigModel(
                    key='trigger_internal_token',
                    value=new_token,
                    description='Token de autenticación interno para validar llamadas desde triggers de PostgreSQL'
                )
                db.add(config_token)
                db.commit()
                self.log(f"Creado trigger_internal_token: {new_token}")
            else:
                self.log("trigger_internal_token ya existe, manteniendo valor actual")
            
        except Exception as e:
            error_msg = str(e)
            # Si la tabla no existe, solo registrar advertencia (las migraciones la crearán)
            if "does not exist" in error_msg or "UndefinedTable" in error_msg:
                self.log(f"⚠️  Tabla app_config aún no existe. La configuración del trigger se actualizará después de ejecutar las migraciones.")
            else:
                self.log(f"Error al actualizar configuración del trigger: {e}")
                import traceback
                traceback.print_exc()
            # No lanzar excepción para no bloquear el inicio del módulo

    def register_routes(self, app):
        self.log("registrando rutas")
        # Importación lazy: solo cuando se necesita, después de que el módulo esté inicializado
        from .src.routes import router
        app.include_router(router)

    def log(self, message):
        print(f"[MODULE::{self.name}] {message}")

__all__ = ['Module']

