// Este archivo exporta todas las rutas que expone el módulo locations
// Cada ruta debe tener: route, component, name, sidebar, category, description, icon

import { RouteConfig } from '@core/moduleLoader'
import List from './src/pages/List'
import Countries from './src/pages/Countries'
import Departments from './src/pages/Departments'

// Constantes de rutas del módulo
export const MODULE_NAME = 'locations'

// Rutas base (sin el prefijo del módulo)
export const ROUTES = {
  LIST: '/',
  COUNTRIES: '/countries',
  DEPARTMENTS: '/departments'
} as const

// Funciones helper para construir rutas completas
export const getModuleRoute = (route: string): string => {
  return `/${MODULE_NAME}${route === '/' ? '' : route}`
}

export const getListRoute = (): string => {
  return `/${MODULE_NAME}`
}

export const getCountriesRoute = (): string => {
  return `/${MODULE_NAME}/countries`
}

export const getDepartmentsRoute = (): string => {
  return `/${MODULE_NAME}/departments`
}

export const routes: RouteConfig[] = [
  {
    route: ROUTES.LIST,
    component: List,
    name: 'Ubicaciones',
    sidebar: true,
    category: 'Actores',
    description: 'Modulo de Ubicaciones',
    icon: 'folder'
  },
  {
    route: ROUTES.COUNTRIES,
    component: Countries,
    name: 'Países',
    sidebar: false,
    category: 'Actores',
    description: 'Gestión de países'
  },
  {
    route: ROUTES.DEPARTMENTS,
    component: Departments,
    name: 'Departamentos',
    sidebar: false,
    category: 'Actores',
    description: 'Gestión de departamentos'
  }
]

// Exportar el componente principal del módulo (opcional, para compatibilidad)
export { default } from './src/pages/List'

