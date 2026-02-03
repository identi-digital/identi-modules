// Este archivo exporta todas las rutas que expone el módulo farmers
// Cada ruta debe tener: route, component, name, sidebar, category, description, icon

import { RouteConfig } from '@core/moduleLoader';

import ListPage from './src/pages/List/index';
import DetailPage from './src/pages/Detail/index';
import GatherersPage from './src/pages/Gatherers';

// Constantes de rutas del módulo
export const MODULE_NAME = 'gathering';

export const MODULE_ACTOR_DISPLAY_NAME = 'Técnico comercial';
export const MODULE_ACTOR_DISPLAY_NAME_PLURAL = 'Técnicos comerciales';
export const MODULE_ENTITY_DISPLAY_NAME = 'Centro de beneficio';
export const MODULE_ENTITY_DISPLAY_NAME_PLURAL = 'Centros de beneficio';

// Rutas base (sin el prefijo del módulo)
export const ROUTES = {
  LIST: '/',
  DETAIL: '/detail/:gathering_id',
  GATHERERS: '/gatherers',
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

export const getGatherersRoute = (): string => {
  return `/${MODULE_NAME}/gatherers`;
};

export const routes: RouteConfig[] = [
  {
    route: ROUTES.LIST,
    component: ListPage,
    name: 'Acopio',
    sidebar: true,
    category: 'Módulos',
    description: 'Modulo de acopio',
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
  {
    route: ROUTES.GATHERERS,
    component: GatherersPage,
    name: `${MODULE_ACTOR_DISPLAY_NAME_PLURAL}`,
    sidebar: true,
    category: 'Actores',
    description: `${MODULE_ENTITY_DISPLAY_NAME} - ${MODULE_ACTOR_DISPLAY_NAME_PLURAL}`,
    icon: 'person',
  },
];

// Exportar el componente principal del módulo (opcional, para compatibilidad)
export { default } from './src/pages/List/index';
