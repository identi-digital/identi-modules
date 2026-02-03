export interface GatheringCenter {
  id: string;
  name: string;
  description: string;
  code: string;
  created_at: string;
  updated_at?: string;
  disabled_at?: string;
}

export interface GatheringCenterList extends GatheringCenter {
  lot_count: number;
  gatherer_count: number;
}
