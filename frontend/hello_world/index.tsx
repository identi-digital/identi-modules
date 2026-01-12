/**
 * Módulo Hello World - Ejemplo de módulo frontend
 * 
 * 📚 Documentación:
 * - Guía completa: docs/FRONTEND_GUIDE.md
 * - Configuración: docs/CONFIG_YAML_GUIDE.md
 * - Setup: docs/SETUP_GUIDE.md
 */

import { RouteConfig } from '@core/moduleLoader';
import HelloWorld from './src/pages/HelloWorld';

/**
 * Configuración de rutas del módulo
 * 
 * Cada ruta define:
 * - route: Ruta relativa al módulo
 * - component: Componente React a renderizar
 * - name: Nombre a mostrar en el sidebar
 * - sidebar: Si aparece en el sidebar
 * - category: Categoría para agrupar en el sidebar
 */
export const routes: RouteConfig[] = [
  {
    route: '/',
    component: HelloWorld,
    name: 'Hello World',
    sidebar: true,
    category: 'Ejemplos',
    description: 'Módulo de ejemplo Hello World'
  }
];

// Exportar el componente por defecto
export { default } from './src/pages/HelloWorld';

