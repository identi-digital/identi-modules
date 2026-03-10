"""
Storage S3 Manager - Implementaci??n de storage para AWS S3

Este m??dulo implementa la interfaz est??ndar StorageInterface para AWS S3.
"""
import sys
from pathlib import Path
from typing import Optional
from botocore.config import Config as ConfigBotoCore
from botocore.exceptions import ClientError
import boto3
from uuid import uuid4

# Agregar backend al path para importar la interfaz
current_file = Path(__file__).resolve()
backend_path = current_file.parent.parent.parent.parent
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from core.storage_interface import StorageInterface
# Importar environment del módulo storage_s3 usando importación relativa
from ..environment import (
    AWS_S3_ACCESS_KEY_ID,
    AWS_S3_SECRET_ACCESS_KEY,
    AWS_S3_REGION,
    AWS_S3_BUCKET,
    AWS_S3_BASE_PATH,
    HOST_URL_S3
)


class StorageS3Manager(StorageInterface):
    """
    Gestor de Object Storage para AWS S3.
    
    Implementa la interfaz est??ndar StorageInterface.
    Las credenciales se leen desde variables de entorno.
    """
    
    def __init__(self):
        """Inicializa el StorageS3Manager con las credenciales desde environment.py"""
        self.AWS_ACCESS_KEY_ID = AWS_S3_ACCESS_KEY_ID
        self.AWS_SECRET_ACCESS_KEY = AWS_S3_SECRET_ACCESS_KEY
        self.AWS_REGION = AWS_S3_REGION
        self.AWS_BUCKET = AWS_S3_BUCKET
        self.AWS_S3_BASE_PATH = AWS_S3_BASE_PATH.strip('/') if AWS_S3_BASE_PATH else ""
        self.HOST_URL_S3 = HOST_URL_S3
        
        if not self.AWS_ACCESS_KEY_ID or not self.AWS_SECRET_ACCESS_KEY:
            raise ValueError(
                "Credenciales de S3 incompletas. Se requieren AWS_S3_ACCESS_KEY_ID y AWS_S3_SECRET_ACCESS_KEY"
            )
        
        if not self.AWS_BUCKET:
            raise ValueError("Se requiere AWS_S3_BUCKET en las variables de entorno")
        
        self.client = None
        self._initialize_client()
    
    def _get_full_path(self, object_name: str) -> str:
        """
        Construye la ruta completa del objeto agregando el AWS_S3_BASE_PATH como prefijo.
        
        Args:
            object_name: Nombre del objeto sin el prefijo base
            
        Returns:
            Ruta completa con el prefijo AWS_S3_BASE_PATH si está configurado
        """
        name = object_name.replace('/', '')
        id = uuid4().hex
        name = f"{id}-{name}"
        key_url = name.lstrip('/')
        if self.AWS_S3_BASE_PATH:
            # Asegurar que no haya dobles barras
            base_path = self.AWS_S3_BASE_PATH.rstrip('/')
            return f"{base_path}/{key_url}" if base_path else key_url
        return key_url
    
    def config_s3(self):
        """Configuraci??n de S3"""
        return ConfigBotoCore(
            retries=dict(
                max_attempts=10
            ),
            region_name=self.AWS_REGION
        )
    
    def get_s3_client(self):
        """Conexi??n de S3 por m??todo Cliente"""
        if self.client is None:
            self.client = boto3.client(
                's3',
                region_name=self.AWS_REGION,
                aws_access_key_id=self.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=self.AWS_SECRET_ACCESS_KEY,
                endpoint_url=self.HOST_URL_S3 if self.HOST_URL_S3 else None,
                config=self.config_s3()
            )
        return self.client
    
    def _initialize_client(self):
        """Inicializa el cliente de S3"""
        self.get_s3_client()
    
    def upload_file(
        self,
        file_path: str,
        object_name: str,
        bucket: Optional[str] = None,
        **kwargs
    ) -> str:
        """Sube un archivo al storage S3"""
        file_path_obj = Path(file_path)
        if not file_path_obj.exists():
            raise FileNotFoundError(f"El archivo no existe: {file_path}")
        
        bucket = bucket or self.AWS_BUCKET
        key_url = self._get_full_path(object_name)
        
        try:
            with open(file_path, 'rb') as file:
                self.get_s3_client().put_object(
                    Body=file,
                    Bucket=bucket,
                    Key=key_url
                )
            return f"s3://{bucket}/{key_url}"
        except ClientError as e:
            raise RuntimeError(f"Error al subir archivo: {e}") from e
    
    def download_file(
        self,
        object_name: str,
        file_path: str,
        bucket: Optional[str] = None,
        **kwargs
    ) -> str:
        """Descarga un archivo del storage S3"""
        bucket = bucket or self.AWS_BUCKET
        key_url = self._get_full_path(object_name)
        
        try:
            self.get_s3_client().download_file(bucket, key_url, file_path, **kwargs)
            return file_path
        except ClientError as e:
            raise RuntimeError(f"Error al descargar archivo: {e}") from e
    
    def delete_file(
        self,
        object_name: str,
        bucket: Optional[str] = None,
        **kwargs
    ) -> bool:
        """Elimina un archivo del storage S3"""
        bucket = bucket or self.AWS_BUCKET
        key_url = self._get_full_path(object_name)
        
        try:
            self.get_s3_client().delete_object(Bucket=bucket, Key=key_url, **kwargs)
            return True
        except ClientError as e:
            raise RuntimeError(f"Error al eliminar archivo: {e}") from e
    
    def post_presigned_url(
        self,
        file_name: str,
        expiration: int = 3600,
        bucket: Optional[str] = None,
        file_type: Optional[str] = None,
    ) -> str:
        """Genera una URL pre-firmada para acceso temporal al archivo
        
        Args:
            file_name: Ruta y nombre del archivo
            expiration: Tiempo de expiraci??n en segundos
            is_download: Si es True, genera URL para descargar (GET), si es False para subir (PUT)
            bucket: Bucket a usar (opcional)
        """
        bucket = bucket or self.AWS_BUCKET
        key_url = self._get_full_path(file_name)
        
        try:
            # URL para subir
            url = self.get_s3_client().generate_presigned_url(
                ClientMethod='put_object',
                Params={
                    'Bucket': bucket,
                    'Key': key_url,
                    'ContentType': file_type
                },
                ExpiresIn=expiration
            )
            return url, key_url
        except ClientError as e:
            raise RuntimeError(f"Error al generar URL pre-firmada: {e}") from e

    def get_presigned_url(
            self,
            key: str,
            expiration: int = 3600,
            is_download: bool = True,
            bucket: Optional[str] = None
        ) -> str:
            """Genera una URL pre-firmada para acceso temporal al archivo
            
            Args:
                object_name: Ruta y nombre del archivo
                expiration: Tiempo de expiraci??n en segundos
                is_download: Si es True, genera URL para descargar (GET), si es False para subir (PUT)
                bucket: Bucket a usar (opcional)
            """
            bucket = bucket or self.AWS_BUCKET
            
            try:
                # URL para descargar
                if is_download:
                    content_disposition = "attachment; filename=" + key.split('/')[-1]
                else:
                    content_disposition = "inline; filename=" + key.split('/')[-1]
            
                url = self.get_s3_client().generate_presigned_url(
                    ClientMethod="get_object",
                    Params={
                        'Bucket': bucket,
                        'Key': key,
                        'ResponseContentDisposition': content_disposition
                    },
                    ExpiresIn=expiration
                )
           
                return url
            except ClientError as e:
                raise RuntimeError(f"Error al generar URL pre-firmada: {e}") from e
