"""
Función para procesar el schema y agregar data_input a metadata de cada instrucción
"""
from typing import Dict, Any, List, Optional


def process_schema_add_data_input_to_metadata(schema: Dict[str, Any]) -> Dict[str, Any]:
    """
    Procesa el schema completo y agrega data_input a metadata de cada instrucción.
    
    El data_input se genera unificando schema_input y schema_input_advanced,
    y se agrega dentro de metadata de cada instrucción.
    
    Args:
        schema: El schema completo con instructions (array) y instruction_start (UUID)
        
    Returns:
        El schema modificado con data_input en metadata de cada instrucción
    """
    if not schema or not isinstance(schema, dict):
        return schema
    
    # Extraer información básica
    instructions = schema.get("instructions", [])
    
    if not isinstance(instructions, list):
        return schema
    
    # Procesar cada instrucción y agregar data_input a metadata
    for instruction in instructions:
        if not instruction or not isinstance(instruction, dict):
            continue
        
        try:
            # Asegurar que metadata existe
            if "metadata" not in instruction:
                instruction["metadata"] = {}
            
            # Unificar schema_input y schema_input_advanced, luego procesar a data_input
            data_input = _process_inputs_to_data_input(instruction)
            if data_input:
                instruction["metadata"]["data_input"] = data_input
        except Exception as e:
            # Si hay un error procesando una instrucción, continuar con las demás
            print(f"⚠️  Error procesando instrucción para data_input: {e}")
            import traceback
            traceback.print_exc()
            continue
    
    return schema


def _process_inputs_to_data_input(instruction: Dict[str, Any]) -> Dict[str, Any]:
    """
    Unifica schema_input y schema_input_advanced, luego genera data_input.
    
    Primero unifica ambos arrays en uno solo, luego procesa cada input.
    data_input será un objeto simple con formato {<name>: <value>}
    donde:
    - name: viene del campo 'name' del input (será la key)
    - value: viene del campo 'value' del input (procesado según su tipo y is_increasing)
    
    Si hay schema_input_advanced, se unifica con schema_input antes de procesar.
    
    Args:
        instruction: La instrucción completa que puede tener schema_input o schema_input_advanced
        
    Returns:
        Dict con formato {<name>: <value>} o {} si no hay inputs
    """
    data_input = {}
    
    if not instruction or not isinstance(instruction, dict):
        return data_input
    
    # Unificar schema_input y schema_input_advanced
    unified_inputs = []
    
    # Agregar schema_input si existe
    schema_input = instruction.get("schema_input")
    if schema_input and isinstance(schema_input, list):
        unified_inputs.extend(schema_input)
    
    # Agregar schema_input_advanced si existe (tiene prioridad si hay duplicados)
    schema_input_advanced = instruction.get("schema_input_advanced")
    if schema_input_advanced and isinstance(schema_input_advanced, list):
        unified_inputs.extend(schema_input_advanced)
    
    # Procesar cada input unificado
    for input_item in unified_inputs:
        if not input_item or not isinstance(input_item, dict):
            continue
        
        try:
            name = input_item.get("name")
            if name:
                # Para inputs especiales, usar valores específicos en lugar del value
                if name == "title":
                    # Usar display_name del input (que viene del entityMap displayName)
                    value = input_item.get("display_name")
                    if not value:
                        # Fallback al valor extraído si no hay display_name
                        value = _extract_input_value(input_item)
                elif name == "description":
                    # Para description, usar display_name del input (que viene del entityMap description)
                    # porque en form_auto_creator.py se establece display_name con field_description
                    value = input_item.get("display_name")
                    if not value:
                        # Fallback a description si no hay display_name
                        value = input_item.get("description")
                        if not value:
                            # Fallback al valor extraído si no hay ninguno
                            value = _extract_input_value(input_item)
                elif name == "entity_type":
                    # Para entity_type, extraer el valor directamente
                    # Puede estar en formato directo (string) o en formato lista
                    value = _extract_input_value(input_item)
                    # Si no se extrajo, intentar obtener directamente del value
                    if value is None:
                        raw_value = input_item.get("value")
                        if isinstance(raw_value, str):
                            value = raw_value
                        elif isinstance(raw_value, list) and len(raw_value) > 0:
                            if isinstance(raw_value[0], dict):
                                value = raw_value[0].get("value")
                            else:
                                value = raw_value[0]
                    # Log para debugging
                    if value:
                        print(f"      📝 data_input['entity_type'] = {value}")
                elif name == "display_name":
                    # Para display_name (usado en tool "Entidades"), extraer el valor
                    # Puede estar en formato directo (string) o en formato lista
                    value = _extract_input_value(input_item)
                    # Si no se extrajo, intentar obtener directamente del value o display_name
                    if value is None:
                        value = input_item.get("display_name")
                        if not value:
                            raw_value = input_item.get("value")
                            if isinstance(raw_value, str):
                                value = raw_value
                            elif isinstance(raw_value, list) and len(raw_value) > 0:
                                if isinstance(raw_value[0], dict):
                                    value = raw_value[0].get("value")
                                else:
                                    value = raw_value[0]
                    # Log para debugging
                    if value:
                        print(f"      📝 data_input['display_name'] = {value}")
                elif name == "filter":
                    # Para filter (usado en tool "Entidades"), extraer el valor
                    # Puede estar en formato directo (string) o en formato lista
                    value = _extract_input_value(input_item)
                    # Si no se extrajo, intentar obtener directamente del value
                    if value is None:
                        raw_value = input_item.get("value")
                        if isinstance(raw_value, str):
                            value = raw_value
                        elif isinstance(raw_value, list) and len(raw_value) > 0:
                            if isinstance(raw_value[0], dict):
                                value = raw_value[0].get("value")
                            else:
                                value = raw_value[0]
                    # Log para debugging
                    if value:
                        print(f"      📝 data_input['filter'] = {value}")
                else:
                    # Para otros inputs, usar el valor extraído normalmente
                    value = _extract_input_value(input_item)
                
                if value is not None:
                    data_input[name] = value
        except Exception as e:
            # Si hay un error procesando un input, continuar con los demás
            print(f"⚠️  Error procesando input '{input_item.get('name', 'unknown')}': {e}")
            continue
    
    return data_input


