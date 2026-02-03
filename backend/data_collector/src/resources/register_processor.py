"""
Funciones auxiliares para procesar registros de core_registers y guardarlos en entidades.
"""
from typing import Dict, Any, List, Optional, TYPE_CHECKING
from uuid import UUID
from datetime import datetime
import sys
import importlib
from pathlib import Path
from sqlalchemy import inspect
from sqlalchemy.orm import Session
from core.models.base_class import Model as BaseModel

if TYPE_CHECKING:
    from ..schemas import DetailArray, DetailItem


def find_model_by_entity_name(entity_name: str) -> Optional[Any]:
    """
    Busca un modelo de SQLAlchemy por nombre de entidad.
    
    Usa el registro centralizado de modelos para acceso rápido.
    
    Args:
        entity_name: Nombre de la entidad (ej: 'farmers', 'farms', 'provinces')
        
    Returns:
        La clase del modelo o None si no se encuentra
    """
    try:
        # Normalizar entity_name a minúsculas para comparación
        entity_name_lower = entity_name.lower().strip()
        
        print(f"    🔍 [register_processor] Buscando modelo para entidad '{entity_name}' (normalizado: '{entity_name_lower}')...")
        
        # PRIMERO: Intentar usar el registro centralizado de modelos
        try:
            from core.models.registry import get_model_by_tablename
            model = get_model_by_tablename(entity_name_lower)
            if model:
                print(f"    ✓ [register_processor] Modelo encontrado en registro centralizado: {model.__name__} (tablename: {model.__tablename__})")
                return model
        except Exception as e:
            print(f"    ⚠️  [register_processor] Error accediendo al registro: {e}")
        
        # SEGUNDO: Si no está en el registro, buscar en sys.modules y registrar
        
        # PRIMERO: Buscar en todos los módulos registrados en sys.modules
        modules_checked = []
        for module_name, module in sys.modules.items():
            if not module_name.startswith('modules.'):
                continue
            
            # Buscar modelos en el módulo (puede estar como module.models o modules.{name}.models)
            models_module = None
            if hasattr(module, 'models'):
                models_module = getattr(module, 'models')
                modules_checked.append(module_name)
            elif module_name.endswith('.models'):
                # También buscar directamente en módulos que terminan en .models
                models_module = module
                modules_checked.append(module_name)
            
            if models_module:
                # Usar __all__ si está disponible para una búsqueda más eficiente
                if hasattr(models_module, '__all__'):
                    model_names = models_module.__all__
                else:
                    model_names = [name for name in dir(models_module) if not name.startswith('_')]
                
                for attr_name in model_names:
                    if attr_name.startswith('_'):
                        continue
                    
                    try:
                        attr = getattr(models_module, attr_name)
                        if (inspect.isclass(attr) and 
                            issubclass(attr, BaseModel) and 
                            attr is not BaseModel):
                            if hasattr(attr, '__tablename__'):
                                tablename = attr.__tablename__
                                # Registrar en el registro centralizado para futuras búsquedas
                                try:
                                    from core.models.registry import register_model
                                    register_model(attr)
                                except Exception:
                                    pass
                                
                                # Comparar normalizando ambos a minúsculas
                                if isinstance(tablename, str) and tablename.lower().strip() == entity_name_lower:
                                    print(f"    ✓ [register_processor] Modelo encontrado en sys.modules: {module_name}.{attr_name} (tablename: {tablename})")
                                    return attr
                    except Exception as e:
                        continue
        
        if modules_checked:
            print(f"    ℹ️  [register_processor] Módulos revisados en sys.modules: {', '.join(modules_checked[:5])}...")
        
        # SEGUNDO: Intentar importar módulos.models directamente (ej: modules.locations.models)
        # Esto es útil para módulos que exponen models a través de sys.modules
        try:
            backend_path = Path(__file__).parent.parent.parent.parent
            modules_path = backend_path / "modules"
            
            if modules_path.exists():
                print(f"    🔍 [register_processor] Buscando en directorio: {modules_path}")
                for module_dir in sorted(modules_path.iterdir()):  # Ordenar para consistencia
                    if not module_dir.is_dir() or module_dir.name.startswith('_'):
                        continue
                    
                    module_name = module_dir.name
                    print(f"    🔍 [register_processor] Revisando módulo: {module_name}")
                    
                    # Intentar primero con modules.{name}.models (estructura estándar)
                    models_module_paths = [
                        f"modules.{module_name}.models",  # modules.locations.models
                        f"modules.{module_name}.src.models",  # modules.locations.src.models
                    ]
                    
                    for models_module_path in models_module_paths:
                        try:
                            models_module = None
                            if models_module_path in sys.modules:
                                models_module = sys.modules[models_module_path]
                                print(f"    ✓ [register_processor] Módulo ya en sys.modules: {models_module_path}")
                            else:
                                try:
                                    print(f"    📦 [register_processor] Intentando importar: {models_module_path}")
                                    models_module = importlib.import_module(models_module_path)
                                    print(f"    ✓ [register_processor] Módulo importado exitosamente: {models_module_path}")
                                except ImportError as import_error:
                                    print(f"    ⚠️  [register_processor] Error importando {models_module_path}: {import_error}")
                                    # Intentar con backend.modules
                                    try:
                                        models_module_path_alt = models_module_path.replace("modules.", "backend.modules.")
                                        print(f"    📦 [register_processor] Intentando importar (alternativo): {models_module_path_alt}")
                                        models_module = importlib.import_module(models_module_path_alt)
                                        models_module_path = models_module_path_alt
                                        print(f"    ✓ [register_processor] Módulo importado exitosamente (alternativo): {models_module_path}")
                                    except Exception as alt_error:
                                        print(f"    ⚠️  [register_processor] Error importando alternativo {models_module_path_alt}: {alt_error}")
                                        continue
                                except Exception as import_error:
                                    print(f"    ⚠️  [register_processor] Error inesperado importando {models_module_path}: {import_error}")
                                    continue
                            
                            if not models_module:
                                continue
                            
                            # Usar __all__ si está disponible, de lo contrario usar dir()
                            if hasattr(models_module, '__all__'):
                                model_names = models_module.__all__
                                print(f"    📋 [register_processor] Usando __all__: {model_names}")
                            else:
                                model_names = [name for name in dir(models_module) if not name.startswith('_')]
                                print(f"    📋 [register_processor] Modelos encontrados en dir(): {len(model_names)} modelos")
                            
                            for attr_name in model_names:
                                if attr_name.startswith('_'):
                                    continue
                                
                                try:
                                    attr = getattr(models_module, attr_name)
                                    if (inspect.isclass(attr) and 
                                        issubclass(attr, BaseModel) and 
                                        attr is not BaseModel):
                                        if hasattr(attr, '__tablename__'):
                                            tablename = attr.__tablename__
                                            # Registrar en el registro centralizado para futuras búsquedas
                                            try:
                                                from core.models.registry import register_model
                                                register_model(attr)
                                            except Exception:
                                                pass
                                            
                                            # Comparar normalizando ambos a minúsculas
                                            if isinstance(tablename, str) and tablename.lower().strip() == entity_name_lower:
                                                print(f"    ✓ [register_processor] Modelo encontrado importando dinámicamente: {models_module_path}.{attr_name} (tablename: {tablename})")
                                                return attr
                                except Exception as e:
                                    continue
                            
                            # Si encontramos el módulo y lo revisamos, no intentar con el siguiente path
                            break
                        except Exception as e:
                            print(f"    ⚠️  [register_processor] Error procesando {models_module_path}: {e}")
                            import traceback
                            traceback.print_exc()
                            continue
        except Exception as e:
            print(f"    ⚠️  [register_processor] Error en búsqueda dinámica: {e}")
            import traceback
            traceback.print_exc()
        
        # TERCERO: Último intento - buscar directamente en archivos de modelos
        # Esto es útil cuando el módulo no está cargado en sys.modules
        try:
            backend_path = Path(__file__).parent.parent.parent.parent
            modules_path = backend_path / "modules"
            
            if modules_path.exists():
                print(f"    🔍 [register_processor] Último intento: búsqueda directa en archivos")
                for module_dir in sorted(modules_path.iterdir()):
                    if not module_dir.is_dir() or module_dir.name.startswith('_'):
                        continue
                    
                    # Buscar en src/models/
                    models_dir = module_dir / "src" / "models"
                    if not models_dir.exists():
                        continue
                    
                    # Buscar archivos .py en el directorio de modelos
                    for model_file in models_dir.glob("*.py"):
                        if model_file.name.startswith('_') or model_file.name == "__init__.py":
                            continue
                        
                        try:
                            # Construir el path del módulo
                            model_module_path = f"modules.{module_dir.name}.src.models.{model_file.stem}"
                            print(f"    📦 [register_processor] Intentando importar modelo directo: {model_module_path}")
                            
                            model_module = importlib.import_module(model_module_path)
                            
                            # Buscar clases en el módulo
                            for attr_name in dir(model_module):
                                if attr_name.startswith('_') or not attr_name.endswith('Model'):
                                    continue
                                
                                try:
                                    attr = getattr(model_module, attr_name)
                                    if (inspect.isclass(attr) and 
                                        issubclass(attr, BaseModel) and 
                                        attr is not BaseModel):
                                        if hasattr(attr, '__tablename__'):
                                            tablename = attr.__tablename__
                                            # Registrar en el registro centralizado para futuras búsquedas
                                            try:
                                                from core.models.registry import register_model
                                                register_model(attr)
                                            except Exception:
                                                pass
                                            
                                            if isinstance(tablename, str) and tablename.lower().strip() == entity_name_lower:
                                                print(f"    ✓ [register_processor] Modelo encontrado en archivo directo: {model_module_path}.{attr_name} (tablename: {tablename})")
                                                return attr
                                except Exception:
                                    continue
                        except Exception as e:
                            continue
        except Exception as e:
            print(f"    ⚠️  [register_processor] Error en búsqueda directa de archivos: {e}")
        
        print(f"    ❌ [register_processor] No se encontró modelo con __tablename__ = '{entity_name}' en ningún módulo")
        
    except Exception as e:
        print(f"⚠️  Error al buscar modelo para entidad {entity_name}: {e}")
        import traceback
        traceback.print_exc()
        return None
    
    return None


