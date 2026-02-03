"""
Cliente Parse Server para sincronización offline.
Wrapper alrededor del SDK de Parse Server usando REST API exclusivamente.

NOTA: Este cliente usa REST API únicamente, NO WebSockets.
La librería parse_rest solo soporta REST API, garantizando que no se usen WebSockets.

AUTENTICACIÓN:
- Si se proporciona un token de autenticación, se usa en lugar del REST API key.
- El token se pasa en el header Authorization: Bearer <token>.
- Si no hay token, se usa parse_rest con REST API key como fallback.
"""
from typing import Dict, Any, Optional, List
import os


class ParseClient:
    """
    Cliente Parse Server para una base de datos específica.
    
    Cada instancia está configurada para una base de datos particular
    y maneja todas las operaciones de sincronización offline.
    """
    
    def __init__(self, database_key: str, parse_config: Dict[str, Any]):
        """
        Inicializa el cliente Parse para una base de datos.
        
        Args:
            database_key: Clave de la base de datos (ej: 'core_db')
            parse_config: Configuración de Parse Server:
                - server_url: URL del servidor Parse
                - app_id: Application ID de Parse
                - master_key: Master Key de Parse (opcional, para operaciones admin)
                - rest_api_key: REST API Key (opcional)
        """
        self.database_key = database_key
        self.server_url = parse_config.get("server_url")
        self.app_id = parse_config.get("app_id")
        self.master_key = parse_config.get("master_key")
        self.rest_api_key = parse_config.get("rest_api_key")
        
        # Inicializar SDK de Parse
        self._initialize_parse()
    
    def _initialize_parse(self):
        """
        Inicializa el SDK de Parse Server usando REST API (no WebSockets).
        """
        try:
            import parse_rest
            from parse_rest.connection import register
            
            # Asegurar que la URL del servidor termine en /parse para REST API
            server_url = self.server_url
            if server_url:
                # Normalizar la URL para REST API
                server_url = server_url.rstrip('/')
                if not server_url.endswith('/parse'):
                    # Si no termina en /parse, agregarlo
                    server_url = f"{server_url}/parse"
                
                # Configurar variable de entorno para REST API
                os.environ['PARSE_SERVER_URL'] = server_url
                print(f"📡 [ParseClient:{self.database_key}] Usando REST API en: {server_url}")
            
            # Registrar la aplicación Parse usando REST API
            # parse_rest solo usa REST API, no WebSockets
            register(
                application_id=self.app_id,
                rest_api_key=self.rest_api_key or self.master_key,
                master_key=self.master_key
            )
            
            self.parse_rest = parse_rest
            print(f"✅ [ParseClient:{self.database_key}] Cliente Parse REST API inicializado")
        except ImportError:
            print(f"⚠️ [ParseClient:{self.database_key}] parse_rest no instalado, usando modo mock")
            self.parse_rest = None
        except Exception as e:
            print(f"❌ [ParseClient:{self.database_key}] Error inicializando Parse: {e}")
            self.parse_rest = None
    
    def sync_object(self, class_name: str, object_data: Dict[str, Any], token: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Sincroniza un objeto con Parse Server.
        
        Args:
            class_name: Nombre de la clase Parse (equivalente a tabla)
            object_data: Datos del objeto a sincronizar
            token: Token de autenticación (opcional, si se proporciona se usa en lugar de REST API key)
            
        Returns:
            Objeto sincronizado o None si hay error
        """
        # Si hay token, usar requests directamente con autenticación por token
        if token:
            return self._sync_object_with_token(class_name, object_data, token)
        
        # Fallback a parse_rest con REST API key
        if not self.parse_rest:
            print(f"⚠️ [ParseClient:{self.database_key}] Parse no disponible, modo mock")
            return object_data
        
        try:
            # Crear o actualizar objeto en Parse usando REST API key
            ParseObject = self.parse_rest.Object.factory(class_name)
            obj = ParseObject(**object_data)
            obj.save()
            
            return obj.dump()
        except Exception as e:
            print(f"❌ [ParseClient:{self.database_key}] Error sincronizando objeto: {e}")
            return None
    
    def _sync_object_with_token(self, class_name: str, object_data: Dict[str, Any], token: str) -> Optional[Dict[str, Any]]:
        """
        Sincroniza un objeto usando token de autenticación.
        
        Args:
            class_name: Nombre de la clase Parse
            object_data: Datos del objeto
            token: Token de autenticación
            
        Returns:
            Objeto sincronizado o None si hay error
        """
        try:
            import requests
            
            # Construir URL del endpoint
            server_url = self.server_url.rstrip('/')
            if not server_url.endswith('/parse'):
                server_url = f"{server_url}/parse"
            
            url = f"{server_url}/classes/{class_name}"
            
            # Headers con token de autenticación
            headers = {
                "X-Parse-Application-Id": self.app_id,
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Realizar petición POST para crear/actualizar objeto
            response = requests.post(url, json=object_data, headers=headers, timeout=10)
            
            if response.status_code not in [200, 201]:
                print(f"❌ [ParseClient:{self.database_key}] Error sincronizando objeto: HTTP {response.status_code} - {response.text}")
                return None
            
            result = response.json()
            print(f"✅ [ParseClient:{self.database_key}] Objeto sincronizado con token")
            return result
            
        except Exception as e:
            print(f"❌ [ParseClient:{self.database_key}] Error sincronizando objeto con token: {e}")
            return None
    
    def query_objects(self, class_name: str, filters: Optional[Dict[str, Any]] = None, token: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Consulta objetos desde Parse Server.
        
        Args:
            class_name: Nombre de la clase Parse
            filters: Filtros de búsqueda (opcional)
            token: Token de autenticación (opcional, si se proporciona se usa en lugar de REST API key)
            
        Returns:
            Lista de objetos encontrados
        """
        # Si hay token, usar requests directamente con autenticación por token
        if token:
            return self._query_objects_with_token(class_name, filters, token)
        
        # Fallback a parse_rest con REST API key
        if not self.parse_rest:
            return []
        
        try:
            ParseQuery = self.parse_rest.Query
            query = ParseQuery(class_name)
            
            # Aplicar filtros si existen
            if filters:
                for key, value in filters.items():
                    query = query.equal_to(key, value)
            
            results = query.get()
            return [obj.dump() for obj in results]
        except Exception as e:
            print(f"❌ [ParseClient:{self.database_key}] Error consultando objetos: {e}")
            return []
    
    def _query_objects_with_token(self, class_name: str, filters: Optional[Dict[str, Any]], token: str) -> List[Dict[str, Any]]:
        """
        Consulta objetos usando token de autenticación.
        
        Args:
            class_name: Nombre de la clase Parse
            filters: Filtros de búsqueda
            token: Token de autenticación
            
        Returns:
            Lista de objetos encontrados
        """
        try:
            import requests
            
            # Construir URL del endpoint
            server_url = self.server_url.rstrip('/')
            if not server_url.endswith('/parse'):
                server_url = f"{server_url}/parse"
            
            url = f"{server_url}/classes/{class_name}"
            
            # Headers con token de autenticación
            headers = {
                "X-Parse-Application-Id": self.app_id,
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Construir parámetros de consulta desde filters
            params = {}
            if filters:
                for key, value in filters.items():
                    params[key] = value
            
            # Realizar petición GET
            response = requests.get(url, params=params, headers=headers, timeout=10)
            
            if response.status_code != 200:
                print(f"❌ [ParseClient:{self.database_key}] Error consultando objetos: HTTP {response.status_code} - {response.text}")
                return []
            
            result = response.json()
            # Parse Server retorna los resultados en el campo "results"
            objects = result.get("results", [])
            print(f"✅ [ParseClient:{self.database_key}] {len(objects)} objetos consultados con token")
            return objects
            
        except Exception as e:
            print(f"❌ [ParseClient:{self.database_key}] Error consultando objetos con token: {e}")
            return []
    
    def delete_object(self, class_name: str, object_id: str, token: Optional[str] = None) -> bool:
        """
        Elimina un objeto de Parse Server.
        
        Args:
            class_name: Nombre de la clase Parse
            object_id: ID del objeto a eliminar
            token: Token de autenticación (opcional, si se proporciona se usa en lugar de REST API key)
            
        Returns:
            True si se eliminó correctamente, False en caso contrario
        """
        # Si hay token, usar requests directamente con autenticación por token
        if token:
            return self._delete_object_with_token(class_name, object_id, token)
        
        # Fallback a parse_rest con REST API key
        if not self.parse_rest:
            return False
        
        try:
            ParseObject = self.parse_rest.Object.factory(class_name)
            obj = ParseObject.get(object_id)
            obj.delete()
            return True
        except Exception as e:
            print(f"❌ [ParseClient:{self.database_key}] Error eliminando objeto: {e}")
            return False
    
    def _delete_object_with_token(self, class_name: str, object_id: str, token: str) -> bool:
        """
        Elimina un objeto usando token de autenticación.
        
        Args:
            class_name: Nombre de la clase Parse
            object_id: ID del objeto a eliminar
            token: Token de autenticación
            
        Returns:
            True si se eliminó correctamente, False en caso contrario
        """
        try:
            import requests
            
            # Construir URL del endpoint
            server_url = self.server_url.rstrip('/')
            if not server_url.endswith('/parse'):
                server_url = f"{server_url}/parse"
            
            url = f"{server_url}/classes/{class_name}/{object_id}"
            
            # Headers con token de autenticación
            headers = {
                "X-Parse-Application-Id": self.app_id,
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Realizar petición DELETE
            response = requests.delete(url, headers=headers, timeout=10)
            
            if response.status_code not in [200, 204]:
                print(f"❌ [ParseClient:{self.database_key}] Error eliminando objeto: HTTP {response.status_code} - {response.text}")
                return False
            
            print(f"✅ [ParseClient:{self.database_key}] Objeto eliminado con token")
            return True
            
        except Exception as e:
            print(f"❌ [ParseClient:{self.database_key}] Error eliminando objeto con token: {e}")
            return False
    
    def get_status(self) -> Dict[str, Any]:
        """
        Obtiene el estado de la conexión con Parse Server.
        
        Returns:
            Diccionario con información del estado
        """
        return {
            "database_key": self.database_key,
            "server_url": self.server_url,
            "app_id": self.app_id,
            "initialized": self.parse_rest is not None,
            "connected": self._check_connection()
        }
    
    def _check_connection(self) -> bool:
        """
        Verifica la conexión con Parse Server.
        
        Returns:
            True si está conectado, False en caso contrario
        """
        if not self.parse_rest:
            return False
        
        try:
            # Intentar una consulta simple para verificar conexión
            ParseQuery = self.parse_rest.Query
            query = ParseQuery("_Installation")  # Clase por defecto de Parse
            query.limit(1)
            query.get()
            return True
        except Exception:
            return False
