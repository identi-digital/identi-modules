# Módulo Sync - Sincronización Offline con Parse Server

Este módulo proporciona funcionalidades de sincronización offline usando Parse Server como backend. Está diseñado para ser usado por el loader y otros módulos core del sistema.

## 📁 Estructura de Carpetas

```
backend/modules/sync/
├── __init__.py                 # Exporta el módulo y registra servicios
├── src/
│   ├── __init__.py
│   ├── resources/             # Recursos (clientes y servicios)
│   │   ├── __init__.py
│   │   ├── parse_client.py           # Cliente Parse individual
│   │   ├── parse_client_factory.py   # Factory para crear clientes por BD
│   │   ├── parser_client.py          # Cliente HTTP del Parser Service
│   │   ├── sync_manager.py           # Gestor principal de sincronización
│   │   └── parser_service.py         # Orquestador del Parser Service
│   ├── functionalities.py     # Funcionalidades principales del módulo
│   ├── routes.py              # Rutas API del módulo
│   └── schemas.py             # Schemas Pydantic
└── README.md
```

## 🏗️ Arquitectura

### Cliente Parse por Base de Datos

Cada base de datos configurada en `config.yaml` puede tener su propio cliente Parse:

- **ParseClient**: Cliente individual para una base de datos específica
- **ParseClientFactory**: Factory que mantiene un singleton de clientes Parse (uno por BD)

### Cliente del Parser Service

- **ParserClient**: Cliente HTTP que consume el servicio parser (stateless)

### SyncManager

El `SyncManager` es la interfaz principal que el loader y otros módulos core usarán:

- Coordina todos los clientes Parse
- Proporciona métodos unificados para sincronización
- Se inicializa automáticamente leyendo la configuración de `config.yaml`

## ⚙️ Configuración

En `config.yaml`, cada base de datos puede tener configuración de Parse:

```yaml
databases:
  core_db:
    baseUri: 'postgresql://dbuser:dbpass@local-db:5432/agros-local'
    sync: true  # Habilitar sincronización para esta BD
    parse:
      server_url: 'http://parse-server:1337/parse'
      app_id: 'your-app-id'
      master_key: 'your-master-key'
      rest_api_key: 'your-rest-api-key'  # Opcional
```

## 💾 Persistencia en app_config

Al levantar el módulo, el `SyncManager` registra en `app_config` la ubicación del Parse Server y el `app_id`
del cliente creado. Esto permite reutilizar la configuración desde la base de datos.

Claves guardadas (por cada base de datos):

- `parser-<db>-host` → `client.server_url`
- `parser-<db>-app-id` → `client.app_id`

## 🔌 Uso desde el Loader/Core

El loader puede usar el módulo sync de la siguiente manera:

```python
from core.container import Container

# Obtener el SyncManager desde el container
container = Container()
sync_manager = container.get("sync", "modules")

# Sincronizar un objeto
result = sync_manager.sync_object(
    database_key="core_db",
    class_name="Farmers",
    object_data={
        "name": "Juan Pérez",
        "dni": "12345678"
    }
)

# Consultar objetos
objects = sync_manager.query_objects(
    database_key="core_db",
    class_name="Farmers",
    filters={"dni": "12345678"}
)

# Obtener estado de todos los clientes
status = sync_manager.get_all_clients_status()
```

## 📦 Dependencias

El módulo requiere el SDK de Parse Server para Python:

```bash
pip install parse-rest
```

O si prefieres usar el SDK oficial de Parse:

```bash
pip install parse
```

## 🚀 Inicialización

El módulo se inicializa automáticamente cuando se carga desde `config.yaml`:

1. El `Module.register_services()` registra el `SyncManager` en el container
2. El `SyncManager` lee la configuración de `config.yaml`
3. Para cada BD con `sync: true`, crea un cliente Parse
4. Los clientes se mantienen como singletons en el `ParseClientFactory`

## 🔄 Flujo de Sincronización

1. **Objeto creado/modificado en BD local** → Se dispara evento
2. **Loader/Sync detecta cambio** → Llama a `sync_manager.sync_object()`
3. **SyncManager obtiene cliente Parse** → `ParseClientFactory.get_client(database_key)`
4. **Cliente Parse sincroniza** → Envía a Parse Server
5. **Parse Server almacena** → Disponible para sincronización offline

## 📝 Notas

- Cada base de datos tiene su propio cliente Parse independiente
- Los clientes se crean bajo demanda (lazy initialization)
- El factory mantiene singletons para evitar múltiples conexiones
- El módulo puede funcionar sin Parse instalado (modo mock para desarrollo)
