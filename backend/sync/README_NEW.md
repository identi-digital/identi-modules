# Módulo Sync - Capa de Integración con Parse Server

## 🎯 Visión General

El módulo `sync` es la **capa anti-corrupción** entre el backend y Parse Server. Actúa como un **adapter/facade** que traduce contratos del dominio interno a llamadas Parse REST API.

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Módulo     │  │   Módulo     │  │   Módulo     │    │
│  │   Farmers    │  │  Gathering   │  │     ...      │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                │
│                            ▼                                │
│                  ┌──────────────────┐                       │
│                  │   SyncFacade     │ ◄─── Interfaz pública│
│                  │   (facade.py)    │                       │
│                  └────────┬─────────┘                       │
│                           │                                 │
│              ┌────────────┼────────────┐                    │
│              ▼            ▼            ▼                    │
│         ┌────────┐   ┌────────┐   ┌────────┐               │
│         │Adapter │   │Adapter │   │Adapter │               │
│         │core_db │   │authx_db│   │  ...   │               │
│         └───┬────┘   └───┬────┘   └───┬────┘               │
└─────────────┼────────────┼────────────┼─────────────────────┘
              │            │            │
              │   REST API │            │
              ▼            ▼            ▼
    ┌─────────────────────────────────────────┐
    │         Parse Server (Node.js)          │
    │         Dockerizado en /sync            │
    └──────────────────┬──────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │    MongoDB     │
              └────────────────┘
```

## 📁 Estructura

```
backend/modules/sync/
├── __init__.py              # Registro del módulo
├── README.md                # Esta documentación
├── src/
│   ├── adapter.py          # SyncAdapter: Cliente HTTP para Parse REST API
│   ├── facade.py           # SyncFacade: Interfaz principal del módulo
│   ├── schemas.py          # Schemas Pydantic
│   ├── routes.py           # Rutas API del módulo
│   ├── functionalities.py  # Funcionalidades legacy
│   └── resources/          # Recursos legacy (deprecated)
│       ├── parse_client.py
│       ├── parse_client_factory.py
│       └── sync_manager.py
```

## 🔌 Uso desde el Backend

### 1. Obtener el facade

```python
from core.container import Container

container = Container()
sync_facade = container.get("sync", "modules")
```

### 2. Verificar si sync está habilitado

```python
if sync_facade.is_enabled('core_db'):
    # Sync habilitado para core_db
    ...
```

### 3. Autenticación

```python
# Login
user_data = sync_facade.login(
    username="juan",
    password="pass123",
    database_key="core_db"
)

if user_data:
    session_token = user_data.get('sessionToken')
    print(f"Usuario autenticado: {user_data['username']}")

# Registro
new_user = sync_facade.register(
    username="maria",
    password="pass456",
    email="maria@example.com",
    additional_data={"phone": "+51999888777"},
    database_key="core_db"
)
```

### 4. Sincronización de datos (Push)

```python
# Enviar un objeto a Parse Server
farmer_data = {
    "firstName": "Juan",
    "lastName": "Pérez",
    "dni": "12345678",
    "phone": "+51999888777"
}

result = sync_facade.push(
    database_key="core_db",
    class_name="Farmer",
    data=farmer_data,
    session_token=session_token  # Opcional
)

if result:
    object_id = result.get('objectId')
    created_at = result.get('createdAt')
    print(f"Farmer sincronizado: {object_id}")
```

### 5. Obtener datos (Pull)

```python
# Consultar farmers
farmers = sync_facade.pull(
    database_key="core_db",
    class_name="Farmer",
    filters={"dni": "12345678"},
    limit=10,
    skip=0,
    session_token=session_token
)

for farmer in farmers:
    print(f"Farmer: {farmer['firstName']} {farmer['lastName']}")
```

### 6. Actualizar objetos

```python
# Actualizar un farmer
updated = sync_facade.update(
    database_key="core_db",
    class_name="Farmer",
    object_id="abc123",
    data={"phone": "+51988777666"},
    session_token=session_token
)

if updated:
    print(f"Actualizado: {updated['updatedAt']}")
```

### 7. Eliminar objetos

```python
# Eliminar un farmer
deleted = sync_facade.delete(
    database_key="core_db",
    class_name="Farmer",
    object_id="abc123",
    session_token=session_token
)

if deleted:
    print("Farmer eliminado correctamente")
```

### 8. Operaciones batch

```python
# Múltiples operaciones en una sola petición
operations = [
    {
        "method": "POST",
        "path": "/parse/classes/Farmer",
        "body": {"firstName": "Pedro", "lastName": "García"}
    },
    {
        "method": "PUT",
        "path": "/parse/classes/Farmer/xyz789",
        "body": {"phone": "+51977666555"}
    }
]

results = sync_facade.batch(
    database_key="core_db",
    operations=operations,
    session_token=session_token
)
```

### 9. Cloud Functions

```python
# Ejecutar una Cloud Function
area_result = sync_facade.cloud_function(
    database_key="core_db",
    function_name="calculateFarmArea",
    params={"farmId": "xyz789"},
    session_token=session_token
)

print(f"Área calculada: {area_result['area']} {area_result['unit']}")
```

### 10. Health check

```python
# Verificar conexión con Parse Server
status = sync_facade.health_check()

for db_key, is_healthy in status.items():
    print(f"{db_key}: {'✅ Conectado' if is_healthy else '❌ Desconectado'}")
```

### 11. Consultar configuración desde app_config

```python
# El facade guarda automáticamente la configuración en app_config
# al inicializarse. Puedes consultarla así:

parse_config = sync_facade.get_parse_config_from_db('core_db')

if parse_config:
    print(f"Host: {parse_config['host']}")
    print(f"App ID: {parse_config['app_id']}")

