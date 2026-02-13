import { RouteConfig } from '@core/moduleLoader';
import List from './src/pages/List';
import Create from './src/pages/Create';

export const MODULE_NAME = 'expenditure';

export const ROUTES = {
  DASHBOARD: '/',
  CREATE: '/create',
};

export const getModuleRoute = (route: string): string => {
  return `/${MODULE_NAME}${route === '/' ? '' : route}`;
};

export const getCreateRoute = (): string => {
  return `/${MODULE_NAME}/create`;
};

export const routes: RouteConfig[] = [
  {
    route: ROUTES.DASHBOARD,
    component: List,
    name: 'Desembolsos',
    sidebar: true,
    category: 'Módulos',
    description: 'Modulo de Desembolsos',
    icon: 'person',
  },
  {
    route: ROUTES.CREATE,
    component: Create,
    name: 'Crear Desembolso',
    sidebar: false,
    category: 'Desembolsos',
    description: 'Crear un nuevo Desembolso',
  },
];

export { default } from './src/pages/List';
