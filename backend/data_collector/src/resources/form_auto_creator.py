"""
Funciones para crear formularios automáticamente basados en las entidades definidas en config.yaml.

Estas funciones son específicas del módulo data_collector y se usan para generar
formularios automáticamente desde modelos SQLAlchemy.
"""
import sys
import importlib
import inspect as py_inspect  # Renombrar para evitar conflicto con sqlalchemy.inspect
from pathlib import Path
from typing import Dict, Any, List, Optional
from uuid import uuid4
from sqlalchemy import inspect as sqlalchemy_inspect
import json


def find_model_by_entity_name(entity_name: str, container) -> Optional[Any]:
    """
    Busca un modelo de SQLAlchemy por nombre de entidad.
    
    Busca en todos los módulos cargados el modelo que tenga __tablename__ = entity_name
    
    Args:
        entity_name: Nombre de la entidad (ej: 'farmers', 'farms')
        container: Container con acceso a las bases de datos
        
    Returns:
        La clase del modelo o None si no se encuentra
    """
    try:
        from core.models.base_class import Model as BaseModel
        
        # Normalizar entity_name a minúsculas para comparación
        entity_name_lower = entity_name.lower()
        
        print(f"    🔍 Buscando modelo para entidad '{entity_name}' (normalizado: '{entity_name_lower}')...")
        
        # PRIMERO: Buscar en todos los módulos registrados en sys.modules
        modules_checked = []
        for module_name, module in sys.modules.items():
            if not module_name.startswith('modules.'):
                continue
            
            # Buscar modelos en el módulo
            if hasattr(module, 'models'):
                models_module = getattr(module, 'models')
                modules_checked.append(module_name)
                for attr_name in dir(models_module):
                    # Omitir atributos privados y especiales
                    if attr_name.startswith('_'):
                        continue
                    
                    try:
                        attr = getattr(models_module, attr_name)
                        # Verificar que sea una clase y que herede de BaseModel
                        if (py_inspect.isclass(attr) and 
                            issubclass(attr, BaseModel) and 
                            attr is not BaseModel):
                            # Verificar que tenga __tablename__ y que coincida
                            if hasattr(attr, '__tablename__'):
                                tablename = attr.__tablename__
                                if isinstance(tablename, str) and tablename.lower() == entity_name_lower:
                                    print(f"    ✓ Modelo encontrado en sys.modules: {module_name}.models.{attr_name} (tablename: {tablename})")
                                    return attr
                    except Exception as e:
                        continue
        
        if modules_checked:
            print(f"    ℹ️  Módulos revisados en sys.modules: {', '.join(modules_checked)}")
        
        # SEGUNDO: Si no se encuentra, intentar importar módulos dinámicamente
        # Buscar en backend/modules/
        # __file__ está en: backend/modules/data_collector/src/resources/form_auto_creator.py
        # Necesitamos llegar a: backend/modules/
        current_file = Path(__file__).resolve()
        # Buscar el directorio "modules" en el path del archivo usando parts
        parts = list(current_file.parts)
        try:
            modules_index = parts.index("modules")
            # Crear path hasta "modules" inclusive (sin incluir lo que viene después)
            modules_path = Path(*parts[:modules_index + 1])
            print(f"    📂 Path calculado para modules: {modules_path}")
        except ValueError:
            # Si no encontramos "modules" en el path, usar cálculo relativo
            # current_file.parent = resources/
            # current_file.parent.parent = src/
            # current_file.parent.parent.parent = data_collector/
            # current_file.parent.parent.parent.parent = modules/
            modules_path = current_file.parent.parent.parent.parent
            print(f"    📂 Path calculado (fallback): {modules_path}")
        
        if not modules_path.exists():
            print(f"    ⚠️  Directorio modules no existe: {modules_path}")
            print(f"    🔍 Partes del path actual: {current_file.parts}")
        else:
            print(f"    🔍 Buscando en directorio: {modules_path}")
            modules_imported = []
            for module_dir in modules_path.iterdir():
                if not module_dir.is_dir() or module_dir.name.startswith('_'):
                    continue
                
                try:
                    # Intentar importar el módulo de modelos
                    models_module_path = f"modules.{module_dir.name}.src.models"
                    models_module = None
                    
                    # Intentar importar si no está en sys.modules
                    if models_module_path not in sys.modules:
                        try:
                            print(f"    📦 Intentando importar: {models_module_path}")
                            models_module = importlib.import_module(models_module_path)
                            modules_imported.append(models_module_path)
                        except Exception as import_error:
                            # Si falla, intentar con backend.modules
                            try:
                                models_module_path_alt = f"backend.modules.{module_dir.name}.src.models"
                                print(f"    📦 Intentando importar (alternativo): {models_module_path_alt}")
                                models_module = importlib.import_module(models_module_path_alt)
                                models_module_path = models_module_path_alt
                                modules_imported.append(models_module_path)
                            except Exception as alt_error:
                                print(f"    ⚠️  No se pudo importar {models_module_path}: {import_error}")
                                continue
                    else:
                        models_module = sys.modules[models_module_path]
                        modules_imported.append(f"{models_module_path} (ya en sys.modules)")
                    
                    if not models_module:
                        continue
                    
                    # Buscar modelos en el módulo usando __all__ si está disponible
                    model_names = []
                    if hasattr(models_module, '__all__'):
                        model_names = models_module.__all__
                        print(f"    📋 Usando __all__ de {models_module_path}: {model_names}")
                    else:
                        # Si no hay __all__, buscar en dir()
                        model_names = [name for name in dir(models_module) if not name.startswith('_')]
                        print(f"    📋 Buscando en dir() de {models_module_path}: {len(model_names)} atributos")
                    
                    for attr_name in model_names:
                        try:
                            attr = getattr(models_module, attr_name)
                            if (py_inspect.isclass(attr) and 
                                issubclass(attr, BaseModel) and 
                                attr is not BaseModel):
                                if hasattr(attr, '__tablename__'):
                                    tablename = attr.__tablename__
                                    print(f"    🔎 Revisando {attr_name}: __tablename__ = '{tablename}'")
                                    if isinstance(tablename, str) and tablename.lower() == entity_name_lower:
                                        print(f"    ✓ Modelo encontrado importando dinámicamente: {models_module_path}.{attr_name} (tablename: {tablename})")
                                        return attr
                        except Exception as e:
                            print(f"    ⚠️  Error revisando {attr_name}: {e}")
                            continue
                except Exception as e:
                    print(f"    ⚠️  Error procesando módulo {module_dir.name}: {e}")
                    continue
            
            if modules_imported:
                print(f"    ℹ️  Módulos importados dinámicamente: {', '.join(modules_imported)}")
        
        print(f"    ❌ No se encontró modelo con __tablename__ = '{entity_name}' en ningún módulo")
        
    except Exception as e:
        print(f"⚠️  Error al buscar modelo para entidad {entity_name}: {e}")
        import traceback
        traceback.print_exc()
        return None
    
    return None


def get_model_relationships(model_class) -> List[Dict[str, Any]]:
    """
    Extrae las relaciones many-to-many de un modelo SQLAlchemy.
    
    Las relaciones many-to-many se identifican por tener una tabla secundaria (secondary).
    
    Args:
        model_class: Clase del modelo SQLAlchemy
        
    Returns:
        Lista de diccionarios con información de cada relación many-to-many
    """
    relationships = []
    
    try:
        inspector = sqlalchemy_inspect(model_class)
        mapper = inspector.mapper
        
        print(f"      🔍 Extrayendo relaciones many-to-many del modelo {model_class.__name__}...")
        
        if mapper:
            for rel_name, relationship_obj in mapper.relationships.items():
                print(f"      🔎 Revisando relación: {rel_name}")
                print(f"         - Tiene secondary: {hasattr(relationship_obj, 'secondary')}")
                if hasattr(relationship_obj, 'secondary'):
                    print(f"         - secondary es None: {relationship_obj.secondary is None}")
                
                # Solo procesar relaciones many-to-many (tienen secondary table)
                if hasattr(relationship_obj, 'secondary') and relationship_obj.secondary is not None:
                    # Obtener la tabla intermedia (many-to-many / secondary)
                    many_to_many_table = None
                    secondary = relationship_obj.secondary
                    if isinstance(secondary, str):
                        # Puede ser "public.farm_crops" o "farm_crops"
                        many_to_many_table = secondary.split('.')[-1] if '.' in secondary else secondary
                    elif hasattr(secondary, 'name'):
                        many_to_many_table = getattr(secondary, 'name', None)
                    if not many_to_many_table and hasattr(secondary, 'key'):
                        many_to_many_table = getattr(secondary, 'key', None)

                    # Obtener la tabla destino
                    target_table = None
                    display_name = None
                    description = None

                    # Intentar obtener el nombre de la tabla de diferentes formas
                    try:
                        if hasattr(relationship_obj, 'mapper') and hasattr(relationship_obj.mapper, 'class_'):
                            target_table = relationship_obj.mapper.class_.__tablename__
                            print(f"         ✓ target_table desde mapper.class_: {target_table}")
                    except Exception as e:
                        print(f"         ⚠️  Error obteniendo target_table desde mapper: {e}")
                    
                    if not target_table and hasattr(relationship_obj, 'entity'):
                        try:
                            target_table = relationship_obj.entity.__tablename__
                            print(f"         ✓ target_table desde entity: {target_table}")
                        except Exception as e:
                            print(f"         ⚠️  Error obteniendo target_table desde entity: {e}")
                    
                    # Intentar obtener display_name y description desde el info de la relación
                    if hasattr(relationship_obj, 'info') and relationship_obj.info:
                        display_name = relationship_obj.info.get("display_name")
                        description = relationship_obj.info.get("description")
                    
                    # Si no hay display_name, generar uno desde el nombre de la relación
                    if not display_name:
                        display_name = rel_name.replace("_", " ").title()
                    
                    relationships.append({
                        "name": rel_name,  # Nombre de la relación (ej: "crops")
                        "type_value": "entity",
                        "is_many_to_many": True,
                        "many_to_many_table": many_to_many_table,  # Tabla intermedia (ej: farm_crops)
                        "is_foreign_key": True,  # Para que se trate como entidad
                        "foreign_key_table": target_table,
                        "nullable": True,  # Las relaciones m2m suelen ser opcionales
                        "display_name": display_name,
                        "description": description,
                        "primary_key": False,
                        "unique": False
                    })
                    print(f"      🔗 Many-to-Many detectado: {rel_name} -> {target_table} (tabla: {many_to_many_table})")
                    print(f"         display_name: {display_name}")
        
        print(f"      📊 Total relaciones many-to-many encontradas: {len(relationships)}")
    
    except Exception as e:
        print(f"⚠️  Error al extraer relaciones many-to-many del modelo: {e}")
        import traceback
        traceback.print_exc()
    
    return relationships


