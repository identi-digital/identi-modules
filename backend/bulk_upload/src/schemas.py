from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import datetime
from uuid import UUID


class BulkUploadJobResponse(BaseModel):
    id: UUID
    form_id: UUID
    entity_name: str
    file_name: Optional[str] = None
    total_rows: int
    success_count: int
    error_count: int
    status: str
    created_at: datetime
    created_by: Optional[UUID] = None
    finished_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BulkUploadErrorItem(BaseModel):
    row_index: int
    column_name: str
    message: str
    value: Optional[Any] = None


class BulkUploadJobDetailResponse(BulkUploadJobResponse):
    errors: Optional[List[dict]] = None
    column_headers: Optional[List[str]] = None


class PaginatedBulkUploadJobsResponse(BaseModel):
    page: int = 1
    per_page: int = 10
    total: int
    items: List[BulkUploadJobResponse] = []


class PaginatedBulkUploadErrorsResponse(BaseModel):
    page: int = 1
    per_page: int = 10
    total: int
    items: List[BulkUploadErrorItem] = []


class JobHeadersResponse(BaseModel):
    """Nombres de columnas del job (mismo orden que en la plantilla)."""
    headers: List[str] = []


class JobRowResponse(BaseModel):
    """Una fila: row_index más por cada columna su valor y columna_error."""
    model_config = ConfigDict(extra="allow")
    row_index: int


class PaginatedJobRowsResponse(BaseModel):
    """Filas del job paginadas; cada fila tiene columnas y columnas_error."""
    page: int = 1
    per_page: int = 10
    total: int
    items: List[Dict[str, Any]] = []


class UploadAcceptedResponse(BaseModel):
    job_id: UUID
    message: str = "Carga aceptada. El procesamiento se ejecuta en segundo plano."
