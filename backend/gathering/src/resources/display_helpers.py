"""Helper functions for display name resolution"""

def resolve_display_name(obj) -> str:
    """
    Resuelve el nombre a mostrar de un objeto relacionado.
    Prioridad: name > first_name + last_name > code > id
    """
    if not obj:
        return ""
    
    # Si tiene atributo 'name'
    if hasattr(obj, 'name') and obj.name:
        return str(obj.name)
    
    # Si tiene first_name y last_name
    if hasattr(obj, 'first_name') and hasattr(obj, 'last_name'):
        first_name = obj.first_name or ""
        last_name = obj.last_name or ""
        display = f"{first_name} {last_name}".strip()
        if display:
            return display
    
    # Si tiene code
    if hasattr(obj, 'code') and obj.code:
        return str(obj.code)
    
    # Como último recurso, devolver el ID
    if hasattr(obj, 'id'):
        return str(obj.id)
    
    return ""
