// Este archivo exporta todas las rutas que expone el módulo auth
// Cada ruta debe tener: route, component, name, sidebar, category, description, icon

import { RouteConfig } from '@core/moduleLoader';
import LoginPage from './src/pages/Login/Login';
import AuthCallback from './src/pages/redirect/AuthCallback';
export const MODULE_NAME = 'auth';

export const ROUTES = {
  Login: '/',
  REDIRECT: '/redirect',
} as const;

export const getModuleRoute = (route: string): string => {
  return `/${MODULE_NAME}${route === '/' ? '' : route}`;
};

export const getLoginRoute = (route: string): string => {
  return `/`;
};

export const routes: RouteConfig[] = [
  {
    route: ROUTES.Login,
    component: LoginPage,
    name: 'Iniciar sesión',
    sidebar: false,
    category: 'Inicio',
    description: 'Iniciar sesión',
    icon: 'login',
  },
  {
    route: ROUTES.REDIRECT,
    component: AuthCallback,
    name: 'Redirect',
    sidebar: false,
    category: 'Inicio',
    description: 'Redirect',
    icon: 'login',
  },
];

export { default } from './src/pages/Login/Login';
