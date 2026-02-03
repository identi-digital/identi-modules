// Este archivo exporta todas las rutas que expone el módulo farmers
// Cada ruta debe tener: route, component, name, sidebar, category, description, icon

import { RouteConfig } from '@core/moduleLoader';
import ListPage from './src/pages/List/index';
import CreatePage from './src/pages/Create/index';
import MassiveLoadPage from './src/pages/MassiveLoad';
import RecordsPage from './src/pages/Records/index';
import EditPage from './src/pages/Edit/index';

// Constantes de rutas del módulo
export const MODULE_NAME = 'forms';

// Rutas base (sin el prefijo del módulo)
export const ROUTES = {
  LIST: '/',
  CREATE: '/create',
  RECORDS: '/records/:form_id',
  MASSIVE_LOAD: '/massive-load/:form_id',
  EDIT: '/edit/:id_module',
} as const;

// Funciones helper para construir rutas completas
export const getModuleRoute = (route: string): string => {
  return `/${MODULE_NAME}${route === '/' ? '' : route}`;
};

export const getRecordsRoute = (id: number | string): string => {
  return `/${MODULE_NAME}/records/${id}`;
};
export const getMassiveLoadRoute = (id: number | string): string => {
  return `/${MODULE_NAME}/massive-load/${id}`;
};

export const getListRoute = (): string => {
  return `/${MODULE_NAME}`;
};

export const getCreateRoute = (): string => {
  return `/${MODULE_NAME}/create`;
};
export const getUpdateRoute = (id: string): string => {
  return `/${MODULE_NAME}/create/${id}`;
};

export const getEditRoute = (id: string): string => {
  return `/${MODULE_NAME}/edit/${id}`;
};

export const routes: RouteConfig[] = [
  {
    route: ROUTES.LIST,
    component: ListPage,
    name: 'Formularios',
    sidebar: true,
    category: 'Recolección de datos',
    description: 'Modulo de formularios',
    icon: 'bar_chart',
  },
  {
    route: ROUTES.CREATE,
    component: CreatePage,
    name: 'Crear formulario',
    sidebar: false,
    category: '',
    description: 'Vista de creación de formularios',
  },
  {
    route: ROUTES.RECORDS,
    component: RecordsPage,
    name: 'Ver registros',
    sidebar: false,
    category: '',
    description: 'Vista de registros de formularios',
  },
  {
    route: ROUTES.MASSIVE_LOAD,
    component: MassiveLoadPage,
    name: 'Carga masiva',
    sidebar: false,
    category: '',
    description: 'Vista de carga masiva de formularios',
  },
  {
    route: ROUTES.EDIT,
    component: EditPage,
    name: 'Editar formulario',
    sidebar: false,
    category: '',
    description: 'Vista de edición de formularios',
  },
];

// Exportar el componente principal del módulo (opcional, para compatibilidad)
export { default } from './src/pages/List/index';
