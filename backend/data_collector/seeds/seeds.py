"""
Seeds data for data_collector module.
This module contains initial data that will be inserted during migrations.

Structure:
SEEDS = {
    "table_name": [
        {row_data},
        {row_data}
    ]
}
"""
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.dialects.postgresql import JSONB
import json
from pathlib import Path


def load_tools_from_json() -> List[Dict[str, Any]]:
    """
    Carga las tools desde tools.json.
    Las tools están almacenadas en src/utils/tools.json para facilitar su mantenimiento.
    
    Returns:
        Lista de diccionarios con las tools
    """
    try:
        # Obtener la ruta del archivo tools.json
        current_file = Path(__file__).resolve()
        tools_path = current_file.parent.parent / "src" / "utils" / "tools.json"
        
        if not tools_path.exists():
            print(f"⚠️  Advertencia: tools.json no encontrado en {tools_path}")
            return []
        
        with open(tools_path, 'r', encoding='utf-8') as f:
            tools = json.load(f)
            # tools.json es ahora una lista directa, no un objeto con action_tools
            if not isinstance(tools, list):
                print(f"⚠️  Advertencia: tools.json no es una lista, formato incorrecto")
                return []
            
            # Convertir strings ISO de datetime a objetos datetime para compatibilidad con seeds
            def convert_datetime_strings(obj):
                if isinstance(obj, dict):
                    result = {}
                    for k, v in obj.items():
                        if k in ("created_at", "updated_at") and isinstance(v, str):
                            try:
                                # Intentar parsear como ISO format
                                result[k] = datetime.fromisoformat(v.replace('Z', '+00:00'))
                            except (ValueError, AttributeError):
                                result[k] = v
                        else:
                            result[k] = convert_datetime_strings(v)
                    return result
                elif isinstance(obj, list):
                    return [convert_datetime_strings(item) for item in obj]
                return obj
            
            return convert_datetime_strings(tools)
    except Exception as e:
        print(f"⚠️  Error al cargar tools desde tools.json: {e}")
        import traceback
        traceback.print_exc()
        return []


# Seeds structure: table_name -> list of rows to insert
# Data must be already transformed to match the model schema
# Las tools se cargan desde tools.json para mantener coherencia
SEEDS: Dict[str, List[Dict[str, Any]]] = {
    "action_tools": load_tools_from_json()
}


def get_seeds() -> Dict[str, List[Dict[str, Any]]]:
    """
    Returns the SEEDS dictionary containing all seed data organized by table name.
    
    Returns:
        Dict mapping table names to lists of row data
    """
    return SEEDS