def get_model_attributes(model_class) -> List[Dict[str, Any]]:
    """
    Extrae los atributos/columnas de un modelo SQLAlchemy.
    
    Args:
        model_class: Clase del modelo SQLAlchemy
        
    Returns:
        Lista de diccionarios con información de cada atributo
    """
    attributes = []
    
    try:
        # Usar sqlalchemy.inspect (ya importado como sqlalchemy_inspect)
        inspector = sqlalchemy_inspect(model_class)
        columns = inspector.columns
        
        print(f"      🔍 Extrayendo atributos del modelo {model_class.__name__}...")
        print(f"      📋 Total de columnas encontradas: {len(columns)}")
        
        for column in columns:
            print(f"        📝 Procesando columna: {column.name} (type: {column.type}, nullable: {column.nullable})")
            # Obtener metadatos de la columna (display_name y description desde info)
            column_info = column.info if hasattr(column, 'info') and column.info else {}
            display_name = column_info.get("display_name")
            description = column_info.get("description")
            
            # Detectar si es un ENUM
            is_enum = False
            enum_values = []
            if hasattr(column.type, '__class__') and 'Enum' in column.type.__class__.__name__:
                is_enum = True
                # Extraer los valores del enum
                if hasattr(column.type, 'enums'):
                    enum_values = list(column.type.enums)
                    print(f"        🎯 ENUM DETECTADO: {column.name} con valores: {enum_values}")
                elif hasattr(column.type, 'enum_class'):
                    # Si el Enum tiene una clase Python asociada
                    enum_class = column.type.enum_class
                    enum_values = [e.value for e in enum_class]
                    print(f"        🎯 ENUM DETECTADO: {column.name} con valores desde enum_class: {enum_values}")
            
            # Detectar si es ForeignKey
            is_foreign_key = False
            foreign_key_table = None
            foreign_key_column = None
            
            # Método 1: Verificar si tiene foreign_keys directamente
            if hasattr(column, 'foreign_keys') and column.foreign_keys:
                for fk in column.foreign_keys:
                    is_foreign_key = True
                    # Extraer el nombre de la tabla referenciada
                    if fk.column is not None:
                        foreign_key_table = fk.column.table.name if hasattr(fk.column, 'table') else None
                        foreign_key_column = fk.column.name if hasattr(fk.column, 'name') else None
                    # También intentar desde el target si está disponible
                    if not foreign_key_table and hasattr(fk, 'column') and fk.column:
                        try:
                            foreign_key_table = fk.column.table.name
                            foreign_key_column = fk.column.name
                        except:
                            pass
                    break
            
            # Método 2: Verificar si la columna tiene ForeignKey en su definición
            # Esto es útil cuando foreign_keys no está poblado pero la columna tiene ForeignKey
            if not is_foreign_key:
                # Verificar en la definición de la columna usando inspect
                try:
                    # Buscar en las propiedades de la columna
                    if hasattr(column, 'property') and hasattr(column.property, 'columns'):
                        for col in column.property.columns:
                            if hasattr(col, 'foreign_keys') and col.foreign_keys:
                                for fk in col.foreign_keys:
                                    is_foreign_key = True
                                    if fk.column is not None:
                                        foreign_key_table = fk.column.table.name if hasattr(fk.column, 'table') else None
                                        foreign_key_column = fk.column.name if hasattr(fk.column, 'name') else None
                                    break
                                if is_foreign_key:
                                    break
                except Exception as e:
                    # Si hay error, continuar sin este método
                    pass
            
            # Método 3: Verificar en el modelo usando relaciones SQLAlchemy
            if not is_foreign_key:
                try:
                    # Buscar relaciones en el modelo que apunten a esta columna
                    mapper = inspector.mapper
                    if mapper:
                        for relationship in mapper.relationships.values():
                            # Verificar si esta columna es parte de una foreign key de esta relación
                            if hasattr(relationship, 'local_columns'):
                                for rel_col in relationship.local_columns:
                                    if rel_col.name == column.name:
                                        is_foreign_key = True
                                        # Intentar obtener el nombre de la tabla desde la relación
                                        if hasattr(relationship, 'entity') and hasattr(relationship.entity, '__table__'):
                                            foreign_key_table = relationship.entity.__table__.name
                                        break
                except Exception as e:
                    # Si hay error, continuar sin este método
                    pass
            
            # Método 4: Si el nombre termina en _id y no es primary key, asumir que es ForeignKey
            # Esto es un fallback para casos donde SQLAlchemy no detecta automáticamente
            if not is_foreign_key and column.name.endswith('_id') and not column.primary_key:
                print(f"        🔍 Método 4: Columna '{column.name}' termina en '_id', asumiendo que es ForeignKey")
                is_foreign_key = True
                # Intentar inferir el nombre de la tabla desde el nombre de la columna
                # Ejemplo: country_id -> countries, department_id -> departments
                table_name_guess = column.name[:-3]  # Quitar '_id'
                # Si termina en 'y', cambiar a 'ies' (country -> countries)
                if table_name_guess.endswith('y'):
                    table_name_guess = table_name_guess[:-1] + 'ies'
                # Si no termina en 's', agregar 's' (department -> departments)
                elif not table_name_guess.endswith('s'):
                    table_name_guess = table_name_guess + 's'
                foreign_key_table = table_name_guess
                print(f"        📋 Tabla inferida desde nombre de columna: {foreign_key_table}")
            
            # Log para debugging
            if is_foreign_key:
                print(f"        ✅ ForeignKey DETECTADO: {column.name} -> {foreign_key_table or 'N/A'}.{foreign_key_column if foreign_key_column else 'id'}")
            else:
                print(f"        ℹ️  Columna '{column.name}' NO es ForeignKey")
            
            col_info = {
                "name": column.name,
                "type": str(column.type),
                "nullable": column.nullable,
                "primary_key": column.primary_key,
                "unique": column.unique if hasattr(column, 'unique') else False,
                "default": str(column.default) if column.default else None,
                "display_name": display_name,  # Desde info de la columna
                "description": description,  # Desde info de la columna
                "is_foreign_key": is_foreign_key,
                "foreign_key_table": foreign_key_table,
                "is_enum": is_enum,
                "enum_values": enum_values
            }
            
            # Si es ForeignKey, usar type_value "entity" y marcar que NO es many-to-many
            if is_foreign_key:
                col_info["type_value"] = "entity"
                col_info["is_many_to_many"] = False
                col_info["many_to_many_table"] = None
                print(f"        🏷️  type_value establecido como 'entity' para ForeignKey (is_many_to_many: False)")
            # Si es ENUM, usar type_value "options"
            elif is_enum:
                col_info["type_value"] = "options"
                print(f"        🏷️  type_value establecido como 'options' para ENUM")
            else:
                # Determinar type_value según el tipo de columna
                type_str = str(column.type).lower()
                type_class = type(column.type).__name__.lower()
                
                # Detectar números: Decimal, Numeric, Float, Integer, BigInteger, SmallInteger
                if ('decimal' in type_str or 'numeric' in type_str or 
                    'float' in type_str or 'real' in type_str or
                    'int' in type_str or 'integer' in type_str or 'bigint' in type_str or
                    'smallint' in type_str or 'numeric' in type_class):
                    col_info["type_value"] = "number"
                # Detectar booleanos
                elif 'bool' in type_str or 'boolean' in type_str:
                    col_info["type_value"] = "boolean"
                # Detectar fechas
                elif 'timestamp' in type_str or 'date' in type_str or 'datetime' in type_str:
                    col_info["type_value"] = "date"
                # Distinguir entre Text (texto largo) y VARCHAR/String (texto corto)
                elif 'text' in type_str:
                    col_info["type_value"] = "text_long"  # Text = texto largo
                elif 'varchar' in type_str or 'string' in type_str or 'char' in type_str:
                    col_info["type_value"] = "text_short"  # VARCHAR/String = texto corto
                # UUID como texto corto
                elif 'uuid' in type_str:
                    col_info["type_value"] = "text_short"
                # JSON/JSONB como texto largo
                elif 'json' in type_str or 'jsonb' in type_str:
                    col_info["type_value"] = "text_long"
                else:
                    col_info["type_value"] = "text_short"  # Default a texto corto
            
            # Omitir campos que no deben estar en formularios
            if column.name in ['id', 'created_at', 'updated_at', 'disabled_at']:
                print(f"        ⏭️  Omitiendo columna '{column.name}' (campo del sistema)")
                continue
            
            print(f"        ✅ Agregando atributo: {col_info['name']} (type_value: {col_info.get('type_value', 'N/A')})")
            attributes.append(col_info)
            
    except Exception as e:
        print(f"⚠️  Error al extraer atributos del modelo: {e}")
        import traceback
        traceback.print_exc()
    
    return attributes


