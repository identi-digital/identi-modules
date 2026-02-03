export interface DeforestFarms {
  id: string;
  code: string;
  producer_full_name: string;
  district_description: string;
  state_deforesting: string;
  natural_forest_loss_ha: number;
  deforestation_request_id: string;
  created_at: string;
}

export interface DeforestMetrics {
  farm_georefrence_count: number;
  farm_georefrence_coverage: number;
  farm_wh_georefeence_count: number;
  farm_wh_georefeence_coverage: number;
}

export interface DeforestMetricsFarmer {
  baja_nula: BajaNula;
  critica: Critica;
  parcial: Parcial;
  total_farmers_evaluated: number;
}

export interface DeforestMetricsFarm {
  baja_nula: BajaNula;
  critica: Critica;
  parcial: Parcial;
  total_farms_evaluated: number;
  total_hectares_evaluated: number;
}

export interface BajaNula {
  count: number;
  percentage: number;
}

export interface Critica {
  count: number;
  percentage: number;
}

export interface Parcial {
  count: number;
  percentage: number;
}
