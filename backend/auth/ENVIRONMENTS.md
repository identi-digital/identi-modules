# Variables de Entorno del Módulo Auth

Este documento describe las variables de entorno utilizadas por el módulo de autenticación.

## 📋 Variables Disponibles

### Requeridas

- **`AUTHX_BASE_URL`**: URL base del servicio AuthX
  - **Default**: `https://authx2.d.identi.digital`
  - **Ejemplo**: `export AUTHX_BASE_URL=https://authx2.d.identi.digital`

### Opcionales

- **`TENANT`**: ID del tenant/organización
  - **Default**: `None`
  - **Ejemplo**: `export TENANT=org-123`

- **`CLIENT_ID`**: ID del cliente OAuth2
  - **Default**: `None`
  - **Ejemplo**: `export CLIENT_ID=my-client-id`
  - **Nota**: Si no se proporciona en el request, se usará este valor por defecto

- **`CLIENT_SECRET`**: Secret del cliente OAuth2
  - **Default**: `None`
  - **Ejemplo**: `export CLIENT_SECRET=my-client-secret`

- **`APP_CONTEXT_ID`**: ID del contexto de la aplicación
  - **Default**: `None`
  - **Ejemplo**: `export APP_CONTEXT_ID=app-context-123`

## 🔧 Uso en el Código

### Importar la clase de entorno

```python
from .environments import AuthEnvironment
```

### Acceder a variables

```python
# Obtener URL base de AuthX
authx_url = AuthEnvironment.get_authx_url()

# Construir URL de un endpoint
login_url = AuthEnvironment.get_authx_api_url("api/auth/login")

# Acceder a variables directamente
client_id = AuthEnvironment.CLIENT_ID
tenant = AuthEnvironment.TENANT
```

### Validar configuración

```python
missing = AuthEnvironment.validate()
if missing:
    print(f"Variables faltantes: {missing}")
```

### Obtener resumen de configuración

```python
config = AuthEnvironment.get_config_summary()
print(config)
```

## 🐳 Configuración en Docker

En `docker-compose.yaml`:

```yaml
services:
  backend:
    environment:
      - AUTHX_BASE_URL=https://authx2.d.identi.digital
      - CLIENT_ID=your-client-id
      - CLIENT_SECRET=your-client-secret
      - TENANT=your-tenant-id
      - APP_CONTEXT_ID=your-app-context-id
```

## 📝 Notas

- Todas las variables de entorno se leen al importar el módulo
- Los valores por defecto se usan si las variables no están definidas
- Las variables sensibles (CLIENT_SECRET) no se muestran en logs
- El módulo valida las variables requeridas al inicializarse
