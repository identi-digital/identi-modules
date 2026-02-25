from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from starlette.requests import Request
from typing import Optional, Dict, Any
from uuid import UUID
from io import BytesIO
import jwt
# Usar importación relativa para evitar problemas durante la inicialización del módulo
from .schemas import (
    FormCreate, FormUpdate, FormResponse, PaginatedFormResponse, FormWithSchemaResponse,
    FormSchemaCreate,
    ActionToolCreate, ActionToolUpdate, ActionToolResponse, PaginatedActionToolResponse,
    CoreRegisterCreate, CoreRegisterUpdate, CoreRegisterResponse, PaginatedCoreRegisterResponse,
    ReferencableEntityResponse, PaginatedReferencableEntityResponse,
    PaginatedEntityListItemResponse,
    PaginatedEntityDataResponse,
    UniqueFieldValidationRequest, UniqueFieldValidationResponse, UniqueFieldComplementaryValidationRequest, UniqueFieldComplementaryValidationResponse
)

router = APIRouter(
    prefix="/data-collector",
    tags=["Data Collector"]
)

def get_funcionalities(request: Request):
    container = request.app.state.container
    return container.get("data_collector")

def get_identity_from_token(request: Request) -> Optional[UUID]:
    """
    Extrae el identity_id del token JWT del header Authorization.
    El token ya fue validado por el middleware, solo necesitamos decodificarlo.
    
    Returns:
        UUID del identity (sub del token) o None si no está presente
    """
    authorization = request.headers.get("Authorization", "")
    if not authorization:
        return None
    
    # Extraer el token (formato: "Bearer <token>" o "Identi <token>")
    parts = authorization.split(" ")
    if len(parts) != 2:
        return None
    
    token = parts[1]
    
    try:
        # Decodificar sin verificar (ya fue verificado por el middleware)
        decoded = jwt.decode(token, options={"verify_signature": False})
        
        # El 'sub' (subject) del token contiene el identity_id
        sub = decoded.get("sub")
        if sub:
            return UUID(sub)
        return None
    except Exception as e:
        print(f"⚠️  Error al decodificar token para obtener identity_id: {e}")
        return None

# Form routes
@router.get("/forms", response_model=PaginatedFormResponse)
def get_forms(
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda"),
    svc=Depends(get_funcionalities)
):
    """Lista todos los formularios paginados"""
    return svc.get_forms(page=page, per_page=per_page, sort_by=sort_by, order=order, search=search)

