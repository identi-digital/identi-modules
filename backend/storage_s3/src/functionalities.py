from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from .models.medias import MediaModel
from .schemas import MediaCreate, MediaUpdate, MediaResponse, PaginatedMediaResponse

class Funcionalities:
    def __init__(self, container, database_key: str = "core_db"):
        self.container = container
        self.database_key = database_key

    def _get_db(self) -> Session:
        """Obtiene la sesión de base de datos del contenedor"""
        return self.container.get(self.database_key, "databases")

    def create_media(self, media_data: MediaCreate) -> MediaResponse:
        """
        Registra un nuevo media en la base de datos.
        
        Args:
            media_data: Datos del media (key, display_name, type, size)
            
        Returns:
            MediaResponse con el media creado
        """
        db = self._get_db()
        
        try:
            # Crear nuevo media
            media = MediaModel(
                display_name=media_data.display_name,
                path=media_data.key,  # key se guarda como path
                type=media_data.type,
                size=media_data.size
            )
            
            db.add(media)
            db.commit()
            db.refresh(media)
            
            return MediaResponse.model_validate(media)
            
        except Exception as e:
            db.rollback()
            print(f"❌ Error al crear media: {e}")
            raise e

    def get_media_by_id(self, media_id: UUID) -> Optional[MediaResponse]:
        """
        Obtiene un media por su ID.
        
        Args:
            media_id: UUID del media
            
        Returns:
            MediaResponse si se encuentra, None si no existe
        """
        db = self._get_db()
        
        media = db.query(MediaModel).filter(
            MediaModel.id == media_id,
            MediaModel.disabled_at.is_(None)
        ).first()
        
        if not media:
            return None
            
        return MediaResponse.model_validate(media)

    def get_medias_paginated(
        self, 
        page: int = 1, 
        per_page: int = 10,
        sort_by: Optional[str] = None,
        order: Optional[str] = "desc",
        search: str = ""
    ) -> PaginatedMediaResponse:
        """
        Obtiene una lista paginada de medias.
        
        Args:
            page: Número de página
            per_page: Elementos por página
            sort_by: Campo por el cual ordenar
            order: Orden 'asc' o 'desc'
            search: Texto de búsqueda
            
        Returns:
            PaginatedMediaResponse con la lista de medias
        """
        db = self._get_db()
        
        query = db.query(MediaModel).filter(
            MediaModel.disabled_at.is_(None)
        )
        
        # Aplicar búsqueda si se proporciona
        if search:
            query = query.filter(
                (MediaModel.display_name.isnot(None) & MediaModel.display_name.ilike(f"%{search}%")) |
                (MediaModel.path.isnot(None) & MediaModel.path.ilike(f"%{search}%")) |
                (MediaModel.type.isnot(None) & MediaModel.type.ilike(f"%{search}%"))
            )
        
        # Aplicar ordenamiento
        if sort_by:
            sort_column = getattr(MediaModel, sort_by, None)
            if sort_column is not None:
                if order and order.lower() == "desc":
                    query = query.order_by(sort_column.desc())
                else:
                    query = query.order_by(sort_column.asc())
        else:
            # Ordenamiento por defecto: más recientes primero
            query = query.order_by(MediaModel.created_at.desc())
        
        # Contar total
        total = query.count()
        offset = (page - 1) * per_page
        total_pages = (total + per_page - 1) // per_page
        
        # Obtener resultados paginados
        medias = query.offset(offset).limit(per_page).all()
        
        # Convertir a response
        media_responses = [MediaResponse.model_validate(media) for media in medias]
        
        return PaginatedMediaResponse(
            items=media_responses,
            total=total,
            page=page,
            page_size=per_page,
            total_pages=total_pages
        )

    def update_media(self, media_id: UUID, media_data: MediaUpdate) -> Optional[MediaResponse]:
        """
        Actualiza un media existente.
        
        Args:
            media_id: UUID del media
            media_data: Datos a actualizar
            
        Returns:
            MediaResponse actualizado o None si no existe
        """
        db = self._get_db()
        
        try:
            media = db.query(MediaModel).filter(
                MediaModel.id == media_id,
                MediaModel.disabled_at.is_(None)
            ).first()
            
            if not media:
                return None
            
            # Actualizar solo los campos proporcionados
            update_data = media_data.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(media, key, value)
            
            db.commit()
            db.refresh(media)
            
            return MediaResponse.model_validate(media)
            
        except Exception as e:
            db.rollback()
            print(f"❌ Error al actualizar media: {e}")
            raise e

    def delete_media(self, media_id: UUID) -> bool:
        """
        Elimina (deshabilita) un media.
        
        Args:
            media_id: UUID del media
            
        Returns:
            True si se eliminó correctamente, False si no existe
        """
        db = self._get_db()
        
        try:
            media = db.query(MediaModel).filter(
                MediaModel.id == media_id,
                MediaModel.disabled_at.is_(None)
            ).first()
            
            if not media:
                return False
            
            from datetime import datetime
            media.disabled_at = datetime.now()
            
            db.commit()
            return True
            
        except Exception as e:
            db.rollback()
            print(f"❌ Error al eliminar media: {e}")
            raise e
