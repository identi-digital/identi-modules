"""
Script de ejemplo: Consultar configuración de Parse Server desde app_config

Este script muestra cómo consultar la configuración de Parse Server
que el SyncFacade guarda automáticamente en la tabla app_config.
"""

from core.container import Container
from core.models.core.app_config import AppConfigModel


def check_parse_config_in_db(database_key: str = 'core_db'):
    """
    Verifica si la configuración de Parse está en app_config.
    
    Args:
        database_key: Clave de la base de datos (default: 'core_db')
    """
    print(f"\n🔍 Consultando configuración de Parse Server para '{database_key}'...")
    print("=" * 60)
    
    try:
        # Obtener sesión de BD
        container = Container()
        db = container.get(database_key, "databases")
        
        if not db:
            print(f"❌ No se pudo obtener sesión de BD para {database_key}")
            return
        
        # Consultar host
        key_host = f"parser-{database_key}-host"
        host_record = db.query(AppConfigModel).filter(
            AppConfigModel.key == key_host
        ).first()
        
        # Consultar app_id
        key_app_id = f"parser-{database_key}-app-id"
        app_id_record = db.query(AppConfigModel).filter(
            AppConfigModel.key == key_app_id
        ).first()
        
        # Mostrar resultados
        if host_record:
            print(f"✅ Parse Host encontrado:")
            print(f"   Clave: {key_host}")
            print(f"   Valor: {host_record.value}")
        else:
            print(f"❌ Parse Host NO encontrado (clave: {key_host})")
        
        print()
        
        if app_id_record:
            print(f"✅ App ID encontrado:")
            print(f"   Clave: {key_app_id}")
            print(f"   Valor: {app_id_record.value}")
        else:
            print(f"❌ App ID NO encontrado (clave: {key_app_id})")
        
        print("=" * 60)
        
        # Verificar si ambos están presentes
        if host_record and app_id_record:
            print("✅ Configuración completa de Parse Server encontrada en app_config")
            return {
                'host': host_record.value,
                'app_id': app_id_record.value
            }
        else:
            print("⚠️  Configuración incompleta. Verifica que el módulo sync esté inicializado.")
            return None
        
    except Exception as e:
        print(f"❌ Error consultando app_config: {e}")
        import traceback
        traceback.print_exc()
        return None


def check_all_parse_configs():
    """
    Consulta todas las configuraciones de Parse en app_config.
    """
    print("\n🔍 Consultando todas las configuraciones de Parse en app_config...")
    print("=" * 60)
    
    try:
        container = Container()
        db = container.get('core_db', "databases")
        
        if not db:
            print("❌ No se pudo obtener sesión de BD")
            return
        
        # Buscar todas las claves que empiezan con 'parser-'
        all_parser_configs = db.query(AppConfigModel).filter(
            AppConfigModel.key.like('parser-%')
        ).all()
        
        if not all_parser_configs:
            print("⚠️  No se encontraron configuraciones de Parse en app_config")
            print("   Asegúrate de que el módulo sync esté habilitado y el backend haya iniciado.")
            return
        
        print(f"📋 Encontradas {len(all_parser_configs)} configuraciones:\n")
        
        for config in all_parser_configs:
            print(f"   {config.key:<30} = {config.value}")
        
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()


def use_sync_facade_method():
    """
    Ejemplo usando el método del SyncFacade.
    """
    print("\n🔍 Usando método del SyncFacade...")
    print("=" * 60)
    
    try:
        from backend.modules.sync.src.facade import SyncFacade
        
        facade = SyncFacade()
        
        # Consultar configuración desde app_config
        parse_config = facade.get_parse_config_from_db('core_db')
        
        if parse_config:
            print("✅ Configuración obtenida exitosamente:")
            print(f"   Host: {parse_config['host']}")
            print(f"   App ID: {parse_config['app_id']}")
        else:
            print("❌ No se pudo obtener configuración desde app_config")
        
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("  VERIFICACIÓN DE CONFIGURACIÓN DE PARSE EN APP_CONFIG")
    print("=" * 60)
    
    # 1. Verificar configuración para core_db
    check_parse_config_in_db('core_db')
    
    # 2. Consultar todas las configuraciones
    check_all_parse_configs()
    
    # 3. Usar método del SyncFacade
    use_sync_facade_method()
    
    print("\n✅ Verificación completada\n")
