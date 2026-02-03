// Ruta principal: Lista de ubicaciones
import { ModuleConfig } from '@core/moduleLoader'

interface LocationsListProps {
  config?: ModuleConfig
}

export default function LocationsList({ config }: LocationsListProps) {
  return (
    <div>
      <h2>Lista de Ubicaciones</h2>
      <p>Esta es la vista principal del módulo de ubicaciones</p>
    </div>
  )
}