def _convert_value_by_type(value: Any, type_value: str) -> Any:
    """
    Convierte un valor según su type_value.
    
    Args:
        value: Valor a convertir
        type_value: Tipo del valor (text, number, gjson, json, boolean, media, geojson, entity)
        
    Returns:
        Valor convertido según el tipo
    """
    if value is None:
        return None
    
    type_value = type_value.lower() if isinstance(type_value, str) else type_value
    
    if type_value == "text":
        return str(value) if value is not None else None
    elif type_value == "number":
        # Intentar convertir a int o float
        try:
            if isinstance(value, (int, float)):
                return value
            if '.' in str(value):
                return float(value)
            return int(value)
        except (ValueError, TypeError):
            return value
    elif type_value == "boolean":
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.lower() in ('true', '1', 'yes', 'on')
        return bool(value)
    elif type_value in ["json", "gjson"]:
        # Si ya es un dict o list, retornarlo tal cual
        if isinstance(value, (dict, list)):
            return value
        # Si es string, intentar parsearlo como JSON
        if isinstance(value, str):
            try:
                import json
                return json.loads(value)
            except (json.JSONDecodeError, ValueError):
                return value
        return value
    elif type_value == "geojson":
        # GeoJSON es un tipo especial de JSON
        if isinstance(value, dict):
            return value
        if isinstance(value, str):
            try:
                import json
                return json.loads(value)
            except (json.JSONDecodeError, ValueError):
                return value
        return value
    elif type_value == "media":
        # Media puede ser una URL o un objeto con información del archivo
        return str(value) if value is not None else None
    elif type_value == "entity":
        # Entity puede ser un UUID o un objeto con información de la entidad
        if isinstance(value, dict):
            return value
        return str(value) if value is not None else None
    else:
        # Tipo desconocido, retornar tal cual
        return value


