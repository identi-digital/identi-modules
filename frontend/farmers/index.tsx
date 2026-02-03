// Este archivo exporta todas las rutas que expone el módulo farmers
// Cada ruta debe tener: route, component, name, sidebar, category, description, icon

import { RouteConfig, ModuleMetadata } from '@core/moduleLoader';
import List from './src/pages/List';
import Detail from './src/pages/Detail';
import Deforest from './src/pages/Deforest';

// Constantes de rutas del módulo
export const MODULE_NAME = 'farmers';

// Rutas base (sin el prefijo del módulo)
export const ROUTES = {
  LIST: '/',
  DETAIL: '/detail/:id',
  DEFOREST: '/deforest',
} as const;

// Configuración del módulo: variables esperadas
export const moduleConfig: ModuleMetadata = {
  name: MODULE_NAME,
  expectedVariables: {
    idFormFarmers: {
      type: 'string',
      required: true,
      description: 'ID del formulario de registro de productores',
    },
    apiTimeout: {
      type: 'number',
      required: false,
      default: 3000,
      description: 'Timeout para llamadas API en milisegundos',
    },
    enableCache: {
      type: 'boolean',
      required: false,
      default: true,
      description: 'Habilitar caché de datos de productores',
    },
  },
};

// Funciones helper para construir rutas completas
export const getModuleRoute = (route: string): string => {
  return `/${MODULE_NAME}${route === '/' ? '' : route}`;
};

export const getDetailRoute = (id: number | string): string => {
  return `/${MODULE_NAME}/detail/${id}`;
};

export const getListRoute = (): string => {
  return `/${MODULE_NAME}`;
};

export const getDeforestRoute = (): string => {
  return `/${MODULE_NAME}/deforest`;
};

export const routes: RouteConfig[] = [
  {
    route: ROUTES.LIST,
    component: List,
    name: 'Productores',
    sidebar: true,
    category: 'Actores',
    description: 'Modulo de Agricultores',
    icon: 'person',
  },
  {
    route: ROUTES.DETAIL,
    component: Detail,
    name: 'Detalle de Agricultor',
    sidebar: false,
    category: 'Actores',
    description: 'Vista detallada de un agricultor',
  },
  {
    route: ROUTES.DEFOREST,
    component: Deforest,
    name: 'Deforestación',
    sidebar: true,
    category: 'Módulos',
    description: 'Módulo de deforestación',
  },
];

// Exportar el componente principal del módulo (opcional, para compatibilidad)
export { default } from './src/pages/List';
