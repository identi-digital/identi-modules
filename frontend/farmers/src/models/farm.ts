export interface Farm {
  id: string;
  farmer_id: string;
  name: string;
  total_area: number;
  cultivated_area: number;
  geometry?: any;
  latitude?: number;
  longitude?: number;
  country_id?: string;
  department_id?: string;
  province_id?: string;
  district_id?: string;
  created_at: string;
  updated_at?: string;
  disabled_at?: string;
}
type EntityRel = {
  id: string;
  name: string;
};

export interface Crop {
  id: string;
  name: string;
  crop_type: string;
  created_at: string;
  updated_at?: string;
  disabled_at?: string;
}

export interface FarmGet extends Farm {
  country: EntityRel;
  department: EntityRel;
  province: EntityRel;
  district: EntityRel;
  crops: Crop[];
}
