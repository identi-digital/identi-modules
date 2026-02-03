enum ProductType {
  'CONVENCIONAL',
  'ORGÁNICO',
}
enum CurrentStatusType {
  'ACTIVO',
  'EN STOCK',
}
enum CurrentProcessType {
  'BABA',
  'FERMENTADO',
  'SECADO',
  'SECO',
}
export interface Lot {
  id: string;
  name: string;
  gathering_center_id: string;
  product_type: ProductType;
  current_status: CurrentStatusType;
  current_process: CurrentProcessType;
  current_store_center_id: string;
  created_at: string;
  updated_at?: string;
  disabled_at?: string;
}

export interface LotProcessHistory {
  id: string;
  lot_id: string;
  last_process: CurrentProcessType;
  new_process: CurrentProcessType;
  identity_id: string;
  created_at: string;
}

export interface LotStatusHistory {
  id: string;
  lot_id: string;
  last_status: CurrentStatusType;
  new_status: CurrentStatusType;
  identity_id: string;
  created_at: string;
}

export interface LotCertifications {
  id: string;
  lot_id: string;
  certification_id: string;
  created_at: string;
  disabled_at?: string;
}

enum CertificationCode {
  'NOP',
  'FLO',
  'EU',
  'RA',
  'RTPO',
  'BS',
}

export interface Certifications {
  id: string;
  name: string;
  code: CertificationCode;
  disabled_at?: string;
}

export interface LotPut {
  name: string;
  gathering_center_id: string;
  product_type: string;
  current_status: string;
  current_process: string;
  current_store_center_id: string;
  gatherer_id: string;
  net_weight: number;
}
