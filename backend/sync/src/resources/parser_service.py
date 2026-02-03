import os
import re
from pathlib import Path
from typing import Any, Dict, Optional

import yaml

from .parser_client import ParserClient


class ParserService:
    def __init__(self, module_options: Optional[Dict[str, Any]] = None):
        self.module_options = module_options or {}
        self.config = self._load_full_config()
        self.sync_config = self.config.get("sync", {})
        self.parser_config = self.config.get("parser", {})

        parser_url = self.module_options.get("parser_url") or self.sync_config.get("parser_url")
        if not parser_url:
            raise ValueError("sync.parser_url is required in config.yaml")

        timeout = self.module_options.get("timeout") or self.sync_config.get("timeout", 5)
        retries = self.module_options.get("retries") or self.sync_config.get("retries", 2)
        backoff = self.module_options.get("retry_backoff_seconds") or self.sync_config.get("retry_backoff_seconds", 0.5)
        self.default_project = (
            self.module_options.get("default_project")
            or self.sync_config.get("default_project")
            or self.parser_config.get("default_project")
        )

        self.client = ParserClient(
            base_url=parser_url,
            timeout=timeout,
            retries=retries,
            backoff_seconds=backoff,
        )

    def parse(self, text: str, project: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        target_project = project or self.default_project
        return self.client.parse(text=text, project=target_project, metadata=metadata)

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

    def _load_full_config(self) -> Dict[str, Any]:
        config_path = os.getenv("BACKEND_CONFIG_PATH")
        if config_path:
            path = Path(config_path)
        else:
            current_file = Path(__file__).resolve()
            backend_path = current_file.parents[4]
            path = backend_path / "config.yaml"
        if not path.exists():
            raise FileNotFoundError(f"Backend config.yaml not found: {path}")
        with path.open("r", encoding="utf-8") as handle:
            config = yaml.safe_load(handle) or {}
            # Procesar variables de entorno en el config
            return self._replace_env_variables(config)