def _create_and_populate_intermediate_table(
    db: Session,
    source_entity_name: str,
    source_entity_id: UUID,
    relation_name: str,
    target_entity_ids: list
) -> None:
    """
    Crea dinámicamente una tabla intermedia para relaciones muchos a muchos que no están
    definidas en el modelo SQLAlchemy.
    
    Nombra la tabla como: {source_entity_name}_{relation_name}
    Estructura:
        - id: UUID PRIMARY KEY
        - {source_entity_name}_id: UUID FOREIGN KEY
        - {relation_name}_id: UUID (se infiere el tipo de la entidad destino)
        - created_at: TIMESTAMP
    
    Args:
        db: Sesión de base de datos
        source_entity_name: Nombre de la entidad origen (ej: 'farmers')
        source_entity_id: ID de la entidad origen
        relation_name: Nombre de la relación (ej: 'crops')
        target_entity_ids: Lista de IDs de entidades destino
    """
    from sqlalchemy import Table, Column, ForeignKey, text
    from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
    from datetime import datetime
    
    # Nombre de la tabla intermedia: {source}_{relation}
    table_name = f"{source_entity_name}_{relation_name}"
    
    # Columnas de la tabla intermedia
    source_column = f"{source_entity_name[:-1]}_id" if source_entity_name.endswith('s') else f"{source_entity_name}_id"
    target_column = f"{relation_name[:-1]}_id" if relation_name.endswith('s') else f"{relation_name}_id"
    
    try:
        # Verificar si la tabla ya existe
        check_table = text(f"""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = :table_name
            );
        """)
        
        result = db.execute(check_table, {"table_name": table_name}).scalar()
        
        # Si no existe, crearla
        if not result:
            create_table_sql = text(f"""
                CREATE TABLE IF NOT EXISTS {table_name} (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    {source_column} UUID NOT NULL,
                    {target_column} UUID NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW(),
                    UNIQUE({source_column}, {target_column})
                );
                
                -- Índices para mejorar performance
                CREATE INDEX IF NOT EXISTS idx_{table_name}_{source_column} 
                    ON {table_name}({source_column});
                CREATE INDEX IF NOT EXISTS idx_{table_name}_{target_column} 
                    ON {table_name}({target_column});
            """)
            
            db.execute(create_table_sql)
            db.commit()
            print(f"    ✅ Tabla intermedia '{table_name}' creada")
        
        # Limpiar relaciones existentes para esta entidad origen
        delete_existing = text(f"""
            DELETE FROM {table_name} WHERE {source_column} = :source_id;
        """)
        db.execute(delete_existing, {"source_id": str(source_entity_id)})
        
        # Insertar las nuevas relaciones
        for target_id in target_entity_ids:
            insert_relation = text(f"""
                INSERT INTO {table_name} ({source_column}, {target_column})
                VALUES (:source_id, :target_id)
                ON CONFLICT ({source_column}, {target_column}) DO NOTHING;
            """)
            db.execute(insert_relation, {
                "source_id": str(source_entity_id),
                "target_id": str(target_id)
            })
        
        db.commit()
        print(f"    ✅ {len(target_entity_ids)} relaciones insertadas en '{table_name}'")
        
    except Exception as e:
        db.rollback()
        print(f"    ❌ Error creando/poblando tabla intermedia '{table_name}': {e}")
        import traceback
        traceback.print_exc()


