import os

# Variables de entorno para Auth
AUTHX_BASE_URL = os.getenv("AUTHX_BASE_URL", "https://authx2.d.identi.digital")
AUTH_APP_ID = os.getenv("AUTH_APP_ID", None)
AUTH_APP_ACCESS_TOKEN = os.getenv("AUTH_APP_ACCESS_TOKEN", None)
AUTH_APP_CONTEXT_ID = os.getenv("AUTH_APP_CONTEXT_ID", None)
TENANT = os.getenv("AUTH_TENANT", None)
