enum PaymentMethod {
  'CONTADO',
  'TRANSFERENCIA',
  'CRÉDITO',
}

enum PresentationType {
  'BABA',
  'SECO',
  'FRUTA',
}

export interface Purchase {
  id: string;
  lot_id: string;
  farmer_id: string;
  farm_id: string;
  gatherer_id: string;
  quantity: number;
  price: number;
  presentation: PresentationType;
  payment_method: PaymentMethod;
  purchase_date: string;
  created_at: string;
  updated_at?: string;
  disabled_at?: string;
}
