export interface Transfer {
  id: string;
  dni: string;
  first_name: string;
  last_name: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TransferCreate {
  dni: string;
  first_name: string;
  last_name: string;
  amount: number;
  cci: string;
}