def extract_entity_data_from_detail(detail: "DetailArray") -> tuple[Dict[str, Any], Dict[str, list]]:
    """
    Extrae los datos de la entidad desde el array detail del registro.
    
    Detecta automáticamente si un campo es una entidad por su estructura:
    - Objeto único: {id, display_name} → Guarda solo el id (relación uno a uno/muchos)
    - Lista de objetos: [{id, display_name}, ...] → Relación muchos a muchos
    
    Args:
        detail: Array de diccionarios DetailItem con los datos recolectados
        
    Returns:
        Tupla con:
        - entity_data: Diccionario con los datos para guardar en la entidad
        - many_to_many_data: Diccionario con relaciones muchos a muchos {field_name: [entity_ids]}
    """
    entity_data = {}
    many_to_many_data = {}
    
    if not detail:
        return entity_data, many_to_many_data
    
    for item in detail:
        if isinstance(item, dict):
            name = item.get("name")
            value = item.get("value")
            type_value = item.get("type_value", "text")
            type_list_value = item.get("type_list_value", False)
            
            if not name or value is None:
                continue
            
            # Detectar si value es una entidad por su estructura
            # Caso 1: Objeto único {id, display_name} → Relación uno a uno/muchos
            if isinstance(value, dict) and 'id' in value and 'display_name' in value:
                # Es una entidad única, guardar solo el id
                try:
                    entity_data[name] = UUID(value['id'])
                except (ValueError, TypeError):
                    entity_data[name] = value['id']  # Guardar como está si no es UUID
                continue
            
            # Caso 2: Lista de objetos [{id, display_name}, ...] → Relación muchos a muchos
            if isinstance(value, list) and len(value) > 0:
                # Verificar si todos los elementos son entidades
                if all(isinstance(v, dict) and 'id' in v and 'display_name' in v for v in value):
                    # Es una lista de entidades → muchos a muchos
                    entity_ids = []
                    for entity_item in value:
                        try:
                            entity_ids.append(UUID(entity_item['id']))
                        except (ValueError, TypeError):
                            entity_ids.append(entity_item['id'])
                    
                    # Guardar para procesamiento posterior (tabla intermedia)
                    many_to_many_data[name] = entity_ids
                    continue
                
                # Si no son entidades, procesar como lista normal
                if type_list_value:
                    converted_values = []
                    for v in value:
                        converted = _convert_value_by_type(v, type_value)
                        converted_values.append(converted)
                    entity_data[name] = converted_values
                    continue
            
            # Caso 3: Valor simple (string, number, boolean, etc.)
            converted_value = _convert_value_by_type(value, type_value)
            entity_data[name] = converted_value
    
    return entity_data, many_to_many_data


