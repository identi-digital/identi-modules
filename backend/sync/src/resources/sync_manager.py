"""
SyncManager: Gestor principal de sincronización offline.
Coordina los clientes Parse por base de datos y proporciona la interfaz
que el loader y otros módulos core usarán.
"""
from typing import Dict, Any, Optional, List
import re
import os
from .parse_client_factory import ParseClientFactory
from .parse_client import ParseClient


class SyncManager:
    """
    Gestor principal de sincronización offline.
    
    Proporciona una interfaz unificada para sincronizar datos con Parse Server,
    gestionando automáticamente los clientes Parse por base de datos.
    """
    
    def __init__(self, container):
        """
        Inicializa el SyncManager.
        
        Args:
            container: Container con acceso a las bases de datos y configuración
        """
        self.container = container
        self._initialize_clients()
    
    def _replace_env_variables(self, obj):
        """Reemplaza variables de entorno en el formato ${VAR_NAME}"""
        if isinstance(obj, str):
            def replace_match(match):
                var_name = match.group(1)
                env_value = os.getenv(var_name)
                if env_value is None:
                    return match.group(0)
                return env_value
            return re.sub(r'\$\{([^}]+)\}', replace_match, obj)
        elif isinstance(obj, list):
            return [self._replace_env_variables(item) for item in obj]
        elif isinstance(obj, dict):
            return {key: self._replace_env_variables(value) for key, value in obj.items()}
        return obj
    
    def _initialize_clients(self):
        """
        Inicializa los clientes Parse para todas las bases de datos configuradas.
        """
        print(f"🚀 [SyncManager] Iniciando _initialize_clients()...")
        try:
            # Obtener configuración desde config.yaml
            import yaml
            from pathlib import Path
            
            # Buscar config.yaml en la raíz del proyecto
            current_file = Path(__file__).resolve()
            backend_path = current_file.parents[4]  # backend/
            config_path = backend_path / "config.yaml"
            
            print(f"📂 [SyncManager] Buscando config.yaml en: {config_path}")
            
            if not config_path.exists():
                print(f"❌ [SyncManager] config.yaml no encontrado en: {config_path}")
                return
            
            config = yaml.safe_load(open(config_path, "r", encoding="utf-8"))
            
            # Procesar variables de entorno en el config
            config = self._replace_env_variables(config)
            
            # Obtener configuración de bases de datos
            databases = config.get("databases", {})
            print(f"📊 [SyncManager] Bases de datos encontradas: {list(databases.keys())}")
            
            # Obtener configuración de authx si existe
            authx_url = None
            authx_config = config.get("authx", {})
            if authx_config:
                authx_url = authx_config.get("baseUrl")
                print(f"🔐 [SyncManager] authx_url configurada: {authx_url}")
            
            # Inicializar clientes Parse para cada BD con sync habilitado
            for db_key, db_config in databases.items():
                sync_enabled = db_config.get("sync", False)
                if not sync_enabled:
                    print(f"⏭️ [SyncManager] Sync deshabilitado para {db_key}, saltando...")
                    continue
                
                print(f"🔧 [SyncManager] Procesando DB: {db_key}")
                
                # Obtener configuración de Parse para esta BD
                parse_config = db_config.get("parse", {})
                app_id = db_config.get("app_id")
                
                # Si no hay configuración parse en config.yaml, intentar obtener desde authx
                if not parse_config or not parse_config.get("server_url"):
                    if app_id and app_id != "TU_APP_ID_AQUI":  # Ignorar placeholder
                        print(f"📡 [SyncManager] Obteniendo credenciales Parse desde authx para {db_key} (app_id: {app_id})")
                        authx_config = self._get_parse_credentials_from_authx(authx_url, app_id)
                        if authx_config:
                            # Merge con parse_config existente (authx tiene prioridad)
                            parse_config = {**parse_config, **authx_config}
                            print(f"✅ [SyncManager] Credenciales obtenidas desde authx para {db_key}")
                        else:
                            print(f"⚠️ [SyncManager] No se pudieron obtener credenciales Parse desde authx para {db_key}")
                            # Si parse_config está vacío y authx falló, usar app_id al menos
                            if not parse_config.get("app_id") and app_id:
                                parse_config["app_id"] = app_id
                                print(f"     ℹ️ [SyncManager] Usando app_id del config.yaml: {app_id}")
                
                # Verificar que al menos tengamos app_id o server_url
                if not parse_config.get("app_id") and not parse_config.get("server_url"):
                    if not app_id or app_id == "TU_APP_ID_AQUI":
                        print(f"⚠️ [SyncManager] No hay configuración Parse ni app_id válido para {db_key}, saltando...")
                        continue
                    # Usar app_id del config como fallback
                    parse_config["app_id"] = app_id
                    print(f"     ℹ️ [SyncManager] Usando app_id del config.yaml como fallback: {app_id}")
                
                # Si hay parse_config pero no tiene app_id, intentar usar el app_id del config
                if not parse_config.get("app_id") and app_id and app_id != "TU_APP_ID_AQUI":
                    parse_config["app_id"] = app_id
                    print(f"     ℹ️ [SyncManager] Completando parse_config con app_id del config.yaml: {app_id}")
                
                # Registrar y crear cliente Parse
                print(f"     🔧 [SyncManager] Registrando configuración Parse para {db_key}...")
                ParseClientFactory.register_database(db_key, parse_config)
                print(f"     🔧 [SyncManager] Creando cliente Parse para {db_key}...")
                client = ParseClientFactory.get_client(db_key)
                
                # Guardar configuración de Parse en app_config después de crear el cliente
                # Extraer datos del cliente Parse creado (host y app_id)
                if client:
                    print(f"     ✅ [SyncManager] Cliente Parse creado exitosamente para {db_key}")
                    # Obtener datos del cliente Parse
                    client_host = client.server_url
                    client_app_id = client.app_id
                    print(f"     📋 [SyncManager] Datos del cliente Parse:")
                    print(f"        host: {client_host}")
                    print(f"        app_id: {client_app_id}")
                    
                    # Guardar datos del cliente en app_config
                    print(f"     💾 [SyncManager] Guardando datos del cliente Parse en app_config...")
                    try:
                        # Crear parse_config con los datos del cliente
                        client_parse_config = {
                            "server_url": client_host,
                            "app_id": client_app_id
                        }
                        self._save_parse_config_to_app_config(db_key, client_parse_config)
                        print(f"     ✅ [SyncManager] Configuración del cliente Parse guardada exitosamente para {db_key}")
                    except Exception as save_error:
                        print(f"     ❌ [SyncManager] Error al guardar configuración del cliente para {db_key}: {save_error}")
                        import traceback
                        traceback.print_exc()
                else:
                    print(f"     ⚠️ [SyncManager] No se pudo crear cliente Parse para {db_key}")
                    # Intentar guardar al menos la configuración del parse_config si está disponible
                    if parse_config.get("server_url") or parse_config.get("app_id"):
                        print(f"     💾 [SyncManager] Guardando configuración parcial en app_config...")
                        try:
                            self._save_parse_config_to_app_config(db_key, parse_config)
                            print(f"     ✅ [SyncManager] Configuración parcial guardada para {db_key}")
                        except Exception as save_error:
                            print(f"     ❌ [SyncManager] Error al guardar configuración parcial: {save_error}")
            
            print(f"✅ [SyncManager] _initialize_clients() completado")
        
        except Exception as e:
            print(f"❌ [SyncManager] Error inicializando clientes Parse: {e}")
            import traceback
            traceback.print_exc()
    
    def _get_parse_credentials_from_authx(self, authx_url: str, app_id: str) -> Optional[Dict[str, Any]]:
        """
        Obtiene credenciales Parse desde AuthX.
        
        Args:
            authx_url: URL base de AuthX
            app_id: Application ID de Parse
            
        Returns:
            Dict con credenciales o None si hay error
        """
        if not authx_url:
            print(f"⚠️ [SyncManager] authx_url no configurada")
            return None
        
        try:
            import requests
            url = f"{authx_url}/authx/parse/credentials/{app_id}"
            print(f"📡 [SyncManager] Llamando a AuthX: {url}")
            
            response = requests.get(url, timeout=10)
            if response.status_code != 200:
                print(f"⚠️ [SyncManager] AuthX respondió {response.status_code}: {response.text}")
                return None
            
            data = response.json()
            if not data or "server_url" not in data:
                print(f"⚠️ [SyncManager] Credenciales inválidas desde AuthX: {data}")
                return None
            
            return data
        
        except Exception as e:
            print(f"❌ [SyncManager] Error consultando AuthX: {e}")
            return None
    
    def _save_parse_config_to_app_config(self, database_key: str, parse_config: Dict[str, Any]):
        """
        Guarda la configuración de Parse en la tabla app_config.
        
        Args:
            database_key: Clave de la base de datos
            parse_config: Configuración Parse (server_url, app_id)
        """
        try:
            # Obtener sesión de BD
            db = self.container.get(database_key, "databases")
            if not db:
                print(f"❌ [SyncManager] No se pudo obtener sesión DB para {database_key}")
                return
            
            # Importar modelo AppConfig
            try:
                from core.models.core.app_config import AppConfigModel
            except ImportError:
                from core.models.core.app_config import AppConfigModel
            
            # Guardar parser-host (server_url)
            if parse_config.get("server_url"):
                config_key_host = f"parser-{database_key}-host"
                config_value_host = parse_config.get("server_url")
                
                try:
                    existing = db.query(AppConfigModel).filter(AppConfigModel.key == config_key_host).first()
                    if existing:
                        existing.value = config_value_host
                        print(f"🔄 [SyncManager] Actualizando {config_key_host}")
                    else:
                        db.add(AppConfigModel(key=config_key_host, value=config_value_host))
                        print(f"➕ [SyncManager] Insertando {config_key_host}")
                    
                    db.flush()
                    db.commit()
                except Exception as e:
                    db.rollback()
                    print(f"❌ [SyncManager] Error guardando {config_key_host}: {e}")
            
            # Guardar parser-app-id
            if parse_config.get("app_id"):
                config_key_app_id = f"parser-{database_key}-app-id"
                config_value_app_id = parse_config.get("app_id")
                
                try:
                    existing = db.query(AppConfigModel).filter(AppConfigModel.key == config_key_app_id).first()
                    if existing:
                        existing.value = config_value_app_id
                        print(f"🔄 [SyncManager] Actualizando {config_key_app_id}")
                    else:
                        db.add(AppConfigModel(key=config_key_app_id, value=config_value_app_id))
                        print(f"➕ [SyncManager] Insertando {config_key_app_id}")
                    
                    db.flush()
                    db.commit()
                except Exception as e:
                    db.rollback()
                    print(f"❌ [SyncManager] Error guardando {config_key_app_id}: {e}")
        
        except Exception as e:
            print(f"❌ [SyncManager] Error guardando configuración Parse: {e}")
    
    def sync_object(self, database_key: str, class_name: str, object_data: Dict[str, Any], token: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Sincroniza un objeto con Parse Server.
        """
        client = ParseClientFactory.get_client(database_key)
        if not client:
            print(f"⚠️ [SyncManager] Cliente Parse no encontrado para {database_key}")
            return None
        return client.sync_object(class_name, object_data, token=token)
    
    def query_objects(self, database_key: str, class_name: str, filters: Optional[Dict[str, Any]] = None, token: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Consulta objetos desde Parse Server.
        """
        client = ParseClientFactory.get_client(database_key)
        if not client:
            print(f"⚠️ [SyncManager] Cliente Parse no encontrado para {database_key}")
            return []
        return client.query_objects(class_name, filters, token=token)
    
    def delete_object(self, database_key: str, class_name: str, object_id: str, token: Optional[str] = None) -> bool:
        """
        Elimina un objeto en Parse Server.
        """
        client = ParseClientFactory.get_client(database_key)
        if not client:
            print(f"⚠️ [SyncManager] Cliente Parse no encontrado para {database_key}")
            return False
        return client.delete_object(class_name, object_id, token=token)
    
    def get_client(self, database_key: str) -> Optional[ParseClient]:
        """
        Obtiene el cliente Parse para una base de datos específica.
        """
        return ParseClientFactory.get_client(database_key)
    
    def get_all_clients_status(self) -> Dict[str, Dict[str, Any]]:
        """
        Obtiene el estado de todos los clientes Parse.
        """
        clients = ParseClientFactory.get_all_clients()
        return {db_key: client.get_status() for db_key, client in clients.items()}
