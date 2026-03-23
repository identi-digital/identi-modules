# Módulo sync (backend)

APIs del backend para integrarse con el **servicio sync** (Parse Server): actualizar schemas y **subir, actualizar y traer** datos en Parse.

## Variables de entorno

| Variable | Descripción |
|---------|-------------|
| `SYNC_SERVICE_URL` | URL base del servicio sync (ej. `http://sync:1337` o `http://localhost:1337`) |
| `SYNC_SCHEMA_API_SECRET` | Secret para `PUT /api/schema/classes` en el sync (mismo que en el sync) |
| `PARSE_MASTER_KEY` | Master key de Parse (para llamar a la API Parse desde el backend) |
| `PARSE_APP_ID` o `APP_ID` | App ID de Parse |
| `SYNC_HTTP_TIMEOUT` | Timeout en segundos para peticiones HTTP al sync (default: 30) |

## Rutas (integración con la API Parse del sync)

### Schema (clases)

- **GET /sync/schema/classes** – Lista clases registradas en sync.
- **PUT /sync/schema/classes** – Actualiza clases en sync (body: `{ "classNames": ["ClaseA", "ClaseB"] }`). Útil tras migraciones.

### Traer datos (Parse)

- **GET /sync/parse/classes/{class_name}** – Lista objetos de una clase. Query: `limit`, `skip`, `where` (JSON).
- **GET /sync/parse/classes/{class_name}/{object_id}** – Obtiene un objeto por `objectId`.

### Subir datos (Parse)

- **POST /sync/parse/classes/{class_name}** – Crea **un** objeto (body: campos del objeto).
- **POST /sync/parse/classes/{class_name}/bulk** – Sube **varios** objetos (body: lista de objetos, máx. 100).

### Actualizar / eliminar (Parse)

- **PUT /sync/parse/classes/{class_name}/{object_id}** – Actualiza un objeto (body: campos a actualizar).
- **DELETE /sync/parse/classes/{class_name}/{object_id}** – Elimina un objeto.

Las rutas pasan por el middleware de autenticación del backend (salvo que el módulo sea público en config).

## Ejemplos

**Traer lista (con filtro):**
```http
GET /sync/parse/classes/PersonEntity?limit=20&skip=0&where={"name":"Juan"}
```

**Traer uno:**
```http
GET /sync/parse/classes/PersonEntity/abc123objectId
```

**Subir uno:**
```http
POST /sync/parse/classes/PersonEntity
Content-Type: application/json

{"name": "Juan", "email": "juan@example.com"}
```

**Subir varios (bulk):**
```http
POST /sync/parse/classes/PersonEntity/bulk
Content-Type: application/json

[
  {"name": "Juan", "email": "juan@example.com"},
  {"name": "María", "email": "maria@example.com"}
]
```

**Actualizar:**
```http
PUT /sync/parse/classes/PersonEntity/abc123objectId
Content-Type: application/json

{"name": "Juan Pérez", "updated": true}
```
