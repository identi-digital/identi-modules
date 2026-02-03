import { EntityDetail } from './entities';

export interface CoreRegister {
  form_id: string;
  schema_form_id: string;
  detail: EntityDetail[];
  location: any;
  identity_id: string;
  duration: number;
}
