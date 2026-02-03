// Este archivo exporta todas las rutas que expone el módulo farmers
// Cada ruta debe tener: route, component, name, sidebar, category, description, icon

import { RouteConfig } from '@core/moduleLoader';

import ListPage from './src/pages/List/index';
import DetailPage from './src/pages/Detail/index';

// Constantes de rutas del módulo
export const MODULE_NAME = 'warehouse';

export const MODULE_ENTITY_DISPLAY_NAME = 'Almacén';
export const MODULE_ENTITY_DISPLAY_NAME_PLURAL = 'Almacenes';

export const ROUTES = {
  LIST: '/',
  DETAIL: '/detail/:store_center_id',
} as const;

export const getModuleRoute = (route: string): string => {
  return `/${MODULE_NAME}${route === '/' ? '' : route}`;
};

export const getListRoute = (): string => {
  return `/${MODULE_NAME}`;
};

export const getDetailRoute = (id: number | string): string => {
  return `/${MODULE_NAME}/detail/${id}`;
};

export const routes: RouteConfig[] = [
  {
    route: ROUTES.LIST,
    component: ListPage,
    name: 'Almacenaje',
    sidebar: true,
    category: 'Módulos',
    description: 'Modulo de almacenaje',
    icon: 'home',
  },
  {
    route: ROUTES.DETAIL,
    component: DetailPage,
    name: `Ver ${MODULE_ENTITY_DISPLAY_NAME}`,
    sidebar: false,
    category: '',
    description: `Vista de ${MODULE_ENTITY_DISPLAY_NAME}`,
  },
];

// Exportar el componente principal del módulo (opcional, para compatibilidad)
export { default } from './src/pages/List/index';
