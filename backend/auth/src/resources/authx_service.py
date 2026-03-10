import base64
import time
from typing import Any, Dict
import json
import requests
from fastapi.datastructures import Headers



class AuthXService:
    _instance = None
    HEADER_PREFIX: str = "Identi"
    AUTHX_BASE_URL: str = ""
    CLIENT_ID: str = ""
    CLIENT_SECRET: str = ""
    JWKS: dict[str, dict] = {}
    _access_token: str = ""
    _token_expires_at: float = 0

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self, CLIENT_ID, CLIENT_SECRET, AUTHX_BASE_URL, APP_CONTEXT_ID, TENANT):
        self.AUTHX_BASE_URL = AUTHX_BASE_URL
        self.CLIENT_ID = CLIENT_ID
        self.CLIENT_SECRET = CLIENT_SECRET
        self.APP_CONTEXT_ID = APP_CONTEXT_ID
        self.TENANT = TENANT
        self._access_token = ""
        self._token_expires_at = 0

    @property
    def access_token(self) -> str:
        if self._needs_refresh():
            self._authenticate()
        return self._access_token

    def __get_encoded_auth(self):
        encoded_auth = base64.b64encode(
            f"{self.CLIENT_ID}:{self.CLIENT_SECRET}".encode("utf-8")
        ).decode("utf-8")
        return encoded_auth

    def __get_auth_headers(self) -> dict:
        """Get headers with authentication token"""
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Basic {self.__get_encoded_auth()}",
        }
        return headers

    def _needs_refresh(self) -> bool:
        return time.time() >= (self._token_expires_at - 300)

    def _authenticate(self) -> None:
        """Authenticate with AuthX service and store tokens"""
        url = f"{self.AUTHX_BASE_URL}/oauth2/token"
        headers = self.__get_auth_headers()
        data = {
            "grant_type": "client_credentials",
            "scope": "identi_scopes",
            "tenant_id": self.TENANT,
            "application_context_id": self.APP_CONTEXT_ID
        }

        response = requests.post(url, headers=headers, json=data)
        if response.status_code != 200:
            raise Exception(f"Failed to authenticate with AuthX service (status_code: {response.status_code})")
        self._update_tokens(response.json())

    def _update_tokens(self, token_data: Dict[str, Any]) -> None:
        """Update tokens from auth response"""
        self._access_token = token_data["access_token"]
        self._token_expires_at = time.time() + token_data.get("expires_in", 3600)

    def api_verify_token(self, header: Headers, actions: list = []) -> str:
        if not header:
            raise Exception("Authorization header is required.")
        token = header.get("authorization", "").split(" ")
 
        if len(token) != 2:
            raise Exception("Invalid authorization header.")
        if token[0] != self.HEADER_PREFIX:
            raise Exception("Invalid authorization header.")
        try:
            url = f"{self.AUTHX_BASE_URL}/oauth2/verify-token"
            headers = self.__get_auth_headers()
            
            headers = {
                **headers,
                "X-Application-Context": self.APP_CONTEXT_ID,
                "X-Tenant-Id": self.TENANT,
            }
            print(f"headers: {headers}")
            response = requests.post(
                url,
                headers=headers,
                json={"token": token[1], "actions": actions},
            )
            print(f"response: {response.json()}")
            if response.status_code != 200:
                raise Exception(f"Failed to verify token (status_code: {response.status_code})")

        except Exception as err:
            raise Exception(f"Invalid authorization header {err}.") from err
        return token[1]
    
    def register_entity(self, 
                    username,
                    disabled = True,
                    roles = [],
                    permissions = [],
                    eid = None,
                    first_name=None, 
                    last_name=None, 
                    wsp_number=None, 
                    cell_number=None, 
                    sms_number=None, 
                    email=None,
                    country='PE'):
        """Crear usuario
        :param username: nombre de usuario
        :param password: contraseña
        :param disabled: usuario deshabilitado
        :param exp: tiempo de expiración    
        :param first_name: nombre
        :param last_name: apellido
        :param wsp_number: número de whatsapp
        :param cell_number: número de celular
        :param sms_number: número de sms
        :param email: email
        :param tenant: organization_tenant_id
        :param country: país     
        """
    
        headers = {
            "Content-Type": "application/json",
        }
        headers['Authorization'] = f"Identi {self.access_token}"

        url = f"{self.AUTHX_BASE_URL}/entities"
        data = {
            'username': username,
            'is_disabled': disabled,
            'identi_roles': roles,
            'identi_permissions': permissions,
            'eid': eid,
            'first_name': first_name,
            'last_name': last_name,
            'wsp_number': wsp_number,
            'cell_number': cell_number,
            'sms_number': sms_number,
            'email': email,
            'country': country,
            'organization_tenant_id': self.TENANT,
            'application_context_id': self.APP_CONTEXT_ID
        }
        
        response = requests.post(url, headers=headers , data=json.dumps(data))
        if response.status_code // 100 == 2:
            return response.json()
        
        raise Exception(f"Request failed (status_code: {response.status_code}): {response.json()}")
      
    def update_entity(self,
                    country,
                    entity_id,
                    organization_tenant_id,
                    identi_permissions,
                    identi_roles,
                    wsp_number=None, 
                    cell_number=None, 
                    sms_number=None, 
                    email=None):
        """
        :param wsp_number: número de whatsapp
        :param cell_number: número de celular
        :param sms_number: número de sms
        :param email: email
        """
    
        headers = {
            "Content-Type": "application/json",
        }
        headers['Authorization'] = f"Identi {self.access_token}"

        url = f"{self.AUTHX_BASE_URL}/entities/{entity_id}"
        
        data = {}
        if country:
            data['country'] = country
        if wsp_number:
            data['wsp_number'] = wsp_number
        if cell_number:
            data['cell_number'] = cell_number
        if sms_number:
            data['sms_number'] = sms_number
        if email:
            data['email'] = email
    
        data['application_context_id'] = self.APP_CONTEXT_ID
        data['organization_tenant_id'] = organization_tenant_id
        data['identi_permissions'] = identi_permissions
        data['identi_roles'] = identi_roles

        response = requests.patch(url, headers=headers , data=json.dumps(data))
        if response.status_code // 100 == 2:
            return response.json()
        
        raise Exception(f"Request failed (status_code: {response.status_code}): {response.json()}")
      
    def delete_entity(self, entity_id):
        """
        Elimino un usuario en auth x.
        """
    
        headers = {
            "Content-Type": "application/json",
            "X-Tenant-Id": self.TENANT,
            "Authorization": f"Identi {self.access_token}"
        }

        url = f"{self.AUTHX_BASE_URL}/entities/{entity_id}"
        
        response = requests.delete(url, headers=headers)
        if response.status_code // 100 == 2:
            return response.json()
        else:
            raise Exception(f"Request failed (status_code: {response.status_code}): {response.json()}")
    def restore_entity(self, entity_id):
        """
        Restaura un usuario en auth x.
        """
    
        headers = {
            "Content-Type": "application/json",
            "X-Tenant-Id": self.TENANT,
            "Authorization": f"Identi {self.access_token}"
        }

        url = f"{self.AUTHX_BASE_URL}/entities/{entity_id}/restore"
        
        response = requests.patch(url, headers=headers)
        if response.status_code // 100 == 2:
            return response.json()
        else:
            raise Exception(f"Request failed (status_code: {response.status_code}): {response.json()}")
                   
        url = f"{self.AUTHX_BASE_URL}/entities?tenant_id={self.TENANT}&application_context_id={self.APP_CONTEXT_ID}&which_users={which_users}"
        headers = {
            "Content-Type": "application/json",
        }
        headers['Authorization'] = f"Identi {self.access_token}"
        
        if page:
            url = f"{url}&page={page}"
        if per_page:
            url = f"{url}&per_page={per_page}"
        if sort_by:
            url = f"{url}&sort_by={sort_by}"
        if order:
            url = f"{url}&order={order}"
        if search:
            url = f"{url}&search={search}"
            
        for role in roles:
            url = f"{url}&roles={role}"
        for permission in permissions:
            url = f"{url}&permissions={permission}"

        response = requests.get(url, headers=headers)
        if response.status_code // 100 == 2:
            return response.json()
        
        raise Exception(f"Request failed (status_code: {response.status_code}): {response.json()}")