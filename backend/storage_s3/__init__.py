"""
Módulo Storage S3 - Implementación de storage para AWS S3
Incluye gestión de archivos en S3 y metadatos de medias en base de datos
"""
import sys
from pathlib import Path

# Import src submodules explicitly
from .src import models

# Make src.models accessible as modules.storage_s3.models
sys.modules[f'{__name__}.models'] = models


class Module:
    """
    Módulo Storage S3 - Implementación de storage para AWS S3
    
    Este módulo implementa:
    - Interfaz estándar de storage para AWS S3
    - Gestión de metadatos de medias en base de datos
    """
    name = "storage_s3"  # snake_case obligatorio
    dependencies = []  # Lista de módulos de los que depende
    
    def __init__(self, container, **kwargs):
        self.container = container
        self.options = kwargs
    
    def register_services(self):
        """Registra los servicios del módulo en el container"""
        self.log("registrando servicios")
        try:
            from .src.storage_s3_manager import StorageS3Manager
            from .src.functionalities import Funcionalities
            from .environment import AWS_S3_ACCESS_KEY_ID, AWS_S3_SECRET_ACCESS_KEY, AWS_S3_BUCKET
            
            # Verificar que las credenciales estén disponibles antes de registrar
            missing_vars = []
            if not AWS_S3_ACCESS_KEY_ID:
                missing_vars.append("AWS_S3_ACCESS_KEY_ID")
            if not AWS_S3_SECRET_ACCESS_KEY:
                missing_vars.append("AWS_S3_SECRET_ACCESS_KEY")
            if not AWS_S3_BUCKET:
                missing_vars.append("AWS_S3_BUCKET")
            
            if missing_vars:
                error_msg = f"Variables de entorno faltantes para S3: {', '.join(missing_vars)}. Configúralas en tu archivo .env o variables de entorno."
                self.log(f"⚠️ ADVERTENCIA: {error_msg}")
                self.log("⚠️ El servicio de storage se registrará pero fallará al inicializarse hasta que se configuren las credenciales.")
                # Registrar de todas formas, pero el error se mostrará cuando se intente usar
            else:
                self.log("✓ Credenciales de S3 verificadas correctamente")
            
            # Registrar el StorageS3Manager en el container como "storage" (para operaciones de S3)
            # Usar lambda para inicialización lazy (solo cuando se necesite)
            self.container.register("storage", lambda: StorageS3Manager())
            self.log("servicio 'storage' registrado correctamente en el container")
            
            # Registrar Funcionalities en el container como "storage_s3" (para operaciones de DB)
            database_key = self.options.get("database", "core_db")
            self.container.register("storage_s3", lambda: Funcionalities(self.container, database_key=database_key))
            self.log("servicio 'storage_s3' registrado correctamente en el container")
            
            # Verificar que se registró correctamente
            if "storage" in self.container.builders.get("modules", {}):
                self.log("verificación: 'storage' encontrado en container.builders['modules']")
            else:
                self.log("⚠️ ADVERTENCIA: 'storage' NO encontrado en container.builders['modules']")
        except Exception as e:
            self.log(f"❌ ERROR al registrar servicios: {e}")
            import traceback
            traceback.print_exc()
            raise
    
    def register_routes(self, app):
        """Registra las rutas del módulo en FastAPI"""
        self.log("registrando rutas")
        # Importación lazy: solo cuando se necesita, después de que el módulo esté inicializado
        from .src.routes import router
        app.include_router(router)
    
    def log(self, message):
        print(f"[MODULE::{self.name}] {message}")


__all__ = ['Module']
