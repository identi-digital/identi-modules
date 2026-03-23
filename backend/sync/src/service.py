"""
Servicio de integración con el servicio sync (Parse Server).
Llama a las APIs del sync para: actualizar schemas, leer/escribir/actualizar datos en Parse.
"""
import os
import requests
from typing import Any, Optional


class SyncServiceError(Exception):
    def __init__(self, message: str, status_code: Optional[int] = None, response: Any = None):
        self.message = message
        self.status_code = status_code
        self.response = response
        super().__init__(message)


class SyncService:
    def __init__(self, container=None):
        self._base_url = (os.getenv("SYNC_SERVICE_URL") or "").rstrip("/")
        self._schema_secret = os.getenv("SYNC_SCHEMA_API_SECRET") or ""
        self._master_key = os.getenv("PARSE_MASTER_KEY") or ""
        self._app_id = os.getenv("PARSE_APP_ID") or os.getenv("APP_ID") or ""
        self._timeout = int(os.getenv("SYNC_HTTP_TIMEOUT", "30"))

    def _headers_schema(self) -> dict:
        return {
            "Content-Type": "application/json",
            "x-schema-secret": self._schema_secret,
        }

    def _headers_parse(self) -> dict:
        return {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": self._app_id,
            "X-Parse-Master-Key": self._master_key,
        }

    def update_schema_classes(self, class_names: list[str]) -> dict:
        """Notifica al sync las clases a registrar (PUT /api/schema/classes)."""
        if not self._base_url:
            raise SyncServiceError("SYNC_SERVICE_URL no configurado")
        if not self._schema_secret:
            raise SyncServiceError("SYNC_SCHEMA_API_SECRET no configurado")
        url = f"{self._base_url}/api/schema/classes"
        r = requests.put(
            url,
            json={"classNames": class_names},
            headers=self._headers_schema(),
            timeout=self._timeout,
        )
        if r.status_code >= 400:
            raise SyncServiceError(
                r.text or f"Error {r.status_code}",
                status_code=r.status_code,
                response=r.json() if r.headers.get("content-type", "").startswith("application/json") else None,
            )
        return r.json()

    def get_schema_classes(self) -> dict:
        """Obtiene la lista actual de clases del sync (GET /api/schema/classes)."""
        if not self._base_url:
            raise SyncServiceError("SYNC_SERVICE_URL no configurado")
        url = f"{self._base_url}/api/schema/classes"
        r = requests.get(url, timeout=self._timeout)
        if r.status_code >= 400:
            raise SyncServiceError(r.text or f"Error {r.status_code}", status_code=r.status_code)
        return r.json()

    def parse_request(
        self,
        method: str,
        path: str,
        params: Optional[dict] = None,
        json: Optional[dict] = None,
    ) -> dict | list:
        """Realiza una petición a la API Parse del sync (/parse/...)."""
        if not self._base_url or not self._master_key or not self._app_id:
            raise SyncServiceError("SYNC_SERVICE_URL, PARSE_MASTER_KEY y PARSE_APP_ID (o APP_ID) deben estar configurados")
        url = f"{self._base_url}/parse/{path.lstrip('/')}"
        r = requests.request(
            method,
            url,
            params=params,
            json=json,
            headers=self._headers_parse(),
            timeout=self._timeout,
        )
        if r.status_code >= 400:
            raise SyncServiceError(
                r.text or f"Error {r.status_code}",
                status_code=r.status_code,
                response=r.json() if r.headers.get("content-type", "").startswith("application/json") else None,
            )
        if not r.content:
            return {}
        return r.json()

    def parse_get_class(self, class_name: str, where: Optional[dict] = None, limit: int = 100, skip: int = 0) -> dict:
        """GET /parse/classes/{class_name} con query where, limit, skip."""
        params = {"limit": limit, "skip": skip}
        if where:
            import json
            params["where"] = json.dumps(where)
        return self.parse_request("GET", f"classes/{class_name}", params=params)

    def parse_create(self, class_name: str, body: dict) -> dict:
        """POST /parse/classes/{class_name}."""
        return self.parse_request("POST", f"classes/{class_name}", json=body)

    def parse_get_one(self, class_name: str, object_id: str) -> dict:
        """GET /parse/classes/{class_name}/{object_id}."""
        return self.parse_request("GET", f"classes/{class_name}/{object_id}")

    def parse_update(self, class_name: str, object_id: str, body: dict) -> dict:
        """PUT /parse/classes/{class_name}/{object_id}."""
        return self.parse_request("PUT", f"classes/{class_name}/{object_id}", json=body)

    def parse_delete(self, class_name: str, object_id: str) -> dict:
        """DELETE /parse/classes/{class_name}/{object_id}."""
        return self.parse_request("DELETE", f"classes/{class_name}/{object_id}")

    def parse_bulk_create(self, class_name: str, objects: list[dict]) -> list[dict]:
        """Crea varios objetos en Parse (POST por cada uno; devuelve lista de resultados)."""
        results = []
        for obj in objects:
            try:
                results.append(self.parse_create(class_name, obj))
            except SyncServiceError as e:
                results.append({"error": e.message, "status_code": e.status_code, "object": obj})
        return results
