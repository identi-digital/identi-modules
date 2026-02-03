import { RouteConfig } from '@core/moduleLoader';
import List from './src/pages/List';
import Detail from './src/pages/Detail';

export const MODULE_NAME = 'Técnicos de campo';
export const MODULE_ACTOR_DISPLAY_NAME = 'Técnico de campo';
export const MODULE_ACTOR_DISPLAY_NAME_PLURAL = 'Técnicos de campo';

// Rutas base (sin el prefijo del módulo)
export const ROUTES = {
  LIST: '/',
  DETAIL: '/detail/:id',
} as const;

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

export const routes: RouteConfig[] = [
  {
    route: ROUTES.LIST,
    component: List,
    name: 'Técnicos de campo',
    sidebar: true,
    category: 'Actores',
    description: 'Modulo de Técnicos de campo',
    icon: 'person',
  },
  {
    route: ROUTES.DETAIL,
    component: Detail,
    name: 'Detalle del técnico de campo',
    sidebar: false,
    category: 'Actores',
    description: 'Vista detallada de un técnico de campo',
  },
];

// Exportar el componente principal del módulo (opcional, para compatibilidad)
export { default } from './src/pages/List';
