from dataclasses import dataclass
from sqlalchemy import Column, Integer, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID, JSONB

from core.models.base_class import Model


@dataclass
class BulkUploadJobRowModel(Model):
    """Fila individual de un job de carga masiva. Permite paginación real en BD."""

    __tablename__ = "bulk_upload_job_rows"
    __table_args__ = {"schema": "public", "extend_existing": True}

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuid_generate_v4()"),
        nullable=False,
    )
    job_id = Column(
        UUID(as_uuid=True),
        ForeignKey("public.bulk_upload_jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    row_index = Column(Integer, nullable=False)
    values = Column(
        JSONB,
        nullable=False,
        default=dict,
        info={"description": "valores por columna: {col_name: value}"},
    )
    errors = Column(
        JSONB,
        nullable=False,
        default=dict,
        info={"description": "errores por columna: {col_name: message}"},
    )
