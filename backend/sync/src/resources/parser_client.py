import time
from typing import Any, Dict, Optional

import requests


class ParserClient:
    def __init__(
        self,
        base_url: str,
        timeout: int = 5,
        retries: int = 2,
        backoff_seconds: float = 0.5,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.retries = retries
        self.backoff_seconds = backoff_seconds
        self.session = requests.Session()

    def parse(self, text: str, project: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not text:
            raise ValueError("text is required")

        payload: Dict[str, Any] = {"text": text, "metadata": metadata or {}}
        if project:
            payload["project"] = project

        last_error: Optional[Exception] = None
        for attempt in range(self.retries + 1):
            try:
                response = self.session.post(
                    f"{self.base_url}/parse",
                    json=payload,
                    timeout=self.timeout,
                )
                if 500 <= response.status_code < 600:
                    raise RuntimeError(f"Parser service error: {response.status_code} {response.text}")
                response.raise_for_status()
                return response.json()
            except Exception as exc:
                last_error = exc
                if attempt < self.retries:
                    time.sleep(self.backoff_seconds * (attempt + 1))
                    continue
                raise exc from last_error
