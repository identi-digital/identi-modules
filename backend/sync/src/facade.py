"""
SyncFacade - Fachada principal del módulo sync

Este facade es la interfaz principal que el resto del backend debe usar.
Gestiona múltiples adapters (uno por base de datos) y carga configuración
desde config.yaml.

RESPONSABILIDADES:
- Leer configuración desde config.yaml
- Crear y gestionar adapters por base de datos
- Proporcionar interfaz unificada para el resto del sistema
- Manejar routing de peticiones al adapter correcto
"""
from typing import Dict, Any, Optional, List
from pathlib import Path
import yaml
import re
import os
from .adapter import SyncAdapter, SyncConfig


class SyncFacade:
    """
    Facade principal del módulo sync.
    
    Proporciona una interfaz unificada para sincronización con Parse Server,
    gestionando automáticamente múltiples adapters (uno por base de datos).
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Inicializa el facade cargando configuración desde config.yaml.
        
        Args:
            config_path: Path al archivo config.yaml (opcional, se busca automáticamente)
        """
        self.config_path = config_path or self._find_config_path()
        self.adapters: Dict[str, SyncAdapter] = {}
        self.sync_enabled = False
        self._load_configuration()
    
    def _find_config_path(self) -> Path:
        """
        Busca el archivo config.yaml en la raíz del proyecto.
        
        Returns:
            Path al config.yaml
        """
        current_file = Path(__file__).resolve()
        # Ir hacia arriba: sync/src/facade.py -> sync/src -> sync -> modules -> backend -> project_root
        project_root = current_file.parents[4]
        config_path = project_root / "config.yaml"
        
        if not config_path.exists():
            # Intentar buscar en la raíz del backend
            backend_root = current_file.parents[3]
            config_path = backend_root / "config.yaml"
        
        return config_path
    
    def _replace_env_variables(self, obj):
        """
        Reemplaza variables de entorno en el formato ${VAR_NAME}.
        Recorre recursivamente el objeto y reemplaza strings que contengan ${...}
        
        Args:
            obj: Objeto, lista, string o valor primitivo a procesar
            
        Returns:
            El mismo tipo con las variables reemplazadas
        """
        if isinstance(obj, str):
            # Reemplazar ${VAR_NAME} con el valor de os.getenv('VAR_NAME')
            def replace_match(match):
                var_name = match.group(1)
                env_value = os.getenv(var_name)
                
                if env_value is None:
                    print(f"[SyncFacade] ⚠️  Variable de entorno no definida: {var_name} - usando valor original: {match.group(0)}")
                    return match.group(0)  # Mantener el ${VAR} si no existe
                
                print(f"[SyncFacade] ✓ Variable de entorno resuelta: {var_name}")
                return env_value
            
            return re.sub(r'\$\{([^}]+)\}', replace_match, obj)
        
        elif isinstance(obj, list):
            # Procesar listas recursivamente
            return [self._replace_env_variables(item) for item in obj]
        
        elif isinstance(obj, dict):
            # Procesar diccionarios recursivamente
            return {key: self._replace_env_variables(value) for key, value in obj.items()}
        
        # Retornar valores primitivos sin cambios (números, booleanos, None)
        return obj
    
    def _load_configuration(self):
        """
        Carga configuración desde config.yaml y crea adapters por base de datos.
        """
        try:
            print(f"📄 [SyncFacade] Cargando configuración desde: {self.config_path}")
            
            if not self.config_path.exists():
                print(f"⚠️  [SyncFacade] config.yaml no encontrado en: {self.config_path}")
                return
            
            with open(self.config_path, 'r', encoding='utf-8') as f:
                config = yaml.safe_load(f)
            
            # Procesar variables de entorno en el config
            config = self._replace_env_variables(config)
            
            # Verificar si sync está habilitado globalmente
            sync_config = config.get('sync', {})
            self.sync_enabled = sync_config.get('enabled', False)
            
            if not self.sync_enabled:
                print(f"ℹ️  [SyncFacade] Sincronización deshabilitada en config.yaml")
                return
            
            print(f"✅ [SyncFacade] Sincronización habilitada")
            
            # Obtener configuración global del cliente
            client_config = sync_config.get('client', {})
            
            # Crear adapters por base de datos
            databases_config = sync_config.get('databases', {})
            
            for db_key, db_sync_config in databases_config.items():
                if not db_sync_config.get('enabled', False):
                    print(f"⏭️  [SyncFacade] Sync deshabilitado para {db_key}")
                    continue
                
                print(f"🔧 [SyncFacade] Configurando adapter para {db_key}")
                
                # Crear configuración del adapter
                adapter_config = SyncConfig(
                    parse_url=client_config.get('parse_url', ''),
                    app_id=client_config.get('app_id', ''),
                    rest_api_key=client_config.get('rest_api_key'),
                    master_key=client_config.get('master_key'),
                    timeout=client_config.get('timeout', 5),
                    connect_timeout=client_config.get('connect_timeout', 3),
                    retries=client_config.get('retries', 3),
                    retry_delay=client_config.get('retry_delay', 1)
                )
                
                # Validar configuración
                if not adapter_config.parse_url or not adapter_config.app_id:
                    print(f"⚠️  [SyncFacade] Configuración incompleta para {db_key}, saltando")
                    continue
                
                # Crear adapter
                adapter = SyncAdapter(adapter_config)
                self.adapters[db_key] = adapter
                
                print(f"✅ [SyncFacade] Adapter creado para {db_key}")
                print(f"   - Parse URL: {adapter_config.parse_url}")
                print(f"   - App ID: {adapter_config.app_id}")
                
                # Guardar configuración en app_config
                self._save_to_app_config(db_key)
            
            print(f"✅ [SyncFacade] Configuración completada. Adapters activos: {len(self.adapters)}")
        
        except Exception as e:
            print(f"❌ [SyncFacade] Error cargando configuración: {e}")
            import traceback
            traceback.print_exc()
    
    def _save_to_app_config(self, database_key: str):
        """
        Guarda la configuración de Parse Server en la tabla app_config.
        
        Args:
            database_key: Clave de la base de datos
        """
        try:
            adapter = self.adapters.get(database_key)
            if not adapter:
                return
            
            print(f"💾 [SyncFacade] Guardando configuración en app_config para {database_key}")
            
            # Obtener sesión de base de datos
            from core.container import Container
            container = Container()
            db = container.get(database_key, "databases")
            
            if not db:
                print(f"⚠️  [SyncFacade] No se pudo obtener sesión DB para {database_key}")
                return
            
            # Importar modelo AppConfig
            from core.models.core.app_config import AppConfigModel
            
            # Guardar Parse URL (host)
            key_host = f"parser-{database_key}-host"
            existing_host = db.query(AppConfigModel).filter(
                AppConfigModel.key == key_host
            ).first()
            
            if existing_host:
                existing_host.value = adapter.config.parse_url
                print(f"   🔄 Actualizando {key_host}")
            else:
                db.add(AppConfigModel(key=key_host, value=adapter.config.parse_url))
                print(f"   ➕ Insertando {key_host}")
            
            # Guardar App ID
            key_app_id = f"parser-{database_key}-app-id"
            existing_app_id = db.query(AppConfigModel).filter(
                AppConfigModel.key == key_app_id
            ).first()
            
            if existing_app_id:
                existing_app_id.value = adapter.config.app_id
                print(f"   🔄 Actualizando {key_app_id}")
            else:
                db.add(AppConfigModel(key=key_app_id, value=adapter.config.app_id))
                print(f"   ➕ Insertando {key_app_id}")
            
            # Commit cambios
            db.commit()
            print(f"   ✅ Configuración guardada en app_config")
            
        except Exception as e:
            print(f"   ⚠️  Error guardando en app_config: {e}")
            if 'db' in locals():
                db.rollback()
    
    def _get_adapter(self, database_key: str) -> Optional[SyncAdapter]:
        """
        Obtiene el adapter para una base de datos específica.
        
        Args:
            database_key: Clave de la base de datos
            
        Returns:
            SyncAdapter o None si no existe
        """
        adapter = self.adapters.get(database_key)
        if not adapter:
            print(f"⚠️  [SyncFacade] No hay adapter configurado para {database_key}")
        return adapter
    
    # ========================================================================
    # INTERFAZ PÚBLICA - Métodos de alto nivel
    # ========================================================================
    
    def is_enabled(self, database_key: Optional[str] = None) -> bool:
        """
        Verifica si sync está habilitado globalmente o para una BD específica.
        
        Args:
            database_key: Clave de la base de datos (opcional)
            
        Returns:
            True si está habilitado, False en caso contrario
        """
        if not self.sync_enabled:
            return False
        
        if database_key:
            return database_key in self.adapters
        
        return len(self.adapters) > 0
    
    def login(self, username: str, password: str, 
              database_key: str = 'core_db') -> Optional[Dict[str, Any]]:
        """
        Autentica un usuario.
        
        Args:
            username: Nombre de usuario
            password: Contraseña
            database_key: Base de datos a usar (default: 'core_db')
            
        Returns:
            Dict con datos del usuario y sessionToken
        """
        adapter = self._get_adapter(database_key)
        if not adapter:
            return None
        
        return adapter.login(username, password)
    
    def register(self, username: str, password: str, email: str,
                 additional_data: Optional[Dict[str, Any]] = None,
                 database_key: str = 'core_db') -> Optional[Dict[str, Any]]:
        """
        Registra un nuevo usuario.
        
        Args:
            username: Nombre de usuario
            password: Contraseña
            email: Email
            additional_data: Datos adicionales
            database_key: Base de datos a usar (default: 'core_db')
            
        Returns:
            Dict con datos del usuario creado
        """
        adapter = self._get_adapter(database_key)
        if not adapter:
            return None
        
        return adapter.register(username, password, email, additional_data)
    
    def push(self, database_key: str, class_name: str, data: Dict[str, Any],
             session_token: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Envía un objeto a Parse Server.
        
        Args:
            database_key: Base de datos/adapter a usar
            class_name: Nombre de la clase/entidad
            data: Datos del objeto
            session_token: Token de sesión (opcional)
            
        Returns:
            Dict con el objeto sincronizado
        """
        adapter = self._get_adapter(database_key)
        if not adapter:
            return None
        
        return adapter.push(class_name, data, session_token)
    
    def pull(self, database_key: str, class_name: str,
             filters: Optional[Dict[str, Any]] = None,
             limit: int = 100, skip: int = 0,
             session_token: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Obtiene objetos desde Parse Server.
        
        Args:
            database_key: Base de datos/adapter a usar
            class_name: Nombre de la clase/entidad
            filters: Filtros de búsqueda
            limit: Límite de resultados
            skip: Saltar N resultados (paginación)
            session_token: Token de sesión (opcional)
            
        Returns:
            Lista de objetos
        """
        adapter = self._get_adapter(database_key)
        if not adapter:
            return []
        
        return adapter.pull(class_name, filters, limit, skip, session_token)
    
    def update(self, database_key: str, class_name: str, object_id: str,
               data: Dict[str, Any], session_token: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Actualiza un objeto en Parse Server.
        
        Args:
            database_key: Base de datos/adapter a usar
            class_name: Nombre de la clase/entidad
            object_id: ID del objeto
            data: Datos a actualizar
            session_token: Token de sesión (opcional)
            
        Returns:
            Dict con resultado de la actualización
        """
        adapter = self._get_adapter(database_key)
        if not adapter:
            return None
        
        return adapter.update(class_name, object_id, data, session_token)
    
    def delete(self, database_key: str, class_name: str, object_id: str,
               session_token: Optional[str] = None) -> bool:
        """
        Elimina un objeto de Parse Server.
        
        Args:
            database_key: Base de datos/adapter a usar
            class_name: Nombre de la clase/entidad
            object_id: ID del objeto
            session_token: Token de sesión (opcional)
            
        Returns:
            True si se eliminó correctamente
        """
        adapter = self._get_adapter(database_key)
        if not adapter:
            return False
        
        return adapter.delete(class_name, object_id, session_token)
    
    def fetch_objects(self, database_key: str, class_name: str,
                     object_ids: List[str], session_token: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Obtiene múltiples objetos por sus IDs.
        
        Args:
            database_key: Base de datos/adapter a usar
            class_name: Nombre de la clase/entidad
            object_ids: Lista de IDs
            session_token: Token de sesión (opcional)
            
        Returns:
            Lista de objetos
        """
        adapter = self._get_adapter(database_key)
        if not adapter:
            return []
        
        return adapter.fetch_objects(class_name, object_ids, session_token)
    
    def batch(self, database_key: str, operations: List[Dict[str, Any]],
              session_token: Optional[str] = None) -> Optional[List[Dict[str, Any]]]:
        """
        Ejecuta múltiples operaciones en batch.
        
        Args:
            database_key: Base de datos/adapter a usar
            operations: Lista de operaciones
            session_token: Token de sesión (opcional)
            
        Returns:
            Lista con resultados
        """
        adapter = self._get_adapter(database_key)
        if not adapter:
            return None
        
        return adapter.batch(operations, session_token)
    
    def cloud_function(self, database_key: str, function_name: str,
                      params: Optional[Dict[str, Any]] = None,
                      session_token: Optional[str] = None) -> Optional[Any]:
        """
        Ejecuta una Cloud Function.
        
        Args:
            database_key: Base de datos/adapter a usar
            function_name: Nombre de la función
            params: Parámetros
            session_token: Token de sesión (opcional)
            
        Returns:
            Resultado de la función
        """
        adapter = self._get_adapter(database_key)
        if not adapter:
            return None
        
        return adapter.cloud_function(function_name, params, session_token)
    
    def health_check(self, database_key: Optional[str] = None) -> Dict[str, bool]:
        """
        Verifica estado de conexión con Parse Server.
        
        Args:
            database_key: Base de datos específica (opcional, si no se especifica verifica todas)
            
        Returns:
            Dict con estado de cada adapter
        """
        if database_key:
            adapter = self._get_adapter(database_key)
            if not adapter:
                return {database_key: False}
            return {database_key: adapter.health_check()}
        
        # Verificar todos los adapters
        status = {}
        for db_key, adapter in self.adapters.items():
            status[db_key] = adapter.health_check()
        
        return status
    
    def get_databases(self) -> List[str]:
        """
        Obtiene lista de bases de datos con sync habilitado.
        
        Returns:
            Lista de claves de bases de datos
        """
        return list(self.adapters.keys())
    
    def get_parse_config_from_db(self, database_key: str) -> Optional[Dict[str, str]]:
        """
        Obtiene la configuración de Parse Server desde app_config.
        
        Args:
            database_key: Clave de la base de datos
            
        Returns:
            Dict con 'host' y 'app_id', o None si no existe
        """
        try:
            from core.container import Container
            from core.models.core.app_config import AppConfigModel
            
            container = Container()
            db = container.get(database_key, "databases")
            
            if not db:
                return None
            
            # Consultar host
            key_host = f"parser-{database_key}-host"
            host_record = db.query(AppConfigModel).filter(
                AppConfigModel.key == key_host
            ).first()
            
            # Consultar app_id
            key_app_id = f"parser-{database_key}-app-id"
            app_id_record = db.query(AppConfigModel).filter(
                AppConfigModel.key == key_app_id
            ).first()
            
            if not host_record or not app_id_record:
                return None
            
            return {
                'host': host_record.value,
                'app_id': app_id_record.value
            }
            
        except Exception as e:
            print(f"❌ [SyncFacade] Error consultando app_config: {e}")
            return None
