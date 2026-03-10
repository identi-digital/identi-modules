export interface Agent {
  id?: string;
  identity_id?: string;
  first_name: string;
  last_name: string;
  dni: string;
  sms_number: string;
  cell_number: string;
  wsp_number: string;
  email: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  disabled_at?: string;
}

export interface AgentCreate extends Agent {
  username: string;
  tenant_id: string;
}

export interface AgentList extends Agent {
  last_recorded_at: string;
  farmers_assigned: number;
}