def get_action_tools(container) -> List[Dict[str, Any]]:
    """
    Obtiene todas las action_tools desde la base de datos o desde seeds como fallback.
    
    Args:
        container: Container con acceso a servicios y bases de datos
        
    Returns:
        Lista de diccionarios con las tools disponibles
    """
    from sqlalchemy.orm import Session
    
    tools = []
    
    try:
        # Intentar obtener desde la base de datos
        from ..models.action_tools import ActionToolModel
        
        db = container.get("core_db", "databases")
        if isinstance(db, Session):
            tools_db = db.query(ActionToolModel).filter(
                ActionToolModel.disabled_at.is_(None)
            ).all()
            
            print(f"      📊 Tools desde BD: {len(tools_db)}")
            
            for tool in tools_db:
                tools.append({
                    "id": str(tool.id),
                    "name": tool.name,
                    "description": tool.description,
                    "place_holder": tool.place_holder,
                    "schema_input": tool.schema_input or [],
                    "schema_variables": tool.schema_variables or [],
                    "config_form": tool.config_form or {},
                    "on_action": tool.on_action
                })
            
            if tools:
                print(f"      ✅ Retornando {len(tools)} tools desde BD")
                return tools
    except Exception as e:
        print(f"      ⚠️  Error obteniendo tools desde BD: {e}")
        # Si hay un error (por ejemplo, tabla no existe), hacer rollback para limpiar la transacción
        db = container.get("core_db", "databases")
        if isinstance(db, Session):
            try:
                db.rollback()
            except Exception as rollback_error:
                # Si el rollback también falla, no hacer nada más
                pass
    
    # Fallback: obtener desde seeds (que ahora carga desde tools.json)
    print(f"      🔄 Intentando cargar tools desde seeds (tools.json)...")
    try:
        from ...seeds.seeds import get_seeds
        seeds = get_seeds()
        tools_data = seeds.get("action_tools", [])
        
        print(f"      📊 Tools desde seeds: {len(tools_data)}")
        
        for tool in tools_data:
            tools.append({
                "id": tool.get("id"),
                "name": tool.get("name"),
                "description": tool.get("description"),
                "place_holder": tool.get("place_holder"),
                "schema_input": tool.get("schema_input", []),
                "schema_variables": tool.get("schema_variables", []),
                "config_form": tool.get("config_form", {}),
                "on_action": tool.get("on_action")
            })
        
        print(f"      ✅ Retornando {len(tools)} tools desde seeds")
    except Exception as e:
        print(f"      ❌ Error obteniendo tools desde seeds (tools.json): {e}")
        import traceback
        traceback.print_exc()
    
    return tools


def find_tool_by_type_value(tools: List[Dict[str, Any]], type_value: str) -> Optional[Dict[str, Any]]:
    """
    Encuentra una tool apropiada basándose en el type_value del atributo.
    
    Args:
        tools: Lista de tools disponibles
        type_value: Tipo de valor del atributo (text, number, boolean, date, entity, text_long, text_short, options)
        
    Returns:
        La tool más apropiada o None
    """
    # Caso especial: options (ENUMs) debe mapear a herramienta de selección
    if type_value == "options":
        print(f"      🔍 Buscando tool para type_value 'options' (ENUM)...")
        # Buscar tool con gather.type_value "option" o "options"
        for tool in tools:
            config_form = tool.get("config_form", {})
            gather = config_form.get("gather", {})
            gather_type = gather.get("type_value")
            if gather_type in ["option", "options"]:
                print(f"      ✅ Tool encontrada con gather.type_value='{gather_type}': {tool.get('name')}")
                return tool
        print(f"      ⚠️  No se encontró tool para type_value 'options'")
    
    # Caso especial: entity debe mapear a "Entidades"
    if type_value == "entity":
        print(f"      🔍 Buscando tool para type_value 'entity'...")
        # Primero buscar por nombre exacto "Entidades"
        for tool in tools:
            tool_name = tool.get("name", "").strip()
            if tool_name.lower() == "entidades" or tool_name == "Entidades":
                print(f"      ✅ Tool 'Entidades' encontrada por nombre: {tool_name}")
                return tool
        
        # Si no encuentra "Entidades", buscar cualquier tool con type_value "entity" en gather
        for tool in tools:
            config_form = tool.get("config_form", {})
            gather = config_form.get("gather", {})
            gather_type = gather.get("type_value")
            if gather_type == "entity":
                print(f"      ✅ Tool encontrada con gather.type_value='entity': {tool.get('name')}")
                return tool
        
        # Si aún no encuentra, buscar tools que tengan "entity" en el nombre o descripción
        for tool in tools:
            tool_name = tool.get("name", "").lower()
            tool_desc = tool.get("description", "").lower()
            if "entidad" in tool_name or "entity" in tool_name or "entidad" in tool_desc or "entity" in tool_desc:
                print(f"      ✅ Tool encontrada con 'entidad' en nombre/descripción: {tool.get('name')}")
                return tool
        
        print(f"      ⚠️  No se encontró tool para type_value 'entity'")
    
    # Caso especial: boolean debe mapear a "Si/No"
    if type_value == "boolean":
        for tool in tools:
            if tool.get("name") == "Si/No":
                return tool
        # Si no encuentra "Si/No", buscar cualquier tool con type_value "option"
        for tool in tools:
            config_form = tool.get("config_form", {})
            gather = config_form.get("gather", {})
            gather_type = gather.get("type_value")
            if gather_type == "option":
                return tool
    
    # Caso especial: text_long debe mapear a "Texto largo"
    if type_value == "text_long":
        for tool in tools:
            if tool.get("name") == "Texto largo":
                return tool
        # Si no encuentra "Texto largo", buscar cualquier tool de texto
        for tool in tools:
            config_form = tool.get("config_form", {})
            gather = config_form.get("gather", {})
            gather_type = gather.get("type_value")
            if gather_type == "text":
                return tool
    
    # Caso especial: text_short debe mapear a "Texto corto" o "Texto"
    if type_value == "text_short":
        # Preferir "Texto corto"
        for tool in tools:
            if tool.get("name") == "Texto corto":
                return tool
        # Si no encuentra "Texto corto", buscar "Texto"
        for tool in tools:
            if tool.get("name") == "Texto":
                return tool
        # Si no encuentra ninguno, buscar cualquier tool de texto
        for tool in tools:
            config_form = tool.get("config_form", {})
            gather = config_form.get("gather", {})
            gather_type = gather.get("type_value")
            if gather_type == "text":
                return tool
    
    # Mapeo de type_value a config_form.gather.type_value
    type_mapping = {
        "text": "text",  # Fallback para compatibilidad
        "number": "number",
        "date": "date",
        "timestamp": "date",
        "datetime": "date"
    }
    
    target_type = type_mapping.get(type_value, "text")
    
    # Buscar tool que coincida con el type_value
    for tool in tools:
        config_form = tool.get("config_form", {})
        gather = config_form.get("gather", {})
        gather_type = gather.get("type_value")
        
        if gather_type == target_type:
            # Preferencias por nombre para cada tipo
            if type_value == "number":
                # Preferir "Número" sobre "Calculadora"
                if tool.get("name") == "Número":
                    return tool
            elif type_value in ["date", "timestamp", "datetime"]:
                # Preferir "Fecha"
                if tool.get("name") == "Fecha":
                    return tool
    
    # Si no se encontró con preferencias, retornar la primera coincidencia
    for tool in tools:
        config_form = tool.get("config_form", {})
        gather = config_form.get("gather", {})
        gather_type = gather.get("type_value")
        
        if gather_type == target_type:
            return tool
    
    # Si no se encuentra, buscar la primera tool de texto como fallback
    for tool in tools:
        config_form = tool.get("config_form", {})
        gather = config_form.get("gather", {})
        gather_type = gather.get("type_value")
        
        if gather_type == "text":
            return tool
    
    return None


