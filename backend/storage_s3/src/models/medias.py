from dataclasses import dataclass
from sqlalchemy import Column, String, Text, TIMESTAMP, func, text, BigInteger
from sqlalchemy.dialects.postgresql import UUID

from core.models.base_class import Model

@dataclass
class MediaModel(Model):
    """ MediaModel - Almacena información de archivos en S3 """

    __tablename__ = "medias"
    __table_args__ = {"schema": "public", "extend_existing": True}
    
    id = Column(UUID(as_uuid=True),
                primary_key=True,
                server_default=text('uuid_generate_v4()'),
                unique=True,
                nullable=False)
    display_name: str = Column(String(255), nullable=False, info={"display_name": "Nombre", "description": "nombre del archivo"})
    path: str = Column(Text, nullable=False, info={"display_name": "Ruta", "description": "ruta/key del archivo en S3"})
    type: str = Column(String(100), nullable=True, info={"display_name": "Tipo", "description": "tipo MIME del archivo"})
    size: int = Column(BigInteger, nullable=True, info={"display_name": "Tamaño", "description": "tamaño del archivo en bytes"})
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.current_timestamp())
    disabled_at = Column(TIMESTAMP, nullable=True, default=None)
    
    def __init__(self, **kwargs):
        super(MediaModel, self).__init__(**kwargs)

    def __hash__(self):
        return hash(self.id)