def _extract_input_value(input_item: Dict[str, Any]) -> Any:
    """
    Extrae el valor de un input según su tipo y estructura.
    
    Tipos de input soportados: text, number, boolean, media, list, geojson, entity, option, dict
    
    Reglas:
    - Si is_increasing = true: el value es SIEMPRE una lista
    - Si is_increasing = false: el value puede ser un valor directo (string, number, etc.) o una lista
    - Si type_input = "dict": el value es un schema_input recursivo (procesar recursivamente)
    
    Args:
        input_item: El item del input con su estructura completa
        
    Returns:
        El valor extraído (puede ser string, number, bool, dict, list, etc.)
    """
    raw_value = input_item.get("value")
    type_input = input_item.get("type_input", "text")
    is_increasing = input_item.get("is_increasing", False)
    
    # Si no hay valor, usar value_defect si existe
    if raw_value is None or (isinstance(raw_value, list) and len(raw_value) == 0):
        value_defect = input_item.get("value_defect")
        if value_defect is not None:
            # Si is_increasing es true, value_defect debe ser una lista
            if is_increasing and not isinstance(value_defect, list):
                return [value_defect]
            return value_defect
        # Si is_increasing es true y no hay valor, retornar lista vacía
        if is_increasing:
            return []
        return None
    
    # Normalizar value_array: si raw_value no es una lista, convertirla
    # Esto maneja el caso donde el value se establece directamente como string/number
    if isinstance(raw_value, list):
        value_array = raw_value
    else:
        # Si raw_value es un valor directo (string, number, bool, etc.), convertirlo a formato lista
        value_array = [raw_value]
    
    # Si type_input es "dict", procesar recursivamente
    if type_input == "dict":
        if is_increasing:
            # Lista de objetos, cada uno es un schema_input recursivo
            result = []
            for value_obj in value_array:
                if isinstance(value_obj, dict):
                    # El value es un schema_input completo, procesarlo recursivamente
                    nested_input = value_obj.get("value")
                    if isinstance(nested_input, list):
                        # Procesar cada input del schema_input anidado
                        nested_data_input = {}
                        for nested_item in nested_input:
                            nested_name = nested_item.get("name")
                            if nested_name:
                                nested_value = _extract_input_value(nested_item)
                                nested_data_input[nested_name] = nested_value
                        result.append(nested_data_input)
            return result
        else:
            # Un solo objeto, procesar recursivamente
            if len(value_array) > 0:
                value_obj = value_array[0]
                if isinstance(value_obj, dict):
                    nested_input = value_obj.get("value")
                    if isinstance(nested_input, list):
                        # Procesar cada input del schema_input anidado
                        nested_data_input = {}
                        for nested_item in nested_input:
                            nested_name = nested_item.get("name")
                            if nested_name:
                                nested_value = _extract_input_value(nested_item)
                                nested_data_input[nested_name] = nested_value
                        return nested_data_input
            return {}
    
    # Para otros tipos de input, extraer el valor según is_increasing
    if is_increasing:
        # SIEMPRE retornar una lista cuando is_increasing es true
        extracted_values = []
        for value_obj in value_array:
            if isinstance(value_obj, dict):
                extracted_value = value_obj.get("value")
                extracted_values.append(extracted_value)
            else:
                # Si no es dict, agregar directamente (puede ser string, number, etc.)
                extracted_values.append(value_obj)
        return extracted_values
    else:
        # Un solo valor cuando is_increasing es false
        if len(value_array) > 0:
            value_obj = value_array[0]
            if isinstance(value_obj, dict):
                # Formato: {"value": "actual_value"}
                return value_obj.get("value")
            else:
                # Si no es dict, retornar directamente (string, number, bool, etc.)
                # Esto maneja el caso donde value se establece directamente como string
                return value_obj
    
    return None
