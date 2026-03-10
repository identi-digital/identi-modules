from dataclasses import dataclass
from sqlalchemy import Column, String, Integer, TIMESTAMP, ForeignKey, func, text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
import enum

from core.models.base_class import Model


class BulkUploadStatus(enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    error = "error"


@dataclass
class BulkUploadJobModel(Model):
    """Job de carga masiva: historial y estado de cada ejecución."""

    __tablename__ = "bulk_upload_jobs"
    __table_args__ = {"schema": "public", "extend_existing": True}

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuid_generate_v4()"),
        unique=True,
        nullable=False,
    )
    form_id = Column(
        UUID(as_uuid=True),
        ForeignKey("public.forms.id"),
        nullable=False,
        info={"display_name": "Formulario", "description": "formulario usado en la carga"},
    )
    entity_name = Column(
        String(255),
        nullable=False,
        info={"display_name": "Entidad", "description": "nombre de la entidad (denormalizado)"},
    )
    file_name = Column(String(512), nullable=True)
    total_rows = Column(Integer, nullable=False, default=0)
    success_count = Column(Integer, nullable=False, default=0)
    error_count = Column(Integer, nullable=False, default=0)
    status = Column(
        SQLEnum(
            BulkUploadStatus,
            name="bulk_upload_status",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=BulkUploadStatus.pending,
    )
    created_at = Column(TIMESTAMP, server_default=func.now())
    created_by = Column(
        UUID(as_uuid=True),
        ForeignKey("public.identities.id"),
        nullable=True,
        info={"display_name": "Usuario", "description": "usuario que inició la carga"},
    )
    finished_at = Column(TIMESTAMP, nullable=True)
    errors = Column(
        JSONB,
        nullable=True,
        info={
            "display_name": "Errores",
            "description": "lista de {row_index, column_name, message, value}",
        },
    )
    column_headers = Column(
        JSONB,
        nullable=True,
        info={"display_name": "Columnas", "description": "nombres de columnas del job en orden"},
    )
    rows_data = Column(
        JSONB,
        nullable=True,
        info={
            "display_name": "Filas",
            "description": "por cada fila: {row_index, values: {col: value}, errors: {col: message}}",
        },
    )

    def __init__(self, **kwargs):
        super(BulkUploadJobModel, self).__init__(**kwargs)

    def __hash__(self):
        return hash(self.id)
