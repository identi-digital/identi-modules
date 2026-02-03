import os

# Variables de entorno para S3
AWS_S3_ACCESS_KEY_ID = os.getenv("AWS_S3_ACCESS_KEY_ID", "")
AWS_S3_SECRET_ACCESS_KEY = os.getenv("AWS_S3_SECRET_ACCESS_KEY", "")
AWS_S3_REGION = os.getenv("AWS_S3_REGION", "us-east-1")
AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET", "")
AWS_S3_BASE_PATH = os.getenv("AWS_S3_BASE_PATH", "")
HOST_URL_S3 = os.getenv("HOST_URL_S3", "")
