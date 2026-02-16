export interface Farmer {
  id: string;
  code: string;
  first_name: string;
  last_name: string;
  dni: string;
  email: string;
  wsp_number?: string;
  sms_number: string;
  call_number?: string;
  address?: string;
  country_id?: string;
  department_id?: string;
  province_id?: string;
  district_id?: string;
  created_at?: string;
  updated_at?: string;
  disabled_at?: string;
}
type EntityRel = {
  id: string;
  name: string;
};

export interface FarmerGet extends Farmer {
  country: EntityRel;
  department: EntityRel;
  province: EntityRel;
  district: EntityRel;
}

export interface FarmerLocation {
  id: string;
  country_id: string;
  department_id: string;
  province_id: string;
  district_id: string;
}
