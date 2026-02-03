export interface StoreCenter {
  id: string;
  name: string;
  capacity_kg: number;
  code: string;
  created_at: string;
  updated_at?: string;
  disabled_at?: string;
}

export interface StoreMovement {
  id: string;
  lot_id: string;
  store_center_id: string;
  type_movement: 'INGRESO' | 'SALIDA';
  weight_kg: number;
  created_at: string;
  identity_id: string;
}
