"""
Funciones auxiliares para aplicar filtros a queries de entidades.
"""
from typing import Optional, Any
from sqlalchemy.orm import Query
from sqlalchemy.orm import Session


def apply_filter(
    query: Query,
    model_class: Any,
    filter_str: str,
    db: Session,
    entity_name: str,
    container: Any
) -> Optional[Query]:
    """
    Aplica uno o múltiples filtros a la query según el formato especificado.
    
    Formatos soportados:
    - Filtros simples: 'field=value' (ej: 'country_id=PE')
    - Múltiples filtros simples separados por coma: 'field1=value1,field2=value2' (ej: 'country_id=PE,status=active')
    - Filtros con entidades: 'entity.field=other_entity.field' (ej: 'farmers.value=countries.value')
    - Múltiples filtros con entidades separados por coma: 'entity1.field1=entity2.field1, entity3.field2=entity4.field2'
      (ej: 'farmers.value=countries.value, farmers.value2=departments.value3')
    
    IMPORTANTE: Al menos una de las entidades en cada filtro debe ser la entidad actual que se está consultando.
    Por ejemplo, si se consulta 'districts', un filtro válido sería:
    - 'districts.country_id=countries.id' (districts es la entidad actual)
    - 'farmers.country_id=districts.country_id' (districts es la entidad actual)
    Pero NO sería válido: 'farmers.value=countries.value' (ninguna es districts)
    
    Args:
        query: Query de SQLAlchemy a filtrar
        model_class: Clase del modelo de la entidad actual
        filter_str: String con uno o múltiples filtros en formato 'left=right' separados por coma
        db: Sesión de base de datos
        entity_name: Nombre de la entidad actual que se está consultando
        container: Container de dependencias para buscar modelos
        
    Returns:
        Query filtrada o None si hay error
    """
    try:
        if not filter_str or '=' not in filter_str:
            return query
        
        # Dividir por comas para soportar múltiples filtros
        filter_parts = [f.strip() for f in filter_str.split(',')]
        
        # Aplicar cada filtro individualmente
        for single_filter in filter_parts:
            if not single_filter:
                continue
            query = _apply_single_filter(query, model_class, single_filter, db, entity_name, container)
        
        return query
    except Exception as e:
        print(f"      ⚠️  Error al aplicar filtros '{filter_str}': {e}")
        import traceback
        traceback.print_exc()
        return query


