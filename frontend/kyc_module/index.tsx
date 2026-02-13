import { RouteConfig } from '@core/moduleLoader';
import List from './src/pages/List';

export const MODULE_NAME = 'KYC';

export const ROUTES = {
  DASHBOARD: '/',
};

export const getModuleRoute = (route: string): string => {
  return `/${MODULE_NAME}${route === '/' ? '' : route}`;
};

export const routes: RouteConfig[] = [
  {
    route: ROUTES.DASHBOARD,
    component: List,
    name: 'KYC',
    sidebar: true,
    category: 'Módulos',
    description: 'Modulo de KYC',
    icon: 'person',
  },
];

export { default } from './src/pages/List';
