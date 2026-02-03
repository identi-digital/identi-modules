# 🔐 Módulo de Autenticación (Auth)

Documentación completa del módulo de autenticación del sistema Identi Plugin System.

## 📋 Índice

- [Descripción General](#descripción-general)
- [Arquitectura](#arquitectura)
- [Modelos de Datos](#modelos-de-datos)
- [Endpoints](#endpoints)
- [Flujo de Autenticación](#flujo-de-autenticación)
- [Ejemplos de Uso](#ejemplos-de-uso)

## 🎯 Descripción General

El módulo `auth` es responsable de gestionar la autenticación de usuarios en el sistema. Implementa una arquitectura híbrida que combina:

- **Servicio de autenticación externo (AuthX)**: `https://authx2.d.identi.digital`
- **Base de datos local**: Almacena identidades, sesiones y eventos de autenticación

Este diseño permite:
- Centralizar la autenticación en AuthX
- Mantener un registro local de usuarios y sus actividades
- Sincronizar información de identidades entre sistemas
- Rastrear sesiones y eventos de autenticación

## 🏗️ Arquitectura

### Componentes Principales

```
┌─────────────────┐
│   AuthX Service │  Servicio externo de autenticación
│  (authx2.d...)  │  - Login/Logout
└────────┬────────┘  - Validación de tokens
         │           - Refresh tokens
         │
         │ HTTP API
         │
┌────────▼─────────────────────────┐
│      Auth Module (Backend)       │
│  ┌─────────────────────────────┐ │
│  │   Funcionalities            │ │  Lógica de negocio
│  │   - login()                 │ │  - Integración con AuthX
│  │   - validate_token()        │ │  - Gestión de identidades
│  │   - refresh_token()        │ │  - Gestión de sesiones
│  │   - get_me()                │ │
│  │   - logout()                │ │
│  └─────────────────────────────┘ │
│  ┌─────────────────────────────┐ │
│  │   Routes (FastAPI)          │ │  Endpoints REST
│  │   POST /auth/login          │ │
│  │   POST /auth/validate       │ │
│  │   POST /auth/refresh        │ │
│  │   GET  /auth/me             │ │
│  │   POST /auth/logout         │ │
│  └─────────────────────────────┘ │
└────────┬─────────────────────────┘
         │
         │ SQLAlchemy ORM
         │
┌────────▼─────────────────────────┐
│      Base de Datos Local         │
│  ┌─────────────────────────────┐ │
│  │   identities                │ │  Identidades de usuarios
│  │   auth_session              │ │  Sesiones activas
│  │   auth_events               │ │  Eventos de autenticación
│  └─────────────────────────────┘ │
└──────────────────────────────────┘
```

### Flujo de Datos

1. **Login**: El usuario se autentica en AuthX → Se crea/actualiza identidad local → Se crea sesión
2. **Validación**: Se valida el token con AuthX → Se busca identidad local por `sub`
3. **Refresh**: Se renueva el token usando AuthX → Se retornan nuevos tokens
4. **Get Me**: Se valida el token con AuthX → Se retorna identidad local completa
5. **Logout**: Se invalida el token en AuthX → Se cierran sesiones locales

## 📊 Modelos de Datos

### IdentityModel (identities)

Almacena información de identidades de usuarios sincronizadas desde AuthX.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único local |
| `sub` | String | Subject identifier (ID único del usuario en AuthX) |
| `name` | String (nullable) | Nombre del usuario |
| `email` | String (nullable) | Email del usuario |
| `claims` | JSONB (nullable) | Claims adicionales del token JWT |
| `created_at` | Timestamp | Fecha de creación |
| `last_seen_at` | Timestamp (nullable) | Última vez que se vio al usuario |

**Relaciones**:
- Una identidad puede tener múltiples sesiones (`auth_session`)
- Una identidad puede tener múltiples eventos (`auth_events`)

### AuthSessionModel (auth_session)

Registra sesiones de autenticación activas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `identity_id` | UUID (FK) | Referencia a la identidad |
| `client_id` | String (nullable) | ID del cliente/aplicación |
| `ip_address` | String (nullable) | Dirección IP de la sesión |
| `user_agent` | String (nullable) | User agent del cliente |
| `started_at` | Timestamp | Fecha de inicio |
| `ended_at` | Timestamp (nullable) | Fecha de fin (null = activa) |

### AuthEventModel (auth_events)

Registra eventos de autenticación para auditoría.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `identity_id` | UUID (FK) | Referencia a la identidad |
| `type` | String | Tipo de evento (login, logout, etc.) |
| `payload` | JSONB (nullable) | Datos adicionales del evento |
| `created_at` | Timestamp | Fecha del evento |

## 🔌 Endpoints

### Autenticación

#### `POST /auth/login`

Autentica un usuario con el servicio AuthX y crea/actualiza la identidad local.

**Request Body**:
```json
{
  "username": "usuario@ejemplo.com",  // Opcional
  "email": "usuario@ejemplo.com",      // Opcional
  "password": "contraseña",
  "client_id": "app-mobile"            // Opcional
}
```

**Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "identity": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "sub": "authx|123456",
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "claims": {}
  }
}
```

**Errores**:
- `401`: Credenciales inválidas
- `400`: Error en la solicitud

---

#### `POST /auth/validate`

Valida un token con el servicio AuthX.

**Request Body**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "access"  // "access" o "refresh"
}
```

**Response** (200):
```json
{
  "valid": true,
  "identity": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "sub": "authx|123456",
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "claims": {}
  },
  "claims": {},
  "expires_at": "2024-01-01T12:00:00Z"
}
```

---

#### `POST /auth/refresh`

Refresca un access token usando un refresh token.

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

---

#### `GET /auth/me`

Obtiene la identidad del usuario autenticado a partir del token en el header.

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "sub": "authx|123456",
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "claims": {},
  "created_at": "2024-01-01T10:00:00Z",
  "last_seen_at": "2024-01-01T12:00:00Z"
}
```

**Errores**:
- `401`: Token no proporcionado o inválido
- `400`: Error en la solicitud

---

#### `POST /auth/logout`

Cierra sesión en AuthX y termina las sesiones locales.

**Request Body**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "client_id": "app-mobile"  // Opcional
}
```

**Query Parameters**:
- `identity_id` (UUID, opcional): ID de la identidad para cerrar todas sus sesiones

**Response** (200):
```json
{
  "success": true,
  "message": "Sesión cerrada correctamente"
}
```

---

### Gestión de Identidades

#### `GET /auth/identities`

Lista todas las identidades paginadas.

**Query Parameters**:
- `page` (int, default: 1): Número de página
- `per_page` (int, default: 10, max: 100): Elementos por página
- `sort_by` (string, opcional): Campo por el cual ordenar
- `order` (string, default: "asc"): Orden ("asc" o "desc")
- `search` (string, opcional): Texto de búsqueda

**Response** (200):
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "sub": "authx|123456",
      "name": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "claims": {},
      "created_at": "2024-01-01T10:00:00Z",
      "last_seen_at": "2024-01-01T12:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "page_size": 10,
  "total_pages": 10
}
```

---

#### `GET /auth/identities/{identity_id}`

Obtiene una identidad por ID.

**Response** (200): `IdentityResponse`

**Errores**:
- `404`: Identidad no encontrada

---

#### `GET /auth/identities/by-sub/{sub}`

Obtiene una identidad por `sub` (subject identifier).

**Response** (200): `IdentityResponse`

**Errores**:
- `404`: Identidad no encontrada

---

#### `POST /auth/identities`

Crea una nueva identidad.

**Request Body**:
```json
{
  "sub": "authx|123456",
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "claims": {}
}
```

**Response** (201): `IdentityResponse`

---

#### `PUT /auth/identities/{identity_id}`

Actualiza una identidad existente.

**Request Body**:
```json
{
  "name": "Juan Carlos Pérez",
  "email": "juan.carlos@ejemplo.com",
  "claims": {},
  "last_seen_at": "2024-01-01T12:00:00Z"
}
```

**Response** (200): `IdentityResponse`

**Errores**:
- `404`: Identidad no encontrada

---

### Gestión de Sesiones

#### `POST /auth/sessions`

Crea una nueva sesión de autenticación.

**Request Body**:
```json
{
  "identity_id": "550e8400-e29b-41d4-a716-446655440000",
  "client_id": "app-mobile",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "started_at": "2024-01-01T12:00:00Z"
}
```

**Response** (201): `AuthSessionResponse`

---

#### `POST /auth/sessions/{session_id}/end`

Termina una sesión de autenticación.

**Response** (200): `true`

**Errores**:
- `404`: Sesión no encontrada o ya terminada

---

#### `GET /auth/sessions/active/{identity_id}`

Obtiene todas las sesiones activas de una identidad.

**Response** (200): `List[AuthSessionResponse]`

---

### Gestión de Eventos

#### `POST /auth/events`

Crea un nuevo evento de autenticación.

**Request Body**:
```json
{
  "identity_id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "login",
  "payload": {
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0..."
  }
}
```

**Response** (201): `AuthEventResponse`

---

#### `GET /auth/events`

Lista eventos de autenticación.

**Query Parameters**:
- `identity_id` (UUID, opcional): Filtrar por identidad
- `page` (int, default: 1): Número de página
- `per_page` (int, default: 10, max: 100): Elementos por página
- `sort_by` (string, opcional): Campo por el cual ordenar
- `order` (string, default: "asc"): Orden ("asc" o "desc")
- `search` (string, opcional): Texto de búsqueda

**Response** (200): `PaginatedAuthEventResponse`

---

## 🔄 Flujo de Autenticación

### Flujo Completo

```
1. Usuario → POST /auth/login
   └─> AuthX valida credenciales
   └─> Se crea/actualiza identidad local
   └─> Se crea sesión
   └─> Se retornan tokens

2. Cliente → GET /auth/me (con token)
   └─> Se valida token con AuthX
   └─> Se busca identidad local por sub
   └─> Se actualiza last_seen_at
   └─> Se retorna identidad

3. Token expira → POST /auth/refresh
   └─> AuthX valida refresh token
   └─> Se retornan nuevos tokens

4. Usuario → POST /auth/logout
   └─> AuthX invalida token
   └─> Se cierran sesiones locales
   └─> Se crea evento de logout
```

### Flujo para Aplicación Móvil

Ver [MOBILE_APP_AUTH_GUIDE.md](../../../docs/MOBILE_APP_AUTH_GUIDE.md) para detalles completos.

## 💡 Ejemplos de Uso

### Ejemplo 1: Login y Obtener Identidad

```python
import requests

# 1. Login
login_response = requests.post(
    "http://localhost:8000/auth/login",
    json={
        "email": "usuario@ejemplo.com",
        "password": "contraseña",
        "client_id": "app-mobile"
    }
)

tokens = login_response.json()
access_token = tokens["access_token"]

# 2. Obtener identidad
me_response = requests.get(
    "http://localhost:8000/auth/me",
    headers={"Authorization": f"Bearer {access_token}"}
)

identity = me_response.json()
print(f"Usuario: {identity['name']} ({identity['email']})")
```

### Ejemplo 2: Validar Token

```python
import requests

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

response = requests.post(
    "http://localhost:8000/auth/validate",
    json={
        "token": token,
        "token_type": "access"
    }
)

validation = response.json()
if validation["valid"]:
    print(f"Token válido para: {validation['identity']['email']}")
else:
    print("Token inválido o expirado")
```

### Ejemplo 3: Refresh Token

```python
import requests

refresh_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

response = requests.post(
    "http://localhost:8000/auth/refresh",
    json={"refresh_token": refresh_token}
)

new_tokens = response.json()
print(f"Nuevo access token: {new_tokens['access_token']}")
print(f"Expira en: {new_tokens['expires_in']} segundos")
```

### Ejemplo 4: Logout

```python
import requests

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

response = requests.post(
    "http://localhost:8000/auth/logout",
    json={
        "token": token,
        "client_id": "app-mobile"
    }
)

result = response.json()
print(result["message"])  # "Sesión cerrada correctamente"
```

## 🔒 Seguridad

### Middleware de Autenticación Automático

El sistema aplica automáticamente un middleware de autenticación a todas las rutas de todos los módulos, excepto cuando se especifica lo contrario.

#### Configuración a Nivel de Módulo

Para deshabilitar la autenticación en todo un módulo, agrega `auth: false` en `config.yaml`:

```yaml
backend:
  modules:
    - name: 'hello_world'
      auth: false  # Todas las rutas de este módulo serán públicas
      database: 'core_db'
```

#### Configuración a Nivel de Ruta

Para deshabilitar la autenticación en una ruta específica, usa el decorador `@public_route`:

```python
from modules.auth.src.dependencies import public_route

@router.get("/public-endpoint")
@public_route
def public_endpoint():
    """Esta ruta no requiere autenticación"""
    return {"message": "Público"}
```

#### Rutas Públicas por Defecto

Las siguientes rutas son públicas automáticamente:
- `/auth/login`
- `/auth/validate`
- `/auth/refresh`
- `/docs`
- `/openapi.json`
- `/redoc`

#### Cómo Funciona

1. **Aplicación Automática**: Cuando se carga un módulo, el sistema automáticamente aplica el dependency `verify_token` a todas sus rutas.

2. **Verificación de Token**: El middleware extrae el token del header `Authorization: Bearer <token>` y lo valida con AuthX.

3. **Identidad del Usuario**: Si el token es válido, la identidad del usuario se hace disponible en el request y puede ser accedida usando `Depends(get_current_identity)`.

4. **Rutas Públicas**: Las rutas marcadas con `@public_route` no requieren autenticación.

#### Ejemplo de Uso en Rutas Protegidas

```python
from modules.auth.src.dependencies import get_current_identity
from modules.auth.schemas import IdentityResponse

@router.get("/protected")
def protected_endpoint(identity: IdentityResponse = Depends(get_current_identity)):
    """
    Esta ruta requiere autenticación automáticamente.
    No necesitas hacer nada especial, el middleware se aplica automáticamente.
    """
    return {
        "message": f"Hola, {identity.username}!",
        "user_id": str(identity.id)
    }
```

#### Ejemplo Completo: Módulo con Rutas Públicas y Protegidas

```python
from modules.auth.src.dependencies import public_route, get_current_identity
from modules.auth.schemas import IdentityResponse

@router.get("/public")
@public_route  # Esta ruta es pública
def public_endpoint():
    return {"message": "Público"}

@router.get("/protected")
# Sin @public_route → Requiere autenticación automáticamente
def protected_endpoint(identity: IdentityResponse = Depends(get_current_identity)):
    return {"user_id": str(identity.id)}
```

### Consideraciones

1. **Tokens**: Los tokens son gestionados por AuthX. El módulo auth solo los valida y almacena referencias locales.

2. **HTTPS**: Se recomienda usar HTTPS en producción para proteger los tokens en tránsito.

3. **Validación**: Todos los tokens se validan con AuthX antes de permitir acceso a recursos protegidos.

4. **Sesiones**: Las sesiones locales se pueden usar para auditoría y gestión, pero la autorización real depende de AuthX.

5. **Refresh Tokens**: Los refresh tokens deben almacenarse de forma segura en el cliente (ej: Keychain en iOS, Keystore en Android).

## 🛠️ Configuración

El módulo auth se configura automáticamente al registrarse. La URL del servicio AuthX está hardcodeada como `https://authx2.d.identi.digital`, pero puede ser configurada desde `config.yaml` en el futuro.

## 📝 Notas

- El campo `sub` es el identificador único del usuario en AuthX y se usa para sincronizar identidades.
- `last_seen_at` se actualiza automáticamente en cada llamada a `get_me()` o `validate_token()`.
- Las sesiones se crean automáticamente en el login y se pueden cerrar manualmente o mediante logout.
- Los eventos de autenticación se registran automáticamente para auditoría.