def _apply_single_filter(
    query: Query,
    model_class: Any,
    filter_str: str,
    db: Session,
    entity_name: str,
    container: Any
) -> Query:
    """
    Aplica un solo filtro a la query y valida que al menos una entidad sea la actual.
    
    Args:
        query: Query de SQLAlchemy a filtrar
        model_class: Clase del modelo de la entidad actual
        filter_str: String con un solo filtro en formato 'left=right'
        db: Sesión de base de datos
        entity_name: Nombre de la entidad actual que se está consultando
        container: Container de dependencias para buscar modelos
        
    Returns:
        Query filtrada
    """
    try:
        if not filter_str or '=' not in filter_str:
            return query
        
        parts = filter_str.split('=', 1)
        if len(parts) != 2:
            return query
        
        left_side = parts[0].strip()
        right_side = parts[1].strip()
        
        # Caso 1: Filtro simple 'field=value'
        # Este caso siempre es válido porque el campo pertenece a la entidad actual
        if '.' not in left_side:
            field_name = left_side
            value = right_side
            
            # Verificar que el campo existe en el modelo
            if hasattr(model_class, field_name):
                field_column = getattr(model_class, field_name)
                query = query.filter(field_column == value)
                print(f"      ✓ Filtro aplicado: {field_name} = {value}")
            else:
                print(f"      ⚠️  Campo '{field_name}' no existe en el modelo, ignorando filtro")
            return query
        
        # Caso 2: 'entity.field=value' o 'entity.field=current_entity.field'
        left_parts = left_side.split('.', 1)
        if len(left_parts) != 2:
            return query
        
        left_entity = left_parts[0].strip()
        left_field = left_parts[1].strip()
        
        # Verificar si right_side es otra entidad o un valor
        if '.' in right_side:
            # Caso 3: Comparación entre campos 'left_entity.field=right_entity.field'
            # Ejemplo: 'farmer.country_id=districts.country_id' o 'districts.province_id={{farmers.province_id}}'
            right_parts = right_side.split('.', 1)
            if len(right_parts) != 2:
                return query
            
            right_entity = right_parts[0].strip()
            right_field = right_parts[1].strip()
            
            # Remover placeholders {{}} si existen
            if right_field.startswith('{{') and right_field.endswith('}}'):
                right_field = right_field[2:-2].strip()
                # Si tiene formato entity.field dentro del placeholder, extraerlo
                if '.' in right_field:
                    placeholder_parts = right_field.split('.', 1)
                    right_entity = placeholder_parts[0].strip()
                    right_field = placeholder_parts[1].strip()
            
            # VALIDACIÓN: Al menos una de las entidades debe ser la entidad actual
            left_is_current = left_entity.lower() == entity_name.lower()
            right_is_current = right_entity.lower() == entity_name.lower()
            
            if not left_is_current and not right_is_current:
                print(f"      ⚠️  Filtro rechazado: ninguna entidad es la actual. Filtro: '{filter_str}', Entidad actual: '{entity_name}'")
                return query
            
            # Determinar qué entidad es la actual y cuál necesita join
            # Si right_entity es la entidad actual, hacer join con left_entity
            if right_is_current:
                # Buscar el modelo de left_entity
                from .form_auto_creator import find_model_by_entity_name
                left_model_class = find_model_by_entity_name(left_entity.lower(), container)
                
                if left_model_class and hasattr(left_model_class, left_field) and hasattr(model_class, right_field):
                    left_field_column = getattr(left_model_class, left_field)
                    right_field_column = getattr(model_class, right_field)
                    
                    # Hacer join y filtrar: left_entity.field = current_entity.field
                    query = query.join(left_model_class, left_field_column == right_field_column)
                    query = query.filter(left_model_class.disabled_at.is_(None))
                    print(f"      ✓ Filtro con join aplicado: {left_entity}.{left_field} = {right_entity}.{right_field}")
                else:
                    print(f"      ⚠️  No se pudo aplicar filtro con join: modelo o campos no encontrados")
            # Si left_entity es la entidad actual, hacer join con right_entity
            elif left_is_current:
                # Buscar el modelo de right_entity
                from .form_auto_creator import find_model_by_entity_name
                right_model_class = find_model_by_entity_name(right_entity.lower(), container)
                
                if right_model_class and hasattr(model_class, left_field) and hasattr(right_model_class, right_field):
                    left_field_column = getattr(model_class, left_field)
                    right_field_column = getattr(right_model_class, right_field)
                    
                    # Hacer join y filtrar: current_entity.field = right_entity.field
                    query = query.join(right_model_class, left_field_column == right_field_column)
                    query = query.filter(right_model_class.disabled_at.is_(None))
                    print(f"      ✓ Filtro con join aplicado: {left_entity}.{left_field} = {right_entity}.{right_field}")
                else:
                    print(f"      ⚠️  No se pudo aplicar filtro con join: modelo o campos no encontrados")
            # Este caso no debería ocurrir debido a la validación anterior, pero lo mantenemos por seguridad
            return query
        else:
            # Caso 2: 'entity.field=value'
            # VALIDACIÓN: left_entity debe ser la entidad actual
            if left_entity.lower() != entity_name.lower():
                print(f"      ⚠️  Filtro rechazado: la entidad '{left_entity}' no es la entidad actual '{entity_name}'. Filtro: '{filter_str}'")
                return query
            
            # Si left_entity es la entidad actual, aplicar filtro directo
            if hasattr(model_class, left_field):
                field_column = getattr(model_class, left_field)
                query = query.filter(field_column == right_side)
                print(f"      ✓ Filtro aplicado: {left_field} = {right_side}")
            else:
                print(f"      ⚠️  Campo '{left_field}' no existe en el modelo, ignorando filtro")
            return query
            
    except Exception as e:
        print(f"      ⚠️  Error al aplicar filtro '{filter_str}': {e}")
        import traceback
        traceback.print_exc()
        return query
