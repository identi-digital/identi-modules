import { RouteConfig } from '@core/moduleLoader';
import DashboardPage from './src/pages/Dashboard/index';

export const MODULE_NAME = 'Prospección';

export const ROUTES = {
  DASHBOARD: '/',
};

export const getModuleRoute = (route: string): string => {
  return `/${MODULE_NAME}${route === '/' ? '' : route}`;
};

export const routes: RouteConfig[] = [
  {
    route: ROUTES.DASHBOARD,
    component: DashboardPage,
    name: 'Prospección',
    sidebar: true,
    category: 'Prospección',
    description: 'Modulo de Prospección',
    icon: 'person',
  },
];

export { default } from './src/pages/Dashboard/index';
