import { EntityDetail } from '@/modules/forms/src/models/entities';

export interface Error {
  type: string;
  message: string;
  timestamp: string;
}

export interface FarmerForms {
  id: string;
  form_id: string;
  form: any;
  schema_form_id: string;
  detail: EntityDetail[];
  status: string;
  error: Error;
  location: any;
  entity_name: string;
  entity_id: string;
  identity_id: any;
  duration: any;
  created_at: string;
  updated_at: string;
  disabled_at: any;
}
