from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, BackgroundTasks
from fastapi.responses import StreamingResponse
from starlette.requests import Request
from typing import Optional
from uuid import UUID
from io import BytesIO

from .schemas import (
    PaginatedBulkUploadJobsResponse,
    BulkUploadJobDetailResponse,
    PaginatedBulkUploadErrorsResponse,
    JobHeadersResponse,
    PaginatedJobRowsResponse,
    UploadAcceptedResponse,
)

router = APIRouter(prefix="/bulk-upload", tags=["Bulk Upload"])


def get_funcionalities(request: Request):
    return request.app.state.container.get("bulk_upload")


@router.get("/template")
def get_template(
    form_id: UUID = Query(..., description="ID del formulario"),
    svc=Depends(get_funcionalities),
):
    """Genera plantilla Excel dinámica. Requiere form_id."""
    import sys
    sys.stderr.write(f"[BULK_TEMPLATE] GET /template form_id={form_id}\n")
    sys.stderr.flush()
    try:
        bio, form_name = svc.get_template_excel(form_id=form_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    filename = f"plantilla_{form_name}.xlsx"
    return StreamingResponse(
        bio,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )



@router.get("/jobs", response_model=PaginatedBulkUploadJobsResponse)
def get_jobs(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    entity_name: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    svc=Depends(get_funcionalities),
):
    """Listado paginado de cargas masivas (entidad, fecha, total, exitosos, estado)."""
    return svc.get_jobs(page=page, per_page=per_page, entity_name=entity_name, status=status)


@router.get("/jobs/{job_id}", response_model=BulkUploadJobDetailResponse)
def get_job_detail(job_id: UUID, svc=Depends(get_funcionalities)):
    """Detalle de un job: status, total_rows, success_count, error_count, created_at, finished_at."""
    job = svc.get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job no encontrado")
    return job


@router.get("/jobs/{job_id}/headers", response_model=JobHeadersResponse)
def get_job_headers(job_id: UUID, svc=Depends(get_funcionalities)):
    """Devuelve los nombres de columnas (headers) del job, en el mismo orden que la plantilla."""
    result = svc.get_job_headers(job_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Job no encontrado")
    return result


@router.get("/jobs/{job_id}/errors", response_model=PaginatedJobRowsResponse)
def get_job_errors(
    job_id: UUID,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=500),
    errors_only: bool = Query(False, description="Si true, solo filas que tienen al menos un error"),
    svc=Depends(get_funcionalities),
):
    """Filas del job paginadas. Cada fila incluye por columna: valor y columna_error (mensaje si hay error)."""
    result = svc.get_job_rows(job_id, page=page, per_page=per_page, errors_only=errors_only)
    if result is None:
        raise HTTPException(status_code=404, detail="Job no encontrado")
    return result


@router.get("/jobs/{job_id}/errors/excel")
def get_job_errors_excel(job_id: UUID, svc=Depends(get_funcionalities)):
    """Descarga reporte de errores en Excel (fila, columna, mensaje, valor)."""
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Border, Side
    from io import BytesIO

    job = svc.get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job no encontrado")
    if not job.errors:
        raise HTTPException(status_code=404, detail="No hay errores para este job")
    wb = Workbook()
    ws = wb.active
    ws.title = "Errores"[:31]
    headers = ["Fila", "Columna", "Mensaje", "Valor"]
    for c, h in enumerate(headers, 1):
        cell = ws.cell(row=1, column=c, value=h)
        cell.fill = PatternFill(start_color="C00000", end_color="C00000", fill_type="solid")
        cell.font = Font(bold=True, color="FFFFFF")
    thin = Side(style="thin")
    for row_idx, err in enumerate(job.errors, 2):
        ws.cell(row=row_idx, column=1, value=err.get("row_index"))
        ws.cell(row=row_idx, column=2, value=err.get("column_name", ""))
        ws.cell(row=row_idx, column=3, value=err.get("message", ""))
        ws.cell(row=row_idx, column=4, value=err.get("value"))
    bio = BytesIO()
    wb.save(bio)
    bio.seek(0)
    return StreamingResponse(
        bio,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="errores_carga_{job_id}.xlsx"'},
    )


@router.post("/upload", response_model=UploadAcceptedResponse, status_code=202)
def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    form_id: Optional[UUID] = Query(None),
    entity_name: Optional[str] = Query(None),
    svc=Depends(get_funcionalities),
):
    """Acepta archivo Excel y encola procesamiento en segundo plano. Límite 10.000 filas. Requiere form_id o entity_name."""
    if not file.filename or not file.filename.lower().endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="Se requiere un archivo .xlsx")
    data_collector = svc.container.get("data_collector")
    form_with_schema = None
    if form_id:
        form_with_schema = data_collector.get_form_by_id(form_id)
    elif entity_name:
        form_with_schema = data_collector.get_form_by_entity_name(entity_name)
    if not form_with_schema:
        raise HTTPException(status_code=400, detail="Formulario no encontrado. Indique form_id o entity_name válido.")
    content = file.read()
    from openpyxl import load_workbook
    wb = load_workbook(BytesIO(content), read_only=True, data_only=True)
    ws = wb.active
    data_rows = max(0, (ws.max_row - 2))
    wb.close()
    if data_rows > 10000:
        raise HTTPException(status_code=400, detail="Máximo 10.000 filas de datos permitidas.")
    job = svc.create_job(
        form_id=form_with_schema.id,
        entity_name=form_with_schema.entity_name or "unknown",
        file_name=file.filename,
        total_rows=data_rows,
    )
    background_tasks.add_task(svc.process_upload_background, job.id, content)
    return UploadAcceptedResponse(job_id=job.id)
