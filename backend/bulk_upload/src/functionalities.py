from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple
from uuid import UUID
from io import BytesIO
from sqlalchemy.orm import Session

from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side

from .models.bulk_upload_job import BulkUploadJobModel, BulkUploadStatus
from .schemas import (
    BulkUploadJobResponse,
    BulkUploadJobDetailResponse,
    PaginatedBulkUploadJobsResponse,
    BulkUploadErrorItem,
    PaginatedBulkUploadErrorsResponse,
    JobHeadersResponse,
    PaginatedJobRowsResponse,
)


class Funcionalities:
    def __init__(self, container, database_key: str = "core_db", **kwargs):
        self.container = container
        self.database_key = database_key

    def _get_db(self) -> Session:
        return self.container.get(self.database_key, "databases")

    def get_jobs(
        self,
        page: int = 1,
        per_page: int = 10,
        entity_name: Optional[str] = None,
        status: Optional[str] = None,
    ) -> PaginatedBulkUploadJobsResponse:
        db = self._get_db()
        query = db.query(BulkUploadJobModel)
        if entity_name:
            query = query.filter(BulkUploadJobModel.entity_name == entity_name)
        if status:
            try:
                status_enum = BulkUploadStatus(status)
                query = query.filter(BulkUploadJobModel.status == status_enum)
            except ValueError:
                pass
        total = query.count()
        offset = (page - 1) * per_page
        items = query.order_by(BulkUploadJobModel.created_at.desc()).offset(offset).limit(per_page).all()
        return PaginatedBulkUploadJobsResponse(
            page=page,
            per_page=per_page,
            total=total,
            items=[
                BulkUploadJobResponse(
                    id=j.id,
                    form_id=j.form_id,
                    entity_name=j.entity_name,
                    file_name=j.file_name,
                    total_rows=j.total_rows,
                    success_count=j.success_count,
                    error_count=j.error_count,
                    status=j.status.value,
                    created_at=j.created_at,
                    created_by=j.created_by,
                    finished_at=j.finished_at,
                )
                for j in items
            ],
        )

    def get_job_headers(self, job_id: UUID) -> Optional[JobHeadersResponse]:
        """Devuelve los nombres de columnas del job (headers del Excel)."""
        db = self._get_db()
        job = db.query(BulkUploadJobModel).filter(BulkUploadJobModel.id == job_id).first()
        if not job:
            return None
        headers = job.column_headers if isinstance(job.column_headers, list) else []
        return JobHeadersResponse(headers=headers)

    def get_job_rows(
        self,
        job_id: UUID,
        page: int = 1,
        per_page: int = 10,
        errors_only: bool = False,
    ) -> Optional[PaginatedJobRowsResponse]:
        """Filas del job paginadas; cada fila tiene para cada columna: valor y columna_error. Si errors_only=true solo filas con al menos un error."""
        db = self._get_db()
        job = db.query(BulkUploadJobModel).filter(BulkUploadJobModel.id == job_id).first()
        if not job or not job.rows_data:
            return PaginatedJobRowsResponse(page=page, per_page=per_page, total=0, items=[])
        headers = job.column_headers or []
        rows = list(job.rows_data)
        if errors_only:
            rows = [r for r in rows if r.get("errors") and len(r.get("errors", {})) > 0]
        total = len(rows)
        offset = (page - 1) * per_page
        page_rows = rows[offset : offset + per_page]
        items = []
        for r in page_rows:
            row_index = r.get("row_index", 0)
            values = r.get("values") or {}
            errors = r.get("errors") or {}
            item = {"row_index": row_index}
            for h in headers:
                item[h] = values.get(h)
                item[f"{h}_error"] = errors.get(h)
            items.append(item)
        return PaginatedJobRowsResponse(page=page, per_page=per_page, total=total, items=items)

    def get_job_by_id(self, job_id: UUID) -> Optional[BulkUploadJobDetailResponse]:
        db = self._get_db()
        job = db.query(BulkUploadJobModel).filter(BulkUploadJobModel.id == job_id).first()
        if not job:
            return None
        return BulkUploadJobDetailResponse(
            id=job.id,
            form_id=job.form_id,
            entity_name=job.entity_name,
            file_name=job.file_name,
            total_rows=job.total_rows,
            success_count=job.success_count,
            error_count=job.error_count,
            status=job.status.value,
            created_at=job.created_at,
            created_by=job.created_by,
            finished_at=job.finished_at,
            errors=job.errors,
            column_headers=job.column_headers if isinstance(job.column_headers, list) else None,
        )

    def get_job_errors(
        self,
        job_id: UUID,
        page: int = 1,
        per_page: int = 100,
    ) -> Optional[PaginatedBulkUploadErrorsResponse]:
        db = self._get_db()
        job = db.query(BulkUploadJobModel).filter(BulkUploadJobModel.id == job_id).first()
        if not job or not job.errors:
            return PaginatedBulkUploadErrorsResponse(page=page, per_page=per_page, total=0, items=[])
        all_errors = [BulkUploadErrorItem(**e) for e in job.errors]
        total = len(all_errors)
        offset = (page - 1) * per_page
        items = all_errors[offset : offset + per_page]
        return PaginatedBulkUploadErrorsResponse(page=page, per_page=per_page, total=total, items=items)

    def create_job(
        self,
        form_id: UUID,
        entity_name: str,
        file_name: Optional[str],
        total_rows: int,
        created_by: Optional[UUID] = None,
    ) -> BulkUploadJobModel:
        db = self._get_db()
        job = BulkUploadJobModel(
            form_id=form_id,
            entity_name=entity_name,
            file_name=file_name,
            total_rows=total_rows,
            success_count=0,
            error_count=0,
            status=BulkUploadStatus.pending,
            created_by=created_by,
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        return job

    def get_template_excel(self, form_id: UUID) -> Tuple[BytesIO, str]:
        """Genera plantilla Excel dinámica desde el schema del formulario. Retorna (bio, form_name)."""
        data_collector = self.container.get("data_collector")
        form_with_schema = data_collector.get_form_by_id(form_id)
        if not form_with_schema or not form_with_schema.schema:
            raise ValueError("Formulario no encontrado o sin schema")
        print(f"[BULK_TEMPLATE] Llamando get_schema_columns_for_template para form_id={form_id}", flush=True)
        columns = data_collector.get_schema_columns_for_template(form_with_schema.schema)
        print(f"[BULK_TEMPLATE] Columnas recibidas: {[c.get('name') for c in columns]}", flush=True)
        if not columns:
            raise ValueError("El schema del formulario no tiene columnas para la plantilla")
        form_name = (form_with_schema.name or "datos").strip()
        form_name = "".join(c if c.isalnum() or c in " -_" else "_" for c in form_name) or "datos"
        wb = Workbook()
        ws = wb.active
        ws.title = "Datos"[:31]
        header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
        header_font = Font(bold=True, color="FFFFFF", size=11)
        thin = Side(style="thin")
        border = Border(left=thin, right=thin, top=thin, bottom=thin)
        for col_num, col in enumerate(columns, 1):
            # Usar name como header (ej: farmer_dni) para que coincida con el nombre de columna esperado en el upload
            cell = ws.cell(row=1, column=col_num, value=col["name"])
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
            cell.border = border
        for col_num, col in enumerate(columns, 1):
            hint = "Identificador" if col.get("is_logical_identifier") else ""
            cell = ws.cell(row=2, column=col_num, value=hint)
            cell.border = border
        bio = BytesIO()
        wb.save(bio)
        bio.seek(0)
        return bio, form_name


    def process_upload_background(self, job_id: UUID, file_content: bytes) -> None:
        """Procesa el archivo Excel en segundo plano: validación, duplicados, relaciones, inserción por lotes."""
        MAX_ROWS = 10000
        db = self._get_db()
        data_collector = self.container.get("data_collector")
        try:
            from modules.data_collector.src.models.core_registers import CoreRegisterModel, RegisterStatus
            from modules.data_collector.src.models.forms import FormModel, FormPurpose
            from modules.data_collector.src.resources.register_processor import (
                process_register_to_entity,
                find_model_by_entity_name,
            )
            from modules.data_collector.src.resources.form_auto_creator import get_logical_identifier_field
        except ImportError:
            from backend.modules.data_collector.src.models.core_registers import CoreRegisterModel, RegisterStatus
            from backend.modules.data_collector.src.models.forms import FormModel, FormPurpose
            from backend.modules.data_collector.src.resources.register_processor import (
                process_register_to_entity,
                find_model_by_entity_name,
            )
            from backend.modules.data_collector.src.resources.form_auto_creator import get_logical_identifier_field

        job = db.query(BulkUploadJobModel).filter(BulkUploadJobModel.id == job_id).first()
        if not job:
            return
        job.status = BulkUploadStatus.processing
        db.commit()

        errors_list = list(job.errors or [])
        success_count = 0
        error_count = 0
        column_headers = []
        rows_data_list = []

        try:
            form_with_schema = data_collector.get_form_by_id(job.form_id)
            if not form_with_schema or not form_with_schema.schema:
                errors_list.append({"row_index": 0, "column_name": "", "message": "Formulario no encontrado o sin schema", "value": None})
                error_count += 1
                job.errors = errors_list
                job.error_count = error_count
                job.success_count = success_count
                job.status = BulkUploadStatus.error
                job.finished_at = datetime.utcnow()
                db.commit()
                return
            columns = data_collector.get_schema_columns_for_template(form_with_schema.schema)
            if not columns:
                errors_list.append({"row_index": 0, "column_name": "", "message": "Schema sin columnas", "value": None})
                error_count += 1
                job.errors = errors_list
                job.error_count = error_count
                job.success_count = success_count
                job.status = BulkUploadStatus.error
                job.finished_at = datetime.utcnow()
                db.commit()
                return
            logical_id_field = get_logical_identifier_field(form_with_schema.schema)
            schema_form_id = form_with_schema.schema_id
            if not schema_form_id:
                errors_list.append({"row_index": 0, "column_name": "", "message": "Formulario sin schema_id", "value": None})
                error_count += 1
                job.errors = errors_list
                job.error_count = error_count
                job.success_count = success_count
                job.status = BulkUploadStatus.error
                job.finished_at = datetime.utcnow()
                db.commit()
                return

            wb = load_workbook(BytesIO(file_content), read_only=True, data_only=True)
            ws = wb.active
            header_row = [ws.cell(row=1, column=c).value for c in range(1, ws.max_column + 1)]
            col_index_to_name = {}
            for idx, header_cell in enumerate(header_row):
                if header_cell is None:
                    continue
                h = str(header_cell).strip()
                for col in columns:
                    if h == (col.get("display_name") or col["name"]) or h == col["name"]:
                        col_index_to_name[idx + 1] = col["name"]
                        break
            if len(col_index_to_name) == 0:
                errors_list.append({"row_index": 1, "column_name": "", "message": "Cabeceras no coinciden con el schema del formulario", "value": None})
                error_count += 1
                job.errors = errors_list
                job.error_count = error_count
                job.success_count = success_count
                job.status = BulkUploadStatus.error
                job.finished_at = datetime.utcnow()
                db.commit()
                wb.close()
                return
            data_start_row = 3
            max_data_row = min(ws.max_row, MAX_ROWS + data_start_row - 1)
            seen_logical_ids = set()
            model_class = find_model_by_entity_name(job.entity_name) if job.entity_name else None
            column_headers = [c["name"] for c in columns]
            rows_data_list = []

            for row_num in range(data_start_row, max_data_row + 1):
                row_errors = []
                row_dict = {}
                for col_idx, field_name in col_index_to_name.items():
                    cell_val = ws.cell(row=row_num, column=col_idx).value
                    row_dict[field_name] = cell_val
                col_spec = {c["name"]: c for c in columns}
                for field_name, value in list(row_dict.items()):
                    spec = col_spec.get(field_name)
                    if not spec:
                        continue
                    is_optional = spec.get("is_optional", True)
                    if value is None or (isinstance(value, str) and not value.strip()):
                        if not is_optional:
                            row_errors.append((field_name, "Campo obligatorio vacío", value))
                        continue
                    type_value = spec.get("type_value", "text")
                    if type_value == "entity":
                        related_entity = spec.get("foreign_key_table")
                        if related_entity and value:
                            related_form = data_collector.get_form_by_entity_name(related_entity)
                            if related_form and related_form.schema:
                                lid_field = get_logical_identifier_field(related_form.schema)
                                if lid_field:
                                    rel_model = find_model_by_entity_name(related_entity)
                                    if rel_model:
                                        row = db.query(rel_model).filter(getattr(rel_model, lid_field) == value).first()
                                        if row:
                                            row_dict[field_name] = {"id": str(row.id), "display_name": str(value)}
                                        else:
                                            row_errors.append((field_name, f"{related_entity} no encontrado. Cargar primero.", value))
                                    else:
                                        row_errors.append((field_name, f"Entidad {related_entity} no encontrada", value))
                                else:
                                    row_errors.append((field_name, f"Entidad {related_entity} sin identificador lógico configurado", value))
                            else:
                                row_errors.append((field_name, f"Formulario para {related_entity} no encontrado", value))
                    elif type_value == "number":
                        try:
                            if isinstance(value, (int, float)):
                                row_dict[field_name] = value
                            else:
                                row_dict[field_name] = float(value) if "." in str(value) else int(value)
                        except (ValueError, TypeError):
                            row_errors.append((field_name, "Valor numérico inválido", value))
                    elif type_value == "boolean":
                        row_dict[field_name] = str(value).lower() in ("true", "1", "sí", "si", "yes")
                    else:
                        row_dict[field_name] = value if not isinstance(value, str) or value.strip() else None

                if logical_id_field and model_class:
                    lid_val = row_dict.get(logical_id_field)
                    if lid_val is None or (isinstance(lid_val, str) and not lid_val.strip()):
                        row_errors.append((logical_id_field, "Identificador lógico obligatorio", lid_val))
                    else:
                        lid_str = str(lid_val).strip()
                        if lid_str in seen_logical_ids:
                            row_errors.append((logical_id_field, "Identificador duplicado en el archivo", lid_val))
                        else:
                            existing = db.query(model_class).filter(getattr(model_class, logical_id_field) == lid_str).first()
                            if existing:
                                row_errors.append((logical_id_field, "Identificador ya existe en el sistema", lid_val))
                            else:
                                seen_logical_ids.add(lid_str)

                if row_errors:
                    for col_name, msg, val in row_errors:
                        errors_list.append({"row_index": row_num, "column_name": col_name, "message": msg, "value": val})
                    row_errors_dict = {col_name: msg for col_name, msg, _ in row_errors}
                    rows_data_list.append({"row_index": row_num, "values": dict(row_dict), "errors": row_errors_dict})
                    error_count += 1
                    continue

                rows_data_list.append({"row_index": row_num, "values": dict(row_dict), "errors": {}})
                detail = []
                for col in columns:
                    template_name = col["name"]
                    schema_name = col.get("schema_field_name") or template_name
                    val = row_dict.get(template_name)
                    if val is None and col.get("is_optional", True):
                        continue
                    type_val = col.get("type_value", "text")
                    item = {"name": schema_name, "value": val, "type_value": type_val}
                    if type_val == "entity" and isinstance(val, dict):
                        item["value"] = val
                    detail.append(item)
                try:
                    register = CoreRegisterModel(
                        form_id=job.form_id,
                        schema_form_id=schema_form_id,
                        detail=detail,
                        status=RegisterStatus.success,
                        entity_name=job.entity_name,
                    )
                    db.add(register)
                    db.commit()
                    db.refresh(register)
                    process_register_to_entity(register, db, FormModel, FormPurpose)
                    db.commit()
                    success_count += 1
                except Exception as e:
                    db.rollback()
                    errors_list.append({"row_index": row_num, "column_name": "", "message": str(e), "value": None})
                    error_count += 1

            wb.close()
        except Exception as e:
            errors_list.append({"row_index": 0, "column_name": "", "message": f"Error procesando archivo: {e}", "value": None})
            error_count += 1
            try:
                db.rollback()
            except Exception:
                pass

        db = self._get_db()
        job = db.query(BulkUploadJobModel).filter(BulkUploadJobModel.id == job_id).first()
        if job:
            job.errors = errors_list
            job.success_count = success_count
            job.error_count = error_count
            job.status = BulkUploadStatus.completed if error_count == 0 or success_count > 0 else BulkUploadStatus.error
            job.finished_at = datetime.utcnow()
            job.column_headers = column_headers
            job.rows_data = rows_data_list
            db.commit()