def _generate_schema_conditions(schema_input: List[Dict[str, Any]], schema_variables: Optional[List[Dict[str, Any]]], next_instruction_id: Optional[str] = None, always_generate: bool = True) -> List[Dict[str, Any]]:
    """
    Genera schema_conditions basándose en inputs y variables que tienen is_condition: True.
    Si no hay inputs/variables con is_condition, genera una condición por defecto si always_generate=True.
    
    Args:
        schema_input: Lista de inputs de la instrucción
        schema_variables: Lista de variables de la tool (opcional)
        next_instruction_id: UUID de la siguiente instrucción en el flujo (opcional)
        always_generate: Si True, genera una condición por defecto aunque no haya inputs con is_condition
        
    Returns:
        Lista de condiciones generadas con la estructura correcta
    """
    schema_conditions = []
    
    # Revisar inputs con is_condition: True
    for input_item in schema_input:
        if input_item.get("is_condition", False):
            condition = {
                "id": str(uuid4()),
                "next_instruction_id": next_instruction_id,  # UUID de la siguiente instrucción
                "type_condition": "by_success",  # Tipo de condición
                "logical_operator": None,  # Operador lógico (null)
                "validators": []  # Lista vacía de validadores
            }
            
            # Si el input tiene opciones (como Si/No), generar condiciones para cada opción
            if input_item.get("type_input") == "options" and input_item.get("options"):
                for option in input_item.get("options", []):
                    condition_option = condition.copy()
                    condition_option["id"] = str(uuid4())
                    # Mantener next_instruction_id para todas las opciones
                    schema_conditions.append(condition_option)
            else:
                # Para otros tipos, crear una condición básica
                schema_conditions.append(condition)
    
    # Revisar variables con is_condition: True
    if schema_variables:
        for variable in schema_variables:
            if variable.get("is_condition", False):
                condition = {
                    "id": str(uuid4()),
                    "next_instruction_id": next_instruction_id,  # UUID de la siguiente instrucción
                    "type_condition": "by_success",  # Tipo de condición
                    "logical_operator": None,  # Operador lógico (null)
                    "validators": []  # Lista vacía de validadores
                }
                schema_conditions.append(condition)
    
    # Si no se generaron condiciones y always_generate=True, generar una condición por defecto
    # Esto asegura que todas las instrucciones tengan al menos una condición para el flujo
    if not schema_conditions and always_generate and next_instruction_id is not None:
        condition = {
            "id": str(uuid4()),
            "next_instruction_id": next_instruction_id,  # UUID de la siguiente instrucción
            "type_condition": "by_success",  # Tipo de condición
            "logical_operator": None,  # Operador lógico (null)
            "validators": []  # Lista vacía de validadores
        }
        schema_conditions.append(condition)
    
    return schema_conditions


