"""
Sync Adapter - Capa anti-corrupción entre el backend y Parse Server

Este adapter es la ÚNICA interfaz que el resto del backend debe usar para
comunicarse con Parse Server. Traduce conceptos del dominio interno a 
llamadas Parse REST API.

PRINCIPIOS:
- NO reimplementa lógica de Parse
- NO duplica funcionalidad de sync
- NO contiene lógica de negocio del dominio
- Actúa exclusivamente como adapter/facade
- Oculta detalles de implementación de Parse al resto del sistema
"""
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


@dataclass
class SyncConfig:
    """Configuración del cliente sync"""
    parse_url: str
    app_id: str
    rest_api_key: Optional[str] = None
    master_key: Optional[str] = None
    timeout: int = 5
    connect_timeout: int = 3
    retries: int = 3
    retry_delay: int = 1


class SyncAdapter:
    """
    Adapter para comunicación con Parse Server.
    
    Expone métodos de alto nivel que abstraen Parse Server del resto del sistema.
    El resto del backend NO debe usar directamente la API REST de Parse.
    """
    
    def __init__(self, config: SyncConfig):
        """
        Inicializa el adapter con configuración.
        
        Args:
            config: Configuración del cliente sync
        """
        self.config = config
        self.session = self._create_session()
        self.base_url = config.parse_url.rstrip('/')
    
    def _create_session(self) -> requests.Session:
        """
        Crea sesión HTTP con retry logic y pool de conexiones.
        
        Returns:
            Sesión requests configurada
        """
        session = requests.Session()
        
        # Configurar retry strategy
        retry_strategy = Retry(
            total=self.config.retries,
            backoff_factor=self.config.retry_delay,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["HEAD", "GET", "POST", "PUT", "DELETE", "OPTIONS", "TRACE"]
        )
        
        adapter = HTTPAdapter(
            max_retries=retry_strategy,
            pool_connections=10,
            pool_maxsize=20
        )
        
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        
        return session
    
    def _get_headers(self, session_token: Optional[str] = None) -> Dict[str, str]:
        """
        Construye headers para peticiones Parse.
        
        Args:
            session_token: Token de sesión del usuario (opcional)
            
        Returns:
            Dict con headers HTTP
        """
        headers = {
            "X-Parse-Application-Id": self.config.app_id,
            "Content-Type": "application/json"
        }
        
        # Autenticación: prioridad token > rest_api_key > master_key
        if session_token:
            headers["X-Parse-Session-Token"] = session_token
        elif self.config.rest_api_key:
            headers["X-Parse-REST-API-Key"] = self.config.rest_api_key
        elif self.config.master_key:
            headers["X-Parse-Master-Key"] = self.config.master_key
        
        return headers
    
    # ========================================================================
    # MÉTODOS DE ALTO NIVEL - Interfaz pública del adapter
    # ========================================================================
    
    def login(self, username: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Autentica un usuario en Parse Server.
        
        Args:
            username: Nombre de usuario
            password: Contraseña
            
        Returns:
            Dict con datos del usuario y sessionToken, None si falla
        """
        try:
            url = f"{self.base_url}/login"
            params = {"username": username, "password": password}
            headers = self._get_headers()
            
            response = self.session.get(
                url,
                params=params,
                headers=headers,
                timeout=self.config.timeout
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ [SyncAdapter] Login falló: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ [SyncAdapter] Error en login: {e}")
            return None
    
    def register(self, username: str, password: str, email: str, 
                 additional_data: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        """
        Registra un nuevo usuario en Parse Server.
        
        Args:
            username: Nombre de usuario
            password: Contraseña
            email: Email del usuario
            additional_data: Datos adicionales del usuario
            
        Returns:
            Dict con datos del usuario creado, None si falla
        """
        try:
            url = f"{self.base_url}/users"
            headers = self._get_headers()
            
            payload = {
                "username": username,
                "password": password,
                "email": email
            }
            
            if additional_data:
                payload.update(additional_data)
            
            response = self.session.post(
                url,
                json=payload,
                headers=headers,
                timeout=self.config.timeout
            )
            
            if response.status_code in [200, 201]:
                return response.json()
            else:
                print(f"❌ [SyncAdapter] Registro falló: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ [SyncAdapter] Error en registro: {e}")
            return None
    
    def push(self, class_name: str, data: Dict[str, Any], 
             session_token: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Envía (push) un objeto al Parse Server.
        
        Args:
            class_name: Nombre de la clase/entidad
            data: Datos del objeto a sincronizar
            session_token: Token de sesión del usuario (opcional)
            
        Returns:
            Dict con el objeto sincronizado (incluye objectId y createdAt)
        """
        try:
            url = f"{self.base_url}/classes/{class_name}"
            headers = self._get_headers(session_token)
            
            response = self.session.post(
                url,
                json=data,
                headers=headers,
                timeout=self.config.timeout
            )
            
            if response.status_code in [200, 201]:
                return response.json()
            else:
                print(f"❌ [SyncAdapter] Push falló: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ [SyncAdapter] Error en push: {e}")
            return None
    
    def pull(self, class_name: str, filters: Optional[Dict[str, Any]] = None,
             limit: int = 100, skip: int = 0,
             session_token: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Obtiene (pull) objetos desde Parse Server.
        
        Args:
            class_name: Nombre de la clase/entidad
            filters: Filtros de búsqueda (formato Parse query)
            limit: Número máximo de resultados
            skip: Número de resultados a saltar (paginación)
            session_token: Token de sesión del usuario (opcional)
            
        Returns:
            Lista de objetos encontrados
        """
        try:
            url = f"{self.base_url}/classes/{class_name}"
            headers = self._get_headers(session_token)
            
            params = {
                "limit": limit,
                "skip": skip
            }
            
            if filters:
                import json
                params["where"] = json.dumps(filters)
            
            response = self.session.get(
                url,
                params=params,
                headers=headers,
                timeout=self.config.timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("results", [])
            else:
                print(f"❌ [SyncAdapter] Pull falló: {response.status_code} - {response.text}")
                return []
                
        except Exception as e:
            print(f"❌ [SyncAdapter] Error en pull: {e}")
            return []
    
    def update(self, class_name: str, object_id: str, data: Dict[str, Any],
               session_token: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Actualiza un objeto existente en Parse Server.
        
        Args:
            class_name: Nombre de la clase/entidad
            object_id: ID del objeto a actualizar
            data: Datos a actualizar (solo campos que cambian)
            session_token: Token de sesión del usuario (opcional)
            
        Returns:
            Dict con resultado de la actualización (updatedAt)
        """
        try:
            url = f"{self.base_url}/classes/{class_name}/{object_id}"
            headers = self._get_headers(session_token)
            
            response = self.session.put(
                url,
                json=data,
                headers=headers,
                timeout=self.config.timeout
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ [SyncAdapter] Update falló: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ [SyncAdapter] Error en update: {e}")
            return None
    
    def delete(self, class_name: str, object_id: str,
               session_token: Optional[str] = None) -> bool:
        """
        Elimina un objeto de Parse Server.
        
        Args:
            class_name: Nombre de la clase/entidad
            object_id: ID del objeto a eliminar
            session_token: Token de sesión del usuario (opcional)
            
        Returns:
            True si se eliminó correctamente, False en caso contrario
        """
        try:
            url = f"{self.base_url}/classes/{class_name}/{object_id}"
            headers = self._get_headers(session_token)
            
            response = self.session.delete(
                url,
                headers=headers,
                timeout=self.config.timeout
            )
            
            if response.status_code in [200, 204]:
                return True
            else:
                print(f"❌ [SyncAdapter] Delete falló: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ [SyncAdapter] Error en delete: {e}")
            return False
    
    def fetch_objects(self, class_name: str, object_ids: List[str],
                     session_token: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Obtiene múltiples objetos por sus IDs.
        
        Args:
            class_name: Nombre de la clase/entidad
            object_ids: Lista de IDs de objetos a obtener
            session_token: Token de sesión del usuario (opcional)
            
        Returns:
            Lista de objetos encontrados
        """
        if not object_ids:
            return []
        
        # Usar query con filtro $in para obtener múltiples objetos
        filters = {
            "objectId": {"$in": object_ids}
        }
        
        return self.pull(class_name, filters=filters, limit=len(object_ids), session_token=session_token)
    
    def batch(self, operations: List[Dict[str, Any]],
              session_token: Optional[str] = None) -> Optional[List[Dict[str, Any]]]:
        """
        Ejecuta múltiples operaciones en una sola petición (batch).
        
        Args:
            operations: Lista de operaciones a ejecutar
                Formato: {"method": "POST|PUT|DELETE", "path": "/classes/...", "body": {...}}
            session_token: Token de sesión del usuario (opcional)
            
        Returns:
            Lista con resultados de cada operación
        """
        try:
            url = f"{self.base_url}/batch"
            headers = self._get_headers(session_token)
            
            payload = {"requests": operations}
            
            response = self.session.post(
                url,
                json=payload,
                headers=headers,
                timeout=self.config.timeout * 2  # Mayor timeout para batch
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ [SyncAdapter] Batch falló: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ [SyncAdapter] Error en batch: {e}")
            return None
    
    def cloud_function(self, function_name: str, params: Optional[Dict[str, Any]] = None,
                      session_token: Optional[str] = None) -> Optional[Any]:
        """
        Ejecuta una Cloud Function en Parse Server.
        
        Args:
            function_name: Nombre de la función cloud
            params: Parámetros de la función
            session_token: Token de sesión del usuario (opcional)
            
        Returns:
            Resultado de la función cloud
        """
        try:
            url = f"{self.base_url}/functions/{function_name}"
            headers = self._get_headers(session_token)
            
            payload = params or {}
            
            response = self.session.post(
                url,
                json=payload,
                headers=headers,
                timeout=self.config.timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("result")
            else:
                print(f"❌ [SyncAdapter] Cloud function falló: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ [SyncAdapter] Error en cloud function: {e}")
            return None
    
    def health_check(self) -> bool:
        """
        Verifica que Parse Server esté disponible.
        
        Returns:
            True si está disponible, False en caso contrario
        """
        try:
            # Usar endpoint de health del servidor Parse
            url = f"{self.base_url}/health"
            response = self.session.get(url, timeout=self.config.connect_timeout)
            return response.status_code == 200
        except Exception:
            return False
    
    def __enter__(self):
        """Context manager enter"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit - cerrar sesión"""
        self.session.close()
