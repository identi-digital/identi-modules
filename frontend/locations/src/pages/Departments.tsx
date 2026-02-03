// Ruta de departamentos: /departments
import { ModuleConfig } from '@core/moduleLoader'

interface DepartmentsProps {
  config?: ModuleConfig
}

export default function Departments({ config }: DepartmentsProps) {
  return (
    <div>
      <h2>Gestión de Departamentos</h2>
      <p>Esta es la vista de gestión de departamentos</p>
    </div>
  )
}