@router.post("/forms", response_model=FormResponse, status_code=201)
def create_form(form_data: FormCreate, svc=Depends(get_funcionalities)):
    """Crea un nuevo formulario"""
    try:
        return svc.create_form(form_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/forms/{form_id}", response_model=FormResponse)
def update_form(
    form_id: UUID,
    form_data: FormUpdate,
    svc=Depends(get_funcionalities)
):
    """
    Actualiza un formulario existente.
    
    IMPORTANTE: Esta API solo actualiza los datos del form (name, description, etc.)
    pero NO actualiza channel_name ni schema_id.
    - channel_name: No se puede cambiar después de crear el form
    - schema_id: Para actualizar el schema, usa POST /forms/{form_id}/schema
    """
    form = svc.update_form(form_id, form_data)
    if not form:
        raise HTTPException(status_code=404, detail="Formulario no encontrado")
    return form

@router.get("/forms/{form_id}", response_model=FormWithSchemaResponse)
def get_form_by_id(form_id: UUID, svc=Depends(get_funcionalities)):
    """
    Obtiene un formulario por su ID incluyendo su schema.
    
    Busca el form por form_id, obtiene su schema_id, busca el schema_form
    y devuelve el form con el schema como atributo adicional.
    """
    form_with_schema = svc.get_form_by_id(form_id)
    if not form_with_schema:
        raise HTTPException(status_code=404, detail="Formulario no encontrado")
    return form_with_schema

@router.post("/forms/{form_id}/schema", response_model=FormWithSchemaResponse, status_code=201)
def create_form_schema(
    form_id: UUID,
    schema_data: FormSchemaCreate,
    svc=Depends(get_funcionalities)
):
    """
    Crea o actualiza el schema de un formulario.
    
    Guarda el schema en la tabla schema_forms y actualiza el form.schema_id
    para que apunte al schema recién creado.
    
    Esta API siempre crea un nuevo schema_form (no actualiza uno existente).
    El form.schema_id se actualiza automáticamente al nuevo schema.
    """
    try:
        return svc.create_form_schema(form_id, schema_data.schema)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/forms/{form_id}", status_code=204)
def archive_form(form_id: UUID, svc=Depends(get_funcionalities)):
    """Archiva un formulario (deshabilitado lógico)"""
    success = svc.archive_form(form_id)
    if not success:
        raise HTTPException(status_code=404, detail="Formulario no encontrado")
    return None

# Action Tool routes
@router.get("/tools", response_model=PaginatedActionToolResponse)
def get_tools(
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda"),
    svc=Depends(get_funcionalities)
):
    """Lista todas las tools paginadas"""
    return svc.get_tools(page=page, per_page=per_page, sort_by=sort_by, order=order, search=search)

@router.post("/tools", response_model=ActionToolResponse, status_code=201)
def create_tool(tool_data: ActionToolCreate, svc=Depends(get_funcionalities)):
    """Crea una nueva tool"""
    try:
        return svc.create_tool(tool_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/tools/{tool_id}", response_model=ActionToolResponse)
def update_tool(
    tool_id: UUID,
    tool_data: ActionToolUpdate,
    svc=Depends(get_funcionalities)
):
    """Actualiza una tool existente"""
    tool = svc.update_tool(tool_id, tool_data)
    if not tool:
        raise HTTPException(status_code=404, detail="Tool no encontrada")
    return tool

# Core Register routes
@router.get("/forms/{form_id}/registers", response_model=PaginatedCoreRegisterResponse)
def get_registers_by_form(
    form_id: UUID,
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda"),
    start_date: Optional[str] = Query(None, description="Fecha inicio (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Fecha fin (YYYY-MM-DD)"),
    svc=Depends(get_funcionalities)
):
    """
    Lista todos los registros de un formulario paginados
    
    **Filtros disponibles:**
    - `search`: Búsqueda en el campo detail (JSONB)
    - `start_date`: Filtro por fecha de creación desde (formato: YYYY-MM-DD)
    - `end_date`: Filtro por fecha de creación hasta (formato: YYYY-MM-DD)
    - `sort_by`: Campo para ordenar
    - `order`: Orden ascendente (asc) o descendente (desc)
    
    Si no se envían las fechas, no se aplica el filtro de fecha.
    """
    return svc.get_registers_by_form(
        form_id=form_id, 
        page=page, 
        per_page=per_page, 
        sort_by=sort_by, 
        order=order, 
        search=search,
        start_date=start_date,
        end_date=end_date
    )

@router.post("/registers", response_model=CoreRegisterResponse, status_code=201)
def create_register(
    request: Request,
    register_data: CoreRegisterCreate,
    svc=Depends(get_funcionalities)
):
    """
    Crea un nuevo registro en core_registers.
    
    El campo `detail` es un array de objetos con la siguiente estructura:
    - **Campos obligatorios**:
      - `name`: Nombre del campo
      - `value`: Valor del campo (puede ser string, number, boolean, object, array, etc.)
        * Para entidades: `{"id": "...", "display_name": "..."}` o array de objetos
        * Para valores simples: string, number, boolean, etc.
    
    - **Campos opcionales**:
      - `display_name`: Nombre legible del campo (puede enviarse desde el cliente)
      - `is_unique`: Boolean que indica si el campo es único
      - `is_multiple`: Boolean que indica si acepta múltiples valores
      - `type_value`: (Legacy) Tipo de dato
      - `type_list_value`: (Legacy) Boolean que indica si es una lista
    
    **Nota**: Si el cliente no envía `display_name`, el servidor lo calculará
    automáticamente en las respuestas GET basándose en el schema_form.
    Las entidades se detectan automáticamente por su estructura (presencia de campos 'id' y 'display_name').
    
    Si el formulario tiene `form_purpose=ENTITY`, también guarda los datos en la tabla correspondiente.
    
    **Autenticación**: El `identity_id` se obtiene automáticamente del token de autenticación.
    No es necesario enviarlo en el body de la petición.
    """
    try:
        # Obtener identity_id del token automáticamente
        identity_id = get_identity_from_token(request)
        
        # Si se envió identity_id en el body, lo ignoramos y usamos el del token
        if identity_id:
            register_data.identity_id = identity_id
            print(f"🔑 Identity ID obtenido del token: {identity_id}")
        else:
            print("⚠️  No se pudo obtener identity_id del token")
        
        return svc.create_register(register_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/forms/{form_id}/registers/export/excel")
def export_registers_to_excel(
    form_id: UUID,
    sort_by: Optional[str] = Query(None, description="Campo para ordenar"),
    order: Optional[str] = Query("asc", description="asc o desc"),
    search: str = Query("", description="Búsqueda en detail"),
    start_date: Optional[str] = Query(None, description="Fecha inicio (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Fecha fin (YYYY-MM-DD)"),
    max_file_size_mb: float = Query(50.0, ge=1.0, le=200.0, description="Tamaño máximo del archivo en MB"),
    svc=Depends(get_funcionalities)
):
    """
    Exporta registros de un formulario a Excel.
    
    **Límites por peso del archivo:**
    - Por defecto: 50 MB
    - Máximo absoluto: 200 MB
    
    El límite se valida por el tamaño real del archivo generado, no por cantidad de registros.
    Esto asegura que formularios con muchos campos no generen archivos excesivamente grandes.
    
    **Filtros disponibles:**
    - `search`: Búsqueda en el campo detail (JSONB)
    - `start_date`: Filtro por fecha de creación desde (formato: YYYY-MM-DD)
    - `end_date`: Filtro por fecha de creación hasta (formato: YYYY-MM-DD)
    - `sort_by`: Campo para ordenar
    - `order`: Orden ascendente (asc) o descendente (desc)
    - `max_file_size_mb`: Tamaño máximo del archivo en MB (1-200)
    
    **Manejo de campos tipo entity:**
    - Si el campo es una entidad única: muestra el `display_name`
    - Si el campo son múltiples entidades: muestra los `display_name` separados por comas
    - Ejemplo: "Juan Pérez, María García, Pedro López"
    
    **Recomendación:** Use filtros de fecha para exportaciones grandes.
    
    El archivo Excel incluye:
    - Hoja "Registros": Datos con columnas fijas + columnas dinámicas del detail
    - Hoja "Información": Metadatos de la exportación
    - Columna "Usuario Registro": Username obtenido desde el módulo auth
    """
    try:
        excel_bytes, filename = svc.export_core_registers_to_excel(
            form_id=form_id,
            sort_by=sort_by,
            order=order,
            search=search,
            start_date=start_date,
            end_date=end_date,
            max_file_size_mb=max_file_size_mb
        )
        
        # Crear un nuevo BytesIO con los bytes y asegurarse de que esté en la posición correcta
        output_buffer = BytesIO(excel_bytes)
        output_buffer.seek(0)
        
        return StreamingResponse(
            output_buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except ValueError as e:
        # Error de validación (excede límite o formato de fecha inválido)
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generando Excel: {str(e)}"
        )

# Referencable Entities routes
@router.get("/entities", response_model=PaginatedEntityListItemResponse)
def get_referencable_entities(
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda"),
    module_name: Optional[str] = Query(None, description="Filtrar por nombre de módulo"),
    svc=Depends(get_funcionalities)
):
    """
    Lista todas las entidades referenciables paginadas.
    Esta API es usada por la tool de entidades para obtener la lista de entidades disponibles.
    Devuelve: id (entity_name), display_name y description.
    """
    return svc.get_referencable_entities(
        page=page, 
        per_page=per_page, 
        sort_by=sort_by, 
        order=order, 
        search=search,
        module_name=module_name
    )

@router.get("/entities/{entity_name}/data", response_model=PaginatedEntityDataResponse)
def get_entity_data(
    entity_name: str,
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda"),
    representative_value: Optional[str] = Query(None, description="Template para generar el campo 'name' (ej: '{{first_name}} {{dni}}'). Si no se proporciona, se usa el representative_value de la entidad referenciable."),
    filter: Optional[str] = Query(None, description="Filtro(s) en formato 'field=value' o 'entity.field=other_entity.field'. Múltiples filtros separados por coma (ej: 'country_id=PE,status=active' o 'farmers.value=countries.value,farmers.value2=departments.value3'). IMPORTANTE: Al menos una entidad en cada filtro debe ser la entidad actual que se está consultando."),
    svc=Depends(get_funcionalities)
):
    """
    Obtiene datos paginados de una entidad específica.
    Solo funciona si la entidad está registrada en referencable_entities.
    Esta API puede ser usada por el frontend o app para consultar datos de cualquier entidad referenciable.
    
    El campo 'name' se genera desde representative_value:
    - Si se proporciona el parámetro representative_value, se usa ese template
    - Si no, se usa el representative_value de la entidad referenciable en la BD
    - Si ninguno está disponible, se usa el ID como name
    """
    try:
        return svc.get_entity_data(
            entity_name=entity_name,
            page=page,
            per_page=per_page,
            sort_by=sort_by,
            order=order,
            search=search,
            representative_value=representative_value,
            filter=filter
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener datos: {str(e)}")

@router.get("/entities/{entity_id}/mentions", response_model=PaginatedCoreRegisterResponse)
def get_registers_by_entity_mention(
    entity_id: UUID,
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(10, ge=1, le=100, description="Elementos por página"),
    sort_by: Optional[str] = Query(None, description="Campo por el cual ordenar"),
    order: Optional[str] = Query("asc", description="Orden: 'asc' o 'desc'"),
    search: str = Query("", description="Texto de búsqueda"),
    svc=Depends(get_funcionalities)
):
    """
    Lista todos los registros donde una entidad específica ha sido mencionada.
    
    Busca en core_registers.detail donde value contenga el entity_id.
    Detecta entidades por su estructura (presencia de campos 'id' y 'display_name').
    Esto es útil para saber en qué registros se ha referenciado una entidad específica.
    
    Soporta dos estructuras de value en detail:
    - Objeto único: {"id": "...", "display_name": "..."}
    - Array de objetos: [{"id": "...", "display_name": "..."}, ...]
    
    Args:
        entity_id: UUID de la entidad a buscar
        page: Número de página
        per_page: Elementos por página (1-100)
        sort_by: Campo por el cual ordenar
        order: Orden 'asc' o 'desc'
        search: Búsqueda adicional en el campo detail
        
    Returns:
        PaginatedCoreRegisterResponse con los registros que mencionan la entidad
        
    Example:
        GET /data-collector/entities/550e8400-e29b-41d4-a716-446655440000/mentions?page=1&per_page=10
    """
    try:
        return svc.get_registers_by_entity_mention(
            entity_id=entity_id,
            page=page,
            per_page=per_page,
            sort_by=sort_by,
            order=order,
            search=search
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/validate-unique-field", response_model=UniqueFieldValidationResponse)
def validate_unique_field(
    validation_data: UniqueFieldValidationRequest,
    svc=Depends(get_funcionalities)
):
    """
    Valida si un valor es único para un campo específico en una entidad.
    
    Args:
        validation_data: Datos de validación (entity_name, entity_field, entity_exclude_id opcional)
        
    Returns:
        UniqueFieldValidationResponse con resultado de validación
        
    Example:
        POST /data-collector/validate-unique-field
        {
            "entity_name": "farmers",
            "entity_field": {"dni": "12345678"},
            "entity_exclude_id": null
        }
        
        Response:
        {
            "exist": false
        }
        
        Si exist=true, el valor ya existe en la base de datos.
        Si exist=false, el valor está disponible (no existe).
    """
    try:
        return svc.validate_unique_field(
            entity_name=validation_data.entity_name,
            entity_field=validation_data.entity_field,
            entity_exclude_id=validation_data.entity_exclude_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/validate-unique-field-complementary", response_model=UniqueFieldComplementaryValidationResponse)
def validate_unique_field_complementary(
    validation_data: UniqueFieldComplementaryValidationRequest,
    svc=Depends(get_funcionalities)
):
    """
    Valida si un valor es único para un campo específico en un registro complementario.
    
    Args:
        validation_data: Datos de validación (entity_field, form_id)
        
    Returns:
        UniqueFieldComplementaryValidationResponse con resultado de validación
        
    Example:
        POST /data-collector/validate-unique-field-complementary
        {
            "entity_field": {"dni": "12345678"},
            "form_id": "uuid..."
        }
        
        Response:
        {
            "exist": false
        }
        
        Si exist=true, el valor ya existe en registros previos del formulario.
        Si exist=false, el valor está disponible (no existe).
    """
    try:
        return svc.validate_unique_field_complementary(
            entity_field=validation_data.entity_field,
            form_id=validation_data.form_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
