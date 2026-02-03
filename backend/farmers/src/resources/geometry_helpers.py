"""Helper functions for geometry and GeoJSON conversions"""
from typing import Optional
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy import func as sql_func
import json


def geometry_to_geojson(geometry, db: Session) -> Optional[dict]:
    """
    Convierte una geometría de PostGIS a formato GeoJSON.
    
    Args:
        geometry: Objeto geometry de GeoAlchemy2
        db: Sesión de base de datos
        
    Returns:
        Diccionario con formato GeoJSON o None
    """
    if not geometry:
        return None
    
    try:
        # Usar ST_AsGeoJSON para convertir a GeoJSON
        result = db.execute(
            text("SELECT ST_AsGeoJSON(:geom)"),
            {"geom": str(geometry)}
        ).scalar()
        
        if result:
            return json.loads(result)
        return None
    except Exception as e:
        print(f"❌ Error al convertir geometry a GeoJSON: {e}")
        return None


def geojson_to_geometry(geojson: dict):
    """
    Convierte un GeoJSON a geometry de PostGIS.
    
    Args:
        geojson: Diccionario con formato GeoJSON
        
    Returns:
        Objeto WKTElement para guardar en la BD
    """
    from geoalchemy2 import WKTElement
    
    # Convertir GeoJSON a string JSON
    geojson_str = json.dumps(geojson)
    
    # Usar ST_GeomFromGeoJSON para convertir a geometry
    # El SRID 4326 es WGS84 (estándar para GPS)
    return sql_func.ST_GeomFromGeoJSON(geojson_str, type_=sql_func.Geometry)