# También puedes consultar directamente la tabla:
from core.models.core.app_config import AppConfigModel

host = db.query(AppConfigModel).filter(
    AppConfigModel.key == 'parser-core_db-host'
).first()

app_id = db.query(AppConfigModel).filter(
    AppConfigModel.key == 'parser-core_db-app-id'
).first()

print(f"Parse Host: {host.value}")
print(f"Parse App ID: {app_id.value}")
```

## 💾 Persistencia en app_config

Al inicializarse, el `SyncFacade` **guarda automáticamente** la configuración de Parse Server en la tabla `app_config`. Esto permite:

✅ **Consulta rápida**: Otros módulos pueden obtener la configuración sin parsear YAML  
✅ **Cache en BD**: Más rápido que leer archivos  
✅ **Auditoría**: Registro de qué valores se usaron  
✅ **Fallback**: Respaldo si config.yaml no está disponible  

**Claves guardadas** (por cada base de datos):

| Clave | Valor | Descripción |
|-------|-------|-------------|
| `parser-{db}-host` | `http://parse:1337/parse` | URL del Parse Server |
| `parser-{db}-app-id` | `identiAppidenti` | Application ID |

**Ejemplo**: Para `core_db` se guardan:
- `parser-core_db-host`
- `parser-core_db-app-id`

---

## ⚙️ Configuración

La configuración se lee desde `config.yaml` en la raíz del proyecto:

```yaml
sync:
  enabled: true
  
  client:
    parse_url: 'http://parse:1337/parse'
    app_id: 'identi-app-${PROJECT_NAME}'
    rest_api_key: '${PARSE_REST_API_KEY}'
    master_key: '${PARSE_MASTER_KEY}'
    timeout: 5
    connect_timeout: 3
    retries: 3
    retry_delay: 1
  
  databases:
    core_db:
      enabled: true
      mode: 'bidirectional'
      
      entities:
        - name: 'Farmer'
          table: 'farmers'
          sync_strategy: 'realtime'
        
        - name: 'Farm'
          table: 'farms'
          sync_strategy: 'realtime'
```

## 🔒 Principios Arquitectónicos

### ✅ LO QUE EL MÓDULO SYNC ES:

- **Adapter/Facade**: Capa anti-corrupción entre backend y Parse
- **Traductor**: Convierte contratos del dominio a Parse REST API
- **Interfaz única**: Punto de entrada único para comunicación con Parse
- **Gestión de conexiones**: Maneja timeouts, retries, pool de conexiones

### ❌ LO QUE EL MÓDULO SYNC NO ES:

- **NO** reimplementa lógica de Parse Server
- **NO** duplica funcionalidad de sincronización
- **NO** contiene lógica de negocio del dominio
- **NO** expone detalles de implementación de Parse

## 🚫 Restricciones Importantes

1. **El resto del backend NO debe usar directamente Parse REST API**
   - Siempre usar `SyncFacade`
   - No importar `requests` para llamar a Parse
   
2. **No filtrar conceptos de Parse al dominio**
   - Usar términos del dominio (farmer, farm)
   - No exponer objectId, createdAt, etc. si no es necesario

3. **Separación estricta de responsabilidades**
   - Parse Server = infraestructura
   - Módulo sync = adapter
   - Módulos de negocio = dominio

## 🔄 Flujo de Datos

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Módulo     │────▶│ SyncFacade   │────▶│ SyncAdapter  │
│   Farmers    │     │  (facade)    │     │  (adapter)   │
└──────────────┘     └──────────────┘     └──────────────┘
                                                   │
                                          REST API │
                                                   ▼
                                          ┌──────────────┐
                                          │Parse Server  │
                                          │   (Node.js)  │
                                          └──────────────┘
                                                   │
                                                   ▼
                                          ┌──────────────┐
                                          │   MongoDB    │
                                          └──────────────┘
```

### Ejemplo: Crear un Farmer

1. **Módulo Farmers** llama a `sync_facade.push()`
2. **SyncFacade** obtiene el adapter de `core_db`
3. **SyncAdapter** traduce a petición HTTP REST
4. **Parse Server** recibe la petición
5. **MongoDB** almacena el objeto
6. **Respuesta** se propaga de vuelta al módulo

## 📚 API Reference

Ver documentación inline en:
- `adapter.py`: Métodos del adapter HTTP
- `facade.py`: Interfaz principal del módulo

## 🧪 Testing

```python
# Verificar que sync está funcionando
from backend.modules.sync.src.facade import SyncFacade

facade = SyncFacade()

# Health check
status = facade.health_check()
assert status['core_db'] == True

# Push test
result = facade.push(
    database_key="core_db",
    class_name="TestObject",
    data={"test": True}
)
assert result is not None
assert 'objectId' in result
```

## 🐛 Troubleshooting

### Sync no funciona

1. Verificar que Parse Server está corriendo:
   ```bash
   curl http://localhost:1337/health
   ```

2. Verificar configuración en `config.yaml`:
   ```yaml
   sync:
     enabled: true  # ← Debe estar en true
   ```

3. Verificar que el adapter se creó:
   ```python
   facade.get_databases()  # Debe retornar ['core_db', ...]
   ```

### Errores de autenticación

- Verificar `app_id` y `rest_api_key` en `config.yaml`
- Verificar que coinciden con Parse Server
- Si usa `session_token`, verificar que el usuario está autenticado

### Timeouts

- Aumentar `timeout` en `config.yaml`:
  ```yaml
  sync:
    client:
      timeout: 10  # segundos
  ```

## 📄 Ver también

- [Parse Server README](/sync/README.md)
- [Configuración config.yaml](docs/CONFIG_YAML_GUIDE.md)
- [Arquitectura general](README.md)