def create_instruction_from_tool(tool: Dict[str, Any], attr: Dict[str, Any], group_index: int, field_map: Optional[Dict[str, Any]] = None, form_display_name: Optional[str] = None, container = None, referencable_entities_map: Optional[Dict[str, Dict[str, Any]]] = None) -> Dict[str, Any]:
    """
    Crea una instrucción basada en una tool y un atributo del modelo.
    
    Args:
        tool: Diccionario con la información de la tool
        attr: Diccionario con la información del atributo del modelo
        group_index: Índice del grupo para esta instrucción
        field_map: Diccionario opcional con mapeo de campos del entityMap (displayName, description, inputs).
                   IMPORTANTE: field_map viene del campo 'entityMap' dentro de cada formulario en 'forms' del config.yaml,
                   NO de 'referencable_entities'. Contiene la configuración personalizada para este campo específico.
        form_display_name: String opcional con el display_name del formulario desde config.yaml (DEPRECATED: ahora se usa representative_value)
        container: Container con acceso a servicios y bases de datos (necesario para obtener representative_value desde BD como fallback)
        referencable_entities_map: Diccionario opcional con mapeo de entidades referenciables desde config.yaml (entity_name -> config).
                                   Solo contiene información básica (display_name, representative_value, description), NO entityMap.
        
    Returns:
        Dict con la instrucción completa
    """
    instruction_id = str(uuid4())
    
    # Obtener información del campo desde entityMap si está disponible
    field_display_name = None
    field_description = None
    if field_map:
        field_display_name = field_map.get("displayName") or field_map.get("display_name")
        field_description = field_map.get("description")
    
    # Si no hay displayName en el map, intentar obtenerlo del modelo (desde column.info)
    if not field_display_name:
        field_display_name = attr.get("display_name")
    
    # Si no hay description en el map, intentar obtenerla del modelo (desde column.info)
    if not field_description:
        field_description = attr.get("description")
    
    # Si no hay displayName en el map ni en el modelo, usar el nombre del atributo formateado
    if not field_display_name:
        field_display_name = attr["name"].replace("_", " ").title()
    
    # Obtener inputs personalizados desde entityMap.inputs si existen
    entity_map_inputs = {}
    if field_map and field_map.get("inputs"):
        entity_map_inputs = field_map["inputs"]
    
    # Obtener schema_input de la tool y adaptarlo al atributo
    tool_schema_input = tool.get("schema_input", [])
    schema_input = []
    
    # Si es un campo ENUM, necesitamos agregar los valores al input "select"
    is_enum_field = attr.get("is_enum", False)
    enum_values = attr.get("enum_values", [])
    
    for input_item in tool_schema_input:
        # Copiar el input de la tool
        adapted_input = input_item.copy()
        input_name = adapted_input.get("name")
        is_increasing = adapted_input.get("is_increasing", False)
        
        # Si es un campo ENUM, agregar los valores a todos los inputs con is_increasing=true
        if is_enum_field and enum_values and is_increasing:
            # Cuando es enum e is_increasing=true, recorrer cada valor del enum
            # y agregarlo como objeto {id, value} a la lista
            options_list = []
            for enum_val in enum_values:
                options_list.append({
                    "id": str(uuid4()),
                    "value": enum_val
                })
            # Establecer los valores en el input que tiene is_increasing=true
            adapted_input["value"] = options_list
            print(f"      🎯 Valores de ENUM aplicados al input '{input_name}' (is_increasing=true): {len(options_list)} opciones")
        # Si es un campo ENUM pero el input NO tiene is_increasing, mantener value vacío
        elif is_enum_field and input_name == "options" and not is_increasing:
            # Para ENUMs, el input "options" sin is_increasing debe tener value vacío []
            adapted_input["value"] = []
            print(f"      🎯 Input 'options' para ENUM configurado con value vacío")
        
        # Si el input tiene name "title", adaptarlo al nombre del atributo
        if input_name == "title":
            adapted_input["place_holder"] = f"Ingrese {field_display_name.lower()}"
            adapted_input["is_gather_name"] = True
            adapted_input["is_representative"] = True
            
            # PRIORIDAD 1: Verificar si hay valor en entityMap.inputs.title
            if "title" in entity_map_inputs:
                title_value = entity_map_inputs["title"]
                adapted_input["display_name"] = title_value
                if is_increasing:
                    adapted_input["value"] = [{"value": title_value}]
                else:
                    adapted_input["value"] = title_value
            else:
                # PRIORIDAD 2: Usar display_name por defecto (del entityMap o del modelo)
                adapted_input["display_name"] = field_display_name
                if is_increasing:
                    adapted_input["value"] = [{"value": field_display_name}]
                else:
                    adapted_input["value"] = field_display_name
            
            # Si hay descripción, agregarla al input (solo metadata, no value)
            if field_description:
                adapted_input["description"] = field_description
        
        # Si el input tiene name "description"
        elif input_name == "description":
            # PRIORIDAD 1: Verificar si hay valor en entityMap.inputs.description
            if "description" in entity_map_inputs:
                desc_value = entity_map_inputs["description"]
                adapted_input["display_name"] = desc_value
                if is_increasing:
                    adapted_input["value"] = [{"value": desc_value}]
                else:
                    adapted_input["value"] = desc_value
            elif field_description:
                # PRIORIDAD 2: Usar description del entityMap o del modelo
                adapted_input["display_name"] = field_description
                if is_increasing:
                    adapted_input["value"] = [{"value": field_description}]
                else:
                    adapted_input["value"] = field_description
            else:
                # PRIORIDAD 3: Usar valor por defecto de la tool
                default_description = adapted_input.get("display_name", "Descripción opcional")
                if is_increasing:
                    adapted_input["value"] = [{"value": default_description}]
                else:
                    adapted_input["value"] = default_description
        
        # Si el input tiene name "entity_type" y la tool es "Entidades", establecer el nombre de la entidad referenciada
        elif input_name == "entity_type" and tool.get("name") == "Entidades":
            # PRIORIDAD 1: Verificar si hay valor en entityMap.inputs.entity_type
            if "entity_type" in entity_map_inputs:
                entity_type_value = entity_map_inputs["entity_type"]
                if is_increasing:
                    adapted_input["value"] = [{"value": entity_type_value}]
                else:
                    adapted_input["value"] = entity_type_value
                print(f"      ✓ entity_type aplicado desde entityMap.inputs: {entity_type_value}")
            else:
                # PRIORIDAD 2: Obtener el nombre de la entidad referenciada desde el atributo
                entity_name = attr.get("foreign_key_table")
                if entity_name:
                    # Establecer el value con el nombre de la entidad (que es el entity_name)
                    if is_increasing:
                        adapted_input["value"] = [{"value": entity_name}]
                    else:
                        adapted_input["value"] = entity_name
                else:
                    # Si no hay foreign_key_table, inicializar según is_increasing
                    if is_increasing:
                        adapted_input["value"] = []
                    else:
                        adapted_input["value"] = None
        
        # Si el input tiene name "filter" y la tool es "Entidades", aplicar el filtro desde entityMap.inputs.filter
        elif input_name == "filter" and tool.get("name") == "Entidades":
            # PRIORIDAD 1: Verificar si hay valor en entityMap.inputs.filter
            if "filter" in entity_map_inputs:
                filter_value = entity_map_inputs["filter"]
                if is_increasing:
                    # Para is_increasing=True, el valor debe ser una lista
                    adapted_input["value"] = [filter_value]
                else:
                    # Para is_increasing=False, el valor debe ser un string directo, no un objeto
                    adapted_input["value"] = filter_value
                print(f"      ✓ Filtro aplicado desde entityMap: {filter_value}")
            else:
                # PRIORIDAD 2: Si no hay filtro en entityMap, usar valor por defecto (None o [])
                if is_increasing:
                    adapted_input["value"] = []
                else:
                    adapted_input["value"] = None
        
        # Si el input tiene name "is_multiple" y la tool es "Entidades", establecer según si es many-to-many
        elif input_name == "is_multiple" and tool.get("name") == "Entidades":
            # PRIORIDAD 1: Verificar si hay valor en entityMap.inputs.is_multiple
            if "is_multiple" in entity_map_inputs:
                is_multiple_value = entity_map_inputs["is_multiple"]
                if is_increasing:
                    adapted_input["value"] = [{"value": is_multiple_value}]
                else:
                    adapted_input["value"] = is_multiple_value
                print(f"      ✓ is_multiple aplicado desde entityMap.inputs: {is_multiple_value}")
            else:
                # PRIORIDAD 2: Verificar si este atributo es una relación many-to-many
                is_m2m = attr.get("is_many_to_many", False)
                
                # Establecer el valor según si es many-to-many o no
                if is_increasing:
                    adapted_input["value"] = [{"value": is_m2m}]
                else:
                    adapted_input["value"] = is_m2m
                
                print(f"      ✓ is_multiple establecido: {is_m2m} (many-to-many: {is_m2m})")
                
                # Si es many-to-many, asegurar que el gather también tenga configuración para múltiples valores
                if is_m2m:
                    print(f"      🔗 Campo many-to-many detectado: estableciendo is_multiple=True")
        
        # Si el input tiene name "display_name" y la tool es "Entidades", obtener el representative_value de la entidad referenciada
        elif input_name == "display_name" and tool.get("name") == "Entidades":
            # PRIORIDAD 1: Verificar si hay valor en entityMap.inputs.display_name
            if "display_name" in entity_map_inputs:
                display_name_value = entity_map_inputs["display_name"]
                if is_increasing:
                    adapted_input["value"] = [{"value": display_name_value}]
                else:
                    adapted_input["value"] = display_name_value
                adapted_input["display_name"] = display_name_value
                print(f"      ✓ display_name aplicado desde entityMap.inputs: {display_name_value}")
            else:
                # PRIORIDAD 2: Buscar representative_value de la entidad referenciada
                # Obtener el nombre de la entidad referenciada desde el atributo
                entity_name = attr.get("foreign_key_table")
                representative_value = None
                
                # PRIMERO: Buscar en referencable_entities_map (config.yaml) - tiene prioridad
                if entity_name and referencable_entities_map:
                    entity_name_lower = entity_name.lower().strip()  # Normalizar y quitar espacios
                    # Buscar con y sin espacios para mayor robustez
                    ref_entity_config = referencable_entities_map.get(entity_name_lower)
                    if not ref_entity_config:
                        # Intentar buscar sin normalizar (por si hay espacios en el config)
                        for key, value in referencable_entities_map.items():
                            if key.strip().lower() == entity_name_lower:
                                ref_entity_config = value
                                break
                    
                    if ref_entity_config:
                        representative_value = ref_entity_config.get("representative_value")
                        if representative_value:
                            print(f"      ✓ representative_value encontrado en config.yaml para '{entity_name}': {representative_value}")
                
                # SEGUNDO: Si no se encontró en config.yaml, buscar en la base de datos
                if not representative_value and entity_name and container:
                    try:
                        from .models.referencable_entities import ReferencableEntityModel
                        from sqlalchemy.orm import Session
                        
                        db = container.get("core_db", "databases")
                        if isinstance(db, Session):
                            # Buscar la entidad referenciable por entity_name
                            referencable_entity = db.query(ReferencableEntityModel).filter(
                                ReferencableEntityModel.entity_name == entity_name.lower(),
                                ReferencableEntityModel.disabled_at.is_(None)
                            ).first()
                            
                            if referencable_entity and referencable_entity.representative_value:
                                representative_value = referencable_entity.representative_value
                                print(f"      ✓ representative_value encontrado en BD para '{entity_name}': {representative_value}")
                    except Exception as e:
                        print(f"      ⚠️  Error al obtener representative_value desde BD para entidad '{entity_name}': {e}")
                
                # TERCERO: Si no se encontró representative_value, usar form_display_name como fallback (compatibilidad hacia atrás)
                if not representative_value and form_display_name:
                    representative_value = form_display_name
                    print(f"      ⚠️  Usando form_display_name como fallback para '{entity_name}': {representative_value}")
                
                if representative_value:
                    # Establecer el value con el representative_value de la entidad referenciada
                    if is_increasing:
                        adapted_input["value"] = [{"value": representative_value}]
                    else:
                        adapted_input["value"] = representative_value
                    # También establecer display_name del input con el representative_value
                    adapted_input["display_name"] = representative_value
                    print(f"      ✅ display_name establecido para tool 'Entidades' con representative_value: {representative_value}")
                else:
                    # Si no hay representative_value, inicializar según is_increasing
                    if is_increasing:
                        adapted_input["value"] = []
                    else:
                        adapted_input["value"] = None
                    print(f"      ⚠️  No se encontró representative_value para entidad '{entity_name}', display_name quedará vacío")
        
        # Para otros inputs, manejar el campo 'value' según el tipo y is_increasing
        # Si is_increasing es true, value debe ser una lista
        # Si es texto, número, boolean o is_increasing es false, value NO debe ser una lista
        else:
            is_increasing = adapted_input.get("is_increasing", False)
            type_input = adapted_input.get("type_input", "")
            
            if "value" not in adapted_input:
                # Si no existe value, inicializar según is_increasing
                if is_increasing:
                    adapted_input["value"] = []
                else:
                    # Para tipos simples (texto, número, boolean), usar None o valor por defecto
                    if type_input in ["text", "number", "boolean"]:
                        adapted_input["value"] = None
                    else:
                        adapted_input["value"] = []
            elif isinstance(adapted_input.get("value"), list):
                # Si ya es una lista pero is_increasing es false y es tipo simple, convertir a valor simple
                if not is_increasing and type_input in ["text", "number", "boolean"]:
                    if len(adapted_input["value"]) > 0:
                        # Tomar el primer valor de la lista
                        first_item = adapted_input["value"][0]
                        if isinstance(first_item, dict) and "value" in first_item:
                            adapted_input["value"] = first_item["value"]
                        else:
                            adapted_input["value"] = first_item
                    else:
                        adapted_input["value"] = None
                # Si is_increasing es true, mantener como lista
            else:
                # Si value es un valor simple (string/número/boolean)
                original_value = adapted_input["value"]
                if is_increasing:
                    # Si is_increasing es true, convertir a formato lista
                    adapted_input["value"] = [{"value": original_value}]
                else:
                    # Si is_increasing es false, mantener como valor simple
                    adapted_input["value"] = original_value
        
        # Generar nuevo ID para el input
        adapted_input["id"] = str(uuid4())
        schema_input.append(adapted_input)
    
    # Crear schema_gather basado en config_form.gather de la tool
    config_form = tool.get("config_form", {})
    gather_config = config_form.get("gather", {})
    
    # Construir schema_gather con toda la información del gather de la tool
    # El campo 'name' debe ser el nombre del atributo del modelo (del config.yaml)
    gather_item = {
        "id": str(uuid4()),
        "name": attr["name"],  # Nombre del atributo del modelo (ej: "first_name", "code")
        "type_value": gather_config.get("type_value", attr["type_value"]),
        "is_module_attr": gather_config.get("is_module_attr", True),
        "is_unique": attr.get("unique", False),
        "is_optional": attr["nullable"],
        "is_representative": False,
        "is_logical_identifier": False,  # Usuario lo configura en UI; solo uno por formulario
        "visual_table": group_index + 1
    }
    # Para campos entity (FK), incluir foreign_key_table, is_many_to_many y many_to_many_table
    if attr.get("type_value") == "entity":
        if attr.get("foreign_key_table"):
            gather_item["foreign_key_table"] = attr["foreign_key_table"]
        gather_item["is_many_to_many"] = attr.get("is_many_to_many", False)
        if attr.get("many_to_many_table"):
            gather_item["many_to_many_table"] = attr["many_to_many_table"]
    
    # Si es un campo ENUM, agregar option al schema_gather
    if is_enum_field and enum_values:
        # Convertir enum_values a formato [{id, value}]
        options_list = []
        for enum_val in enum_values:
            options_list.append({
                "id": str(uuid4()),
                "value": enum_val
            })
        gather_item["option"] = options_list
        gather_item["type"] = "options"
        print(f"      🎯 Opciones agregadas al schema_gather: {len(options_list)} opciones")
    else:
        # Solo agregar option de gather_config si NO se generó desde ENUM
        # option: dict[] - Lista de opciones para inputs de tipo option
        if "option" in gather_config:
            option_value = gather_config["option"]
            # Si option es un dict (formato incorrecto), convertirlo a array vacío
            if isinstance(option_value, dict):
                print(f"      ⚠️  WARNING: option tiene formato dict en lugar de array, se ignorará")
                gather_item["option"] = []
            elif isinstance(option_value, list):
                gather_item["option"] = option_value
        elif "options" in gather_config:
            # Por compatibilidad, si viene "options" en gather_config, guardarlo como "option"
            options_value = gather_config["option"]
            if isinstance(options_value, list):
                gather_item["option"] = options_value
            else:
                print(f"      ⚠️  WARNING: options tiene formato incorrecto, se ignorará")
                gather_item["option"] = []
    
    # type_media - ENUM(MIME TYPE) - Tipo de media para inputs de tipo media
    if "type_media" in gather_config:
        gather_item["type_media"] = gather_config["type_media"]
    
    # type_list_value - Enum - Tipo de valor para inputs de tipo list
    if "type_list_value" in gather_config:
        gather_item["type_list_value"] = gather_config["type_list_value"]
    
    schema_gather = gather_item
    
    # Si entityMap.inputs tiene schema_gather, hacer merge (heredar): las propiedades del config
    # sobrescriben o agregan a las existentes, sin reemplazar el schema_gather completo
    if entity_map_inputs and "schema_gather" in entity_map_inputs:
        config_schema_gather = entity_map_inputs["schema_gather"]
        if isinstance(config_schema_gather, dict):
            schema_gather = {**schema_gather, **config_schema_gather}
            print(f"      ✓ schema_gather heredado desde entityMap.inputs: {list(config_schema_gather.keys())}")
    
    # Procesar schema_advanced de la tool (si existe) y convertirlo a schema_input_advanced
    # schema_advanced en las tools se convierte en schema_input_advanced en las instrucciones
    tool_schema_advanced = tool.get("schema_advanced", [])
    schema_input_advanced = []
    
    for advanced_item in tool_schema_advanced:
        # Copiar el input avanzado de la tool
        adapted_advanced = advanced_item.copy()
        
        # Asegurar que el campo 'value' existe
        # Si no existe en la tool original, inicializarlo como array vacío
        # Si existe pero no es un array, convertirlo al formato esperado
        if "value" not in adapted_advanced:
            adapted_advanced["value"] = []
        elif not isinstance(adapted_advanced.get("value"), list):
            # Si value es un string/número directo, convertirlo al formato array
            original_value = adapted_advanced["value"]
            adapted_advanced["value"] = [{"value": original_value}]
        
        # Generar nuevo ID para el input avanzado
        adapted_advanced["id"] = str(uuid4())
        schema_input_advanced.append(adapted_advanced)
    
    # Generar schema_conditions basándose en inputs y variables con is_condition: True
    # Nota: next_instruction_id se establecerá después cuando se conozca la siguiente instrucción
    # Por ahora no generamos condiciones por defecto aquí, se hará después cuando se conozca next_instruction_id
    schema_variables = tool.get("schema_variables")
    schema_conditions = _generate_schema_conditions(schema_input, schema_variables, next_instruction_id=None, always_generate=False)
    
    # Crear el objeto tool heredando TODO directamente de la tool original
    # La instrucción DEBE heredar completamente la tool, incluyendo id, name y on_action
    # Si algún valor es None en la tool, se mantiene como None (sin valores por defecto)
    tool_object = {
        "id": tool.get("id"),  # ID de la tool original
        "name": tool.get("name"),  # Nombre de la tool original
        "on_action": tool.get("on_action")  # on_action de la tool original (puede ser None)
    }
    
    # Verificar que la tool tiene los campos necesarios
    if not tool_object.get("id"):
        print(f"      ⚠️  ADVERTENCIA: La tool '{tool.get('name')}' no tiene 'id'")
    if not tool_object.get("name"):
        print(f"      ⚠️  ADVERTENCIA: La tool no tiene 'name'")
    
    # Crear la instrucción
    instruction = {
        "id": instruction_id,
        "config": {
            "tool": tool_object,
            "is_gather": config_form.get("is_gather", True),
            "is_channel": config_form.get("is_channel", False),
            "condition": config_form.get("condition"),  # Heredar desde config_form de la tool
            "is_unhappy_cond": config_form.get("is_unhappy_cond", False),  # Heredar desde config_form de la tool
            "is_success": config_form.get("is_success", True)  # Heredar desde config_form de la tool
        },
        "schema_input": schema_input,
        "schema_gather": schema_gather,
        "schema_variables": schema_variables,
        "schema_conditions": schema_conditions,
        "group_index": group_index,
        "metadata": {},
        "type": "ONE_REQUEST",
        "is_not_removable": False
    }
    
    # Agregar schema_input_advanced solo si hay elementos
    if schema_input_advanced:
        instruction["schema_input_advanced"] = schema_input_advanced
    
    return instruction


