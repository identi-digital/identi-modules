export interface Gatherer {
  id: string;
  first_name: string;
  last_name: string;
  dni: string;
  email: string;
  sms_number: string;
  call_number: string;
  wsp_number: string;
  identity_id: string;
  created_at?: string;
  updated_at?: string;
  disabled_at?: string;
}

export interface GathererCreate extends Gatherer {
  username: string;
  eid: string;
}

export interface GathererList extends Gatherer {
  last_recorded_at: string;
  farmers_assigned: number;
  status: string;
  last_purchase_date?: string;
}

export interface GathererGatheringCenter {
  id: string;
  gatherer_id: string;
  gathering_center_id: string;
  created_at: string;
  disabled_at?: string;
}
