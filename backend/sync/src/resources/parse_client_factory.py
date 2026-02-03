"""
Factory para crear clientes Parse por base de datos.
Mantiene un registro de clientes Parse activos.
"""
from typing import Dict, Optional
from .parse_client import ParseClient


class ParseClientFactory:
    """
    Factory para crear y gestionar clientes Parse por base de datos.
    
    Mantiene un singleton de clientes Parse, uno por cada base de datos
    configurada en el sistema.
    """
    
    _clients: Dict[str, ParseClient] = {}
    _configs: Dict[str, Dict] = {}
    
    @classmethod
    def register_database(cls, database_key: str, parse_config: Dict):
        """
        Registra la configuración de Parse para una base de datos.
        
        Args:
            database_key: Clave de la base de datos (ej: 'core_db')
            parse_config: Configuración de Parse Server:
                - server_url: URL del servidor Parse
                - app_id: Application ID
                - master_key: Master Key (opcional)
                - rest_api_key: REST API Key (opcional)
        """
        cls._configs[database_key] = parse_config
        print(f"📝 [ParseClientFactory] Configuración registrada para {database_key}")
    
    @classmethod
    def get_client(cls, database_key: str) -> Optional[ParseClient]:
        """
        Obtiene o crea un cliente Parse para una base de datos.
        
        Args:
            database_key: Clave de la base de datos
            
        Returns:
            Cliente Parse o None si no está configurado
        """
        # Si ya existe el cliente, retornarlo
        if database_key in cls._clients:
            return cls._clients[database_key]
        
        # Si no hay configuración, retornar None
        if database_key not in cls._configs:
            print(f"⚠️ [ParseClientFactory] No hay configuración para {database_key}")
            return None
        
        # Crear nuevo cliente
        try:
            config = cls._configs[database_key]
            client = ParseClient(database_key, config)
            cls._clients[database_key] = client
            print(f"✅ [ParseClientFactory] Cliente Parse creado para {database_key}")
            return client
        except Exception as e:
            print(f"❌ [ParseClientFactory] Error creando cliente para {database_key}: {e}")
            return None
    
    @classmethod
    def get_all_clients(cls) -> Dict[str, ParseClient]:
        """
        Obtiene todos los clientes Parse activos.
        
        Returns:
            Diccionario con todos los clientes (database_key -> ParseClient)
        """
        return cls._clients.copy()
    
    @classmethod
    def remove_client(cls, database_key: str):
        """
        Elimina un cliente Parse del registro.
        
        Args:
            database_key: Clave de la base de datos
        """
        if database_key in cls._clients:
            del cls._clients[database_key]
            print(f"🗑️ [ParseClientFactory] Cliente Parse removido para {database_key}")
    
    @classmethod
    def clear_all(cls):
        """
        Limpia todos los clientes Parse.
        """
        cls._clients.clear()
        cls._configs.clear()
        print(f"🧹 [ParseClientFactory] Todos los clientes Parse limpiados")
