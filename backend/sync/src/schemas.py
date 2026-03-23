"""Schemas Pydantic para el módulo sync."""
from pydantic import BaseModel
from typing import Optional, Any


class SchemaClassesUpdate(BaseModel):
    classNames: list[str]


class ParseQueryParams(BaseModel):
    limit: int = 100
    skip: int = 0
    where: Optional[dict] = None  # JSON where clause


# Body para crear/actualizar en Parse es genérico (dict)
# No definimos schema estricto para permitir cualquier campo de Parse
