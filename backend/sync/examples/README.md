# Ejemplos - Módulo Sync

Scripts de ejemplo para usar el módulo sync.

## 📋 Scripts Disponibles

### check_app_config.py

Verifica que la configuración de Parse Server se haya guardado correctamente en `app_config`.

**Uso:**

```bash
# Desde la raíz del proyecto
python backend/modules/sync/examples/check_app_config.py
```

**Qué hace:**
1. Consulta la configuración de Parse para `core_db` desde `app_config`
2. Muestra todas las configuraciones de Parse guardadas
3. Demuestra el uso del método `get_parse_config_from_db()` del SyncFacade

**Salida esperada:**

```
🔍 Consultando configuración de Parse Server para 'core_db'...
============================================================
✅ Parse Host encontrado:
   Clave: parser-core_db-host
   Valor: http://parse:1337/parse

✅ App ID encontrado:
   Clave: parser-core_db-app-id
   Valor: identiAppidenti
============================================================
✅ Configuración completa de Parse Server encontrada en app_config
```

---

## 🔧 Solución de Problemas

### "Configuración incompleta"

Si ves este mensaje, significa que el módulo sync no ha guardado la configuración todavía.

**Solución:**
1. Asegúrate de que sync esté habilitado en `config.yaml`:
   ```yaml
   sync:
     enabled: true
   ```

2. Reinicia el backend:
   ```bash
   docker-compose restart backend
   ```

3. Verifica los logs:
   ```bash
   docker-compose logs backend | grep SyncFacade
   ```

Deberías ver:
```
💾 [SyncFacade] Guardando configuración en app_config para core_db
   ✅ Configuración guardada en app_config
```

---

## 📚 Más Información

Ver [README_NEW.md](../README_NEW.md) para documentación completa del módulo sync.