def generate_schema_from_model(model_class, form_name: str, container, entity_map: Optional[List[Dict[str, Any]]] = None, entity_map_mode: str = "merge", form_display_name: Optional[str] = None, referencable_entities_map: Optional[Dict[str, Dict[str, Any]]] = None) -> Dict[str, Any]:
    """
    Genera un schema para un formulario basado en los atributos del modelo.
    Cada atributo se convierte en una instrucción basada en una action_tool.
    
    Args:
        model_class: Clase del modelo SQLAlchemy
        form_name: Nombre del formulario
        container: Container con acceso a servicios
        entity_map: Lista opcional con mapeo de campos del entityMap (displayName, description, inputs).
                    IMPORTANTE: entity_map debe venir del campo 'entityMap' dentro de cada formulario en 'forms' del config.yaml,
                    NO de 'referencable_entities'. Permite personalizar campos específicos del formulario.
        entity_map_mode: Modo de aplicación del entityMap ("replace" o "merge"). Default: "merge"
        form_display_name: String opcional con el display_name del formulario desde config.yaml
        referencable_entities_map: Diccionario opcional con mapeo de entidades referenciables desde config.yaml (entity_name -> config).
                                   Solo contiene información básica (display_name, representative_value, description), NO entityMap.
        
    Returns:
        Dict con el schema completo (instructions e instruction_start)
    """
    # Obtener columnas (incluye ForeignKeys uno-a-muchos)
    attributes = get_model_attributes(model_class)
    print(f"    📊 Atributos (columnas) encontrados en el modelo: {len(attributes)}")
    for attr in attributes:
        print(f"      - {attr['name']} (type_value: {attr.get('type_value', 'N/A')})")
    
    # Obtener relaciones many-to-many
    relationships = get_model_relationships(model_class)
    print(f"    🔗 Relaciones many-to-many encontradas en el modelo: {len(relationships)}")
    for rel in relationships:
        print(f"      - {rel['name']} -> {rel.get('foreign_key_table', 'N/A')} (many-to-many)")
    
    # Combinar atributos y relaciones
    # Las relaciones many-to-many se agregan al final de los atributos
    all_attributes = attributes + relationships
    print(f"    📋 Total de campos (columnas + relaciones): {len(all_attributes)}")

    # Diccionario de relaciones many-to-many por nombre (para enriquecer atributos sintéticos)
    relationships_by_name = {r["name"]: r for r in relationships}
    
    # Crear un diccionario de mapeo por nombre de campo para acceso rápido
    field_map_dict = {}
    if entity_map:
        for field_map in entity_map:
            field_name = field_map.get("name")
            if field_name:
                field_map_dict[field_name] = field_map
    
    def _attr_from_entity_map_or_synthetic(field_name: str, field_map: Dict[str, Any]) -> Dict[str, Any]:
        """Obtiene el attr del modelo o crea sintético, enriqueciendo con m2m si coincide con una relación."""
        attr = next((a for a in all_attributes if a["name"] == field_name), None)
        if attr:
            return attr
        # Verificar si hay una relación many-to-many con este nombre (en replace/merge el modelo podría no exponerla en all_attributes)
        rel = relationships_by_name.get(field_name)
        if rel:
            # Usar la relación como base y aplicar display/description del entityMap
            attr_enriched = dict(rel)
            attr_enriched["display_name"] = field_map.get("displayName", rel.get("display_name", field_name))
            attr_enriched["description"] = field_map.get("description", rel.get("description", ""))
            print(f"      🔗 Campo '{field_name}' enriquecido desde relación m2m: many_to_many_table={rel.get('many_to_many_table')}")
            return attr_enriched
        # Crear atributo sintético genérico
        print(f"      ⚠️  Campo '{field_name}' no existe en el modelo, creando atributo sintético")
        return {
            "name": field_name,
            "type_value": "text",  # Tipo por defecto
            "display_name": field_map.get("displayName", field_name),
            "description": field_map.get("description", ""),
            "is_optional": True,
            "is_unique": False
        }
    
    # Determinar qué atributos procesar según el mode
    if entity_map_mode == "replace":
        # Modo replace: usar solo los items definidos en entityMap, respetando el orden
        print(f"    🔄 Modo REPLACE: usando solo {len(entity_map)} campos del entityMap")
        attributes_to_process = []
        for field_map in entity_map:
            field_name = field_map.get("name")
            if field_name:
                attr = _attr_from_entity_map_or_synthetic(field_name, field_map)
                attributes_to_process.append(attr)
    else:
        # Modo merge: empezar con atributos del modelo (columnas + relaciones), luego actualizar/agregar según entityMap
        print(f"    🔄 Modo MERGE: empezando con {len(all_attributes)} atributos del modelo (columnas + relaciones)")
        # Crear un diccionario de atributos por nombre para acceso rápido
        attributes_dict = {attr["name"]: attr for attr in all_attributes}
        
        # Procesar entityMap para actualizar/agregar campos
        for field_map in entity_map:
            field_name = field_map.get("name")
            if field_name:
                if field_name in attributes_dict:
                    # Actualizar atributo existente con información del entityMap
                    attributes_dict[field_name].update({
                        "display_name": field_map.get("displayName", attributes_dict[field_name].get("display_name")),
                        "description": field_map.get("description", attributes_dict[field_name].get("description"))
                    })
                else:
                    # Agregar nuevo atributo desde entityMap (enriquecer con m2m si existe relación)
                    attr_new = _attr_from_entity_map_or_synthetic(field_name, field_map)
                    attributes_dict[field_name] = attr_new
                    if attr_new.get("is_many_to_many"):
                        print(f"      ➕ Agregando campo '{field_name}' desde entityMap (many-to-many: {attr_new.get('many_to_many_table')})")
                    else:
                        print(f"      ➕ Agregando campo '{field_name}' desde entityMap")
        
        # Mantener el orden original del modelo
        attributes_to_process = []
        # Primero agregar atributos del modelo en su orden original (columnas + relaciones)
        for attr in all_attributes:
            if attr["name"] in attributes_dict:
                attributes_to_process.append(attributes_dict[attr["name"]])
        # Luego agregar atributos nuevos del entityMap que no están en el modelo
        for field_map in entity_map:
            field_name = field_map.get("name")
            if field_name and field_name not in {a["name"] for a in all_attributes}:
                attributes_to_process.append(attributes_dict[field_name])
    
    # Obtener todas las tools disponibles
    print(f"    🔧 Obteniendo tools desde container...")
    tools = get_action_tools(container)
    print(f"    🛠️  Tools disponibles: {len(tools)}")
    if tools:
        print(f"      Nombres de tools: {[t.get('name') for t in tools[:5]]}...")
        # Mostrar más detalles de las primeras tools
        for i, tool in enumerate(tools[:3]):
            print(f"        Tool {i+1}: {tool.get('name')} - config_form.gather.type_value: {tool.get('config_form', {}).get('gather', {}).get('type_value', 'N/A')}")
    else:
        print(f"    ⚠️  NO HAY TOOLS DISPONIBLES - Esto causará que se use el schema básico")
    
    if not tools:
        print("⚠️  No se encontraron action_tools, usando schema básico")
        print("⚠️  Esto generará solo UNA instrucción con todos los atributos en lugar de una por atributo")
        # Fallback al método anterior si no hay tools
        return _generate_basic_schema(attributes)
    
    # Crear una instrucción por cada atributo a procesar
    # Cada instrucción debe heredar completamente de su tool correspondiente
    instructions = []
    first_instruction_id = None
    
    print(f"    🔨 Generando {len(attributes_to_process)} instrucciones (una por cada atributo)...")
    for idx, attr in enumerate(attributes_to_process):
        print(f"    📝 Procesando atributo {idx + 1}/{len(attributes_to_process)}: {attr['name']} (type_value: {attr.get('type_value', 'N/A')})")
        
        # Buscar la tool apropiada para este tipo de atributo
        tool = find_tool_by_type_value(tools, attr["type_value"])
        
        if not tool:
            print(f"      ⚠️  No se encontró tool para type_value '{attr['type_value']}', intentando fallbacks...")
            # Intentar diferentes fallbacks según el tipo
            if attr["type_value"] in ["text_short", "text_long"]:
                tool = find_tool_by_type_value(tools, "text")
            elif attr["type_value"] == "number":
                tool = find_tool_by_type_value(tools, "number")
            else:
                tool = find_tool_by_type_value(tools, "text")
            
            if not tool and tools:
                # Último recurso: usar la primera tool disponible
                tool = tools[0]
                print(f"      ⚠️  Usando primera tool disponible como fallback: {tool.get('name')}")
        
        if tool:
            print(f"      ✓ Tool encontrada: {tool.get('name')} (id: {tool.get('id')})")
            print(f"         - config_form.gather.type_value: {tool.get('config_form', {}).get('gather', {}).get('type_value', 'N/A')}")
            
            # Obtener el mapeo de campo para este atributo si existe
            field_map = field_map_dict.get(attr["name"])
            
            # Crear la instrucción basada en la tool, heredando TODA la información de la tool
            instruction = create_instruction_from_tool(
                tool, 
                attr, 
                idx, 
                field_map=field_map, 
                form_display_name=form_display_name, 
                container=container,
                referencable_entities_map=referencable_entities_map
            )
            instructions.append(instruction)
            print(f"      ✅ Instrucción creada: {instruction['id']}")
            print(f"         - Tool heredada: {instruction['config']['tool']['name']} (id: {instruction['config']['tool']['id']})")
            print(f"         - schema_input items: {len(instruction.get('schema_input', []))}")
            print(f"         - schema_gather name: {instruction.get('schema_gather', {}).get('name', 'N/A')}")
            
            # Guardar el ID de la primera instrucción
            if first_instruction_id is None:
                first_instruction_id = instruction["id"]
        else:
            print(f"      ❌ No se pudo crear instrucción para atributo '{attr['name']}' - no hay tools disponibles")
            print(f"         Esto causará que este atributo no tenga una instrucción en el formulario")
    
    print(f"    📋 Total de instrucciones generadas: {len(instructions)} de {len(attributes_to_process)} atributos")
    
    # Si no hay instrucciones, crear una básica
    if not instructions:
        return _generate_basic_schema(attributes_to_process)
    
    # Actualizar next_instruction_id en las condiciones de cada instrucción
    # Cada instrucción debe apuntar a la siguiente en el flujo
    # Si una instrucción no tiene condiciones, generar una por defecto
    for idx, instruction in enumerate(instructions):
        # Obtener el ID de la siguiente instrucción
        if idx + 1 < len(instructions):
            next_instruction_id = instructions[idx + 1]["id"]
        else:
            # Si es la última instrucción, no hay siguiente
            next_instruction_id = None
        
        schema_conditions = instruction.get("schema_conditions", [])
        
        if schema_conditions:
            # Actualizar next_instruction_id en todas las condiciones existentes
            for condition in schema_conditions:
                condition["next_instruction_id"] = next_instruction_id
        else:
            # Si no hay condiciones, generar una por defecto con type_condition: "by_success"
            # Solo si hay una siguiente instrucción (no para la última)
            if next_instruction_id is not None:
                default_condition = {
                    "id": str(uuid4()),
                    "next_instruction_id": next_instruction_id,
                    "type_condition": "by_success",
                    "logical_operator": None,
                    "validators": []
                }
                instruction["schema_conditions"] = [default_condition]
    
    # Crear el schema completo
    schema = {
        "instructions": instructions,
        "instruction_start": first_instruction_id
    }
    
    return schema


