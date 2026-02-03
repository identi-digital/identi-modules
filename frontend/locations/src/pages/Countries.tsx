// Ruta de países: /countries
import { ModuleConfig } from '@core/moduleLoader'

interface CountriesProps {
  config?: ModuleConfig
}

export default function Countries({ config }: CountriesProps) {
  return (
    <div>
      <h2>Gestión de Países</h2>
      <p>Esta es la vista de gestión de países</p>
    </div>
  )
}