def process_register_to_entity(
    register,
    db: Session,
    FormModel,
    FormPurpose
) -> Optional[UUID]:
    """
    Procesa un registro de core_registers y si proviene de un formulario ENTITY,
    guarda los datos en la tabla correspondiente.
    
    Args:
        register: Instancia de CoreRegisterModel a procesar
        db: Sesión de base de datos
        FormModel: Clase del modelo FormModel
        FormPurpose: Enum FormPurpose
        
    Returns:
        UUID del registro creado/actualizado en la entidad, o None si no se procesó
    """
    try:
        # Obtener el formulario asociado
        form = db.query(FormModel).filter(FormModel.id == register.form_id).first()
        
        if not form:
            print(f"⚠️  No se encontró formulario con id {register.form_id}")
            return None
        
        # Verificar si el formulario es de tipo ENTITY
        if form.form_purpose != FormPurpose.entity:
            # No es un formulario de entidad, no procesar
            return None
        
        # Obtener el nombre de la entidad desde el formulario
        entity_name = form.entity_name
        
        if not entity_name:
            print(f"⚠️  Formulario {form.id} tiene form_purpose=ENTITY pero no tiene entity_name")
            return None
        
        # Buscar el modelo de la entidad
        model_class = find_model_by_entity_name(entity_name)
        
        if not model_class:
            print(f"⚠️  No se encontró modelo para entidad '{entity_name}'")
            return None
        
        # Extraer los datos del detail
        # Ahora devuelve: (entity_data, many_to_many_data)
        entity_data, many_to_many_data = extract_entity_data_from_detail(register.detail or [])
        
        if not entity_data and not many_to_many_data:
            print(f"⚠️  No se encontraron datos en el detail del registro {register.id}")
            return None
        
        # Obtener los atributos del modelo para validar qué campos podemos usar
        model_inspector = inspect(model_class)
        model_columns = {col.name for col in model_inspector.columns}
        
        # Obtener relationships many-to-many del modelo
        model_relationships = {}
        if hasattr(model_inspector, 'mapper') and hasattr(model_inspector.mapper, 'relationships'):
            for rel_name, rel_obj in model_inspector.mapper.relationships.items():
                # Solo relaciones many-to-many (tienen secondary table)
                if hasattr(rel_obj, 'secondary') and rel_obj.secondary is not None:
                    model_relationships[rel_name] = rel_obj
                    print(f"    🔗 Relación many-to-many detectada en modelo: {rel_name}")
        
        # Separar datos en: columnas directas y relaciones many-to-many
        filtered_data = {}
        m2m_data = {}
        
        # Procesar datos de columnas directas (incluyendo FKs de relaciones uno a uno/muchos)
        for key, value in entity_data.items():
            # Omitir campos del sistema
            if key in ['id', 'created_at', 'updated_at', 'disabled_at']:
                continue
            
            # Si es una columna del modelo (incluye foreign keys)
            if key in model_columns:
                filtered_data[key] = value
        
        # Heredar identity_id del core_register si la tabla destino tiene ese campo
        if 'identity_id' in model_columns and register.identity_id:
            filtered_data['identity_id'] = register.identity_id
            print(f"    🔑 Heredando identity_id del core_register: {register.identity_id}")
        
        # Procesar relaciones many-to-many detectadas en el detail
        for field_name, entity_ids in many_to_many_data.items():
            # Buscar si existe una relación con ese nombre en el modelo
            if field_name in model_relationships:
                m2m_data[field_name] = entity_ids
                print(f"    🔗 Campo many-to-many '{field_name}' con {len(entity_ids)} entidades")
            else:
                # Si no existe la relación en el modelo, intentar crear tabla intermedia
                print(f"    ⚠️  Relación '{field_name}' no definida en modelo, se creará tabla intermedia")
                # Guardamos igualmente para procesamiento posterior
                m2m_data[field_name] = entity_ids
        
        if not filtered_data and not m2m_data:
            print(f"⚠️  No hay datos válidos para insertar en la entidad '{entity_name}'")
            return None
        
        # Si ya existe un entity_id, actualizar el registro existente
        if register.entity_id:
            existing_entity = db.query(model_class).filter(
                model_class.id == register.entity_id
            ).first()
            
            if existing_entity:
                # Actualizar las columnas directas
                for key, value in filtered_data.items():
                    setattr(existing_entity, key, value)
                
                # Heredar identity_id del core_register si la tabla destino tiene ese campo y aún no está establecido
                if 'identity_id' in model_columns and register.identity_id:
                    if not getattr(existing_entity, 'identity_id', None):
                        setattr(existing_entity, 'identity_id', register.identity_id)
                        print(f"    🔑 Heredando identity_id del core_register en actualización: {register.identity_id}")
                
                existing_entity.updated_at = datetime.utcnow()
                
                # Actualizar relaciones many-to-many
                pending_m2m_for_update = {}
                
                for rel_name, entity_ids in m2m_data.items():
                    if hasattr(existing_entity, rel_name) and rel_name in model_relationships:
                        # Relación definida en el modelo - usar ORM
                        rel_obj = model_relationships[rel_name]
                        target_model = rel_obj.mapper.class_
                        
                        # entity_ids es una lista de UUIDs
                        related_entities = []
                        for entity_id in entity_ids:
                            related_entity = db.query(target_model).filter(target_model.id == entity_id).first()
                            if related_entity:
                                related_entities.append(related_entity)
                            else:
                                print(f"    ⚠️  No se encontró entidad con ID {entity_id} en tabla '{target_model.__tablename__}'")
                        
                        # Reemplazar la colección de relaciones
                        setattr(existing_entity, rel_name, related_entities)
                        print(f"    ✅ Relación many-to-many '{rel_name}' actualizada con {len(related_entities)} items")
                    else:
                        # Relación NO definida en el modelo - crear tabla intermedia dinámica
                        pending_m2m_for_update[rel_name] = entity_ids
                
                db.commit()
                db.refresh(existing_entity)
                
                # Procesar relaciones muchos a muchos que requieren tabla intermedia dinámica
                for rel_name, entity_ids in pending_m2m_for_update.items():
                    _create_and_populate_intermediate_table(
                        db, entity_name, existing_entity.id, rel_name, entity_ids
                    )
                
                # Asegurar que el core_register tenga el entity_id actualizado
                register.entity_id = existing_entity.id
                register.entity_name = entity_name
                db.commit()
                db.refresh(register)  # Refrescar el registro para asegurar que los cambios se reflejen
                
                print(f"✅ Registro actualizado en entidad '{entity_name}' (ID: {existing_entity.id})")
                return existing_entity.id
        
        # Crear un nuevo registro en la entidad
        # Nota: Si no hay filtered_data pero sí hay m2m_data, igual crear la entidad vacía
        new_entity = model_class(**filtered_data) if filtered_data else model_class()
        db.add(new_entity)
        db.flush()  # Flush para obtener el ID antes de commit
        
        # Establecer relaciones many-to-many
        pending_m2m_data = {}  # Para procesar después del commit
        
        for rel_name, entity_ids in m2m_data.items():
            if hasattr(new_entity, rel_name) and rel_name in model_relationships:
                # Relación definida en el modelo - usar ORM
                rel_obj = model_relationships[rel_name]
                target_model = rel_obj.mapper.class_
                
                # entity_ids es una lista de UUIDs
                related_entities = []
                for entity_id in entity_ids:
                    related_entity = db.query(target_model).filter(target_model.id == entity_id).first()
                    if related_entity:
                        related_entities.append(related_entity)
                    else:
                        print(f"    ⚠️  No se encontró entidad con ID {entity_id} en tabla '{target_model.__tablename__}'")
                
                # Establecer la colección de relaciones
                setattr(new_entity, rel_name, related_entities)
                print(f"    ✅ Relación many-to-many '{rel_name}' establecida con {len(related_entities)} items")
            else:
                # Relación NO definida en el modelo - crear tabla intermedia dinámica
                pending_m2m_data[rel_name] = entity_ids
        
        db.commit()
        db.refresh(new_entity)
        
        # Procesar relaciones muchos a muchos que requieren tabla intermedia dinámica
        for rel_name, entity_ids in pending_m2m_data.items():
            _create_and_populate_intermediate_table(
                db, entity_name, new_entity.id, rel_name, entity_ids
            )
        
        # Actualizar el core_register con el entity_id
        register.entity_id = new_entity.id
        register.entity_name = entity_name
        db.commit()
        db.refresh(register)  # Refrescar el registro para asegurar que los cambios se reflejen
        
        print(f"✅ Registro creado en entidad '{entity_name}' (ID: {new_entity.id})")
        return new_entity.id
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error al procesar registro {register.id} a entidad: {e}")
        import traceback
        traceback.print_exc()
        return None