def _generate_basic_schema(attributes: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Genera un schema básico como fallback cuando no hay tools disponibles.
    """
    instruction_id = str(uuid4())
    
    schema_input = []
    schema_gather = []
    
    for attr in attributes:
        input_id = str(uuid4())
        gather_id = str(uuid4())
        
        input_item = {
            "id": input_id,
            "name": attr["name"],
            "place_holder": f"Ingrese {attr['name']}",
            "display_name": attr["name"].replace("_", " ").title(),
            "type_input": attr["type_value"],
            "value": [],
            "is_increasing": False,
            "is_optional": attr["nullable"],
            "is_gather_name": False,
            "is_representative": False,
            "is_hidden": False,
            "is_condition": False
        }
        
        schema_input.append(input_item)
        
        gather_item = {
            "id": gather_id,
            "name": attr["name"],
            "type_value": attr["type_value"],
            "is_module_attr": True,
            "is_unique": attr.get("unique", False),
            "is_optional": attr["nullable"],
            "is_representative": False,
            "visual_table": len(schema_gather) + 1
        }
        
        schema_gather.append(gather_item)
    
    instruction = {
        "id": instruction_id,
        "config": {
            "tool": {
                "id": str(uuid4()),
                "name": "Recolectar datos",
                "on_action": {
                    "location": "core/save_entity",
                    "type_tool": "action",
                    "type": "function"
                }
            },
            "is_gather": True,
            "is_channel": False,
            "condition": "SIMPLE"
        },
        "schema_input": schema_input,
        "schema_gather": schema_gather,
        "schema_variables": [],
        "schema_conditions": [],
        "group_index": 0,
        "metadata": {},
        "type": "ONE_REQUEST",
        "is_not_removable": False
    }
    
    schema = {
        "instructions": [instruction],
        "instruction_start": instruction_id
    }
    
    return schema


def _get_attributes_signature(attributes: List[Dict[str, Any]]) -> str:
    """
    Genera una firma única basada en los atributos de la entidad.
    Esta firma se usa para detectar cambios en la estructura de la entidad.
    
    Args:
        attributes: Lista de diccionarios con información de cada atributo
        
    Returns:
        String con la firma de los atributos (hashable)
    """
    # Crear una representación ordenada y estable de los atributos
    signature_data = []
    for attr in sorted(attributes, key=lambda x: x["name"]):
        signature_data.append({
            "name": attr["name"],
            "type": attr["type"],
            "type_value": attr["type_value"],
            "nullable": attr["nullable"],
            "unique": attr.get("unique", False)
        })
    
    # Convertir a JSON string para obtener una firma estable
    return json.dumps(signature_data, sort_keys=True)


def _get_schema_attributes_signature(schema: Dict[str, Any]) -> str:
    """
    Extrae la firma de los atributos desde un schema existente.
    
    Args:
        schema: Diccionario con el schema del formulario
        
    Returns:
        String con la firma de los atributos del schema
    """
    attributes = []
    instructions = schema.get("instructions", [])
    
    # Buscar la instrucción final que guarda la entidad (tiene schema_gather con todos los campos)
    for instruction in instructions:
        config = instruction.get("config", {})
        tool = config.get("tool", {})
        on_action = tool.get("on_action") or {}
        location = on_action.get("location", "")
        
        # La instrucción que guarda la entidad tiene location "core/save_entity"
        if location == "core/save_entity":
            schema_gather = instruction.get("schema_gather", [])
            # schema_gather puede ser un array (en instrucción de guardar) o un objeto único (en instrucciones individuales)
            if isinstance(schema_gather, list):
                gather_fields = schema_gather
            else:
                gather_fields = [schema_gather] if schema_gather else []
            
            for field in gather_fields:
                if field.get("is_module_attr", False):
                    attributes.append({
                        "name": field.get("name"),
                        "type_value": field.get("type_value"),
                        "nullable": field.get("is_optional", True),
                        "unique": field.get("is_unique", False),
                        "is_logical_identifier": field.get("is_logical_identifier", False),
                    })
            break
    
    # Si no encontramos la instrucción de guardar, intentar extraer de todas las instrucciones
    if not attributes:
        for instruction in instructions:
            schema_gather = instruction.get("schema_gather", [])
            # schema_gather puede ser un array (en instrucción de guardar) o un objeto único (en instrucciones individuales)
            if isinstance(schema_gather, list):
                gather_fields = schema_gather
            else:
                gather_fields = [schema_gather] if schema_gather else []
            
            for field in gather_fields:
                if field.get("is_module_attr", False):
                    # Evitar duplicados
                    field_name = field.get("name")
                    if not any(attr["name"] == field_name for attr in attributes):
                        attributes.append({
                            "name": field_name,
                            "type_value": field.get("type_value"),
                            "nullable": field.get("is_optional", True),
                            "unique": field.get("is_unique", False),
                            "is_logical_identifier": field.get("is_logical_identifier", False),
                        })
    
    # Generar firma similar a _get_attributes_signature (incluye is_logical_identifier para detectar cambios en entityMap)
    signature_data = []
    for attr in sorted(attributes, key=lambda x: x["name"]):
        signature_data.append({
            "name": attr["name"],
            "type_value": attr.get("type_value", "text"),
            "nullable": attr.get("nullable", True),
            "unique": attr.get("unique", False),
            "is_logical_identifier": attr.get("is_logical_identifier", False),
        })
    
    return json.dumps(signature_data, sort_keys=True)


def _get_logical_identifier_fields(schema: Optional[Dict[str, Any]]) -> List[str]:
    """Lista los nombres de campo con is_logical_identifier=true (puede ser 0, 1 o más)."""
    if not schema or not isinstance(schema.get("instructions"), list):
        return []
    out = []
    for instruction in schema["instructions"]:
        schema_gather = instruction.get("schema_gather")
        if schema_gather is None:
            continue
        gather_fields = schema_gather if isinstance(schema_gather, list) else [schema_gather]
        for field in gather_fields:
            if isinstance(field, dict) and field.get("is_logical_identifier") is True:
                name = field.get("name")
                if name and name not in out:
                    out.append(name)
    return out


def get_logical_identifier_field(schema: Optional[Dict[str, Any]], default: Optional[str] = None) -> Optional[str]:
    """
    Devuelve el nombre del campo que tiene is_logical_identifier=true en el schema.
    Solo puede haber uno por formulario. Fuente de verdad para plantilla y carga masiva.

    Args:
        schema: schema_forms.schema (dict con 'instructions')
        default: Si no hay campo con is_logical_identifier, devolver este valor (ej. "id").

    Returns:
        Nombre del campo (ej: 'dni'), o default si no hay o hay más de uno.
    """
    fields = _get_logical_identifier_fields(schema)
    result = fields[0] if len(fields) == 1 else None
    if result is not None:
        return result
    return default


def get_entity_identifier_column(schema: Optional[Dict[str, Any]], default: str = "id") -> str:
    """
    Devuelve la columna a usar como identificador al resolver entidades (ej. para lookup en plantilla/carga masiva).
    Si no hay is_logical_identifier en el schema, usa 'id' por defecto.
    """
    return get_logical_identifier_field(schema, default=default) or default


def get_schema_columns_for_template(schema: Optional[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Devuelve la lista de columnas para plantilla Excel en orden estable.
    Cada item: name, display_name (opcional), type_value, is_optional, is_logical_identifier.
    """
    if not schema or not isinstance(schema.get("instructions"), list):
        return []
    columns = []
    seen = set()
    for instruction in schema["instructions"]:
        schema_gather = instruction.get("schema_gather")
        if schema_gather is None:
            continue
        gather_fields = schema_gather if isinstance(schema_gather, list) else [schema_gather]
        for field in gather_fields:
            if not isinstance(field, dict) or not field.get("is_module_attr", False):
                continue
            name = field.get("name")
            if not name or name in seen:
                continue
            seen.add(name)
            display_name = field.get("display_name") or name
            col = {
                "name": name,
                "display_name": display_name,
                "type_value": field.get("type_value", "text"),
                "is_optional": field.get("is_optional", True),
                "is_logical_identifier": field.get("is_logical_identifier", False),
            }
            if field.get("type_value") == "entity" and field.get("foreign_key_table"):
                col["foreign_key_table"] = field["foreign_key_table"]
            columns.append(col)
    return columns
