import { EntityNameTypes, Metadata, SchemaCondition } from './forms';

export type TypeValues =
  | 'text'
  | 'number'
  | 'geojson'
  | 'json'
  | 'boolean'
  | 'list'
  | 'media'
  | 'entity'
  | 'option'
  | 'date';

//cuando el value sea geojson se espera como value del detail
//un objeto que cuente con dos campos gfw_data y geojson
export type GeoJsonValue = {
  gfw_data: any;
  geojson: any;
};

export type EntityExternalRelationsArray = {
  detail_id: string; //id del detalle que crea la relación
  id_to: string; //id de la entidad donde se va agregar la relación -> externo // se agrega cuando se selecciona el campo entity
  type_to: string;
  relation: EntityRelations;
};

export type EntityRelations = {
  entity_id?: string;
  detail_id?: string;
  module_name?: string;
  module_id?: string;
  entity_type?: string;
  backref?: string;
  representative_value?: string;
  var_name?: string;
  created_at?: any;
};

export type EntityDetailMetadata = {
  metadata?: Metadata;
} & EntityDetail;

export type EntityDetail = {
  id: string;
  name: string;
  value: any;
  display_name: string;
  type_media?: string;
  is_representative: boolean;
  schema_conditions?: SchemaCondition[];
  is_unique?: boolean;
  is_optional?: boolean;
  type_value: TypeValues;
  type_list_value?: string;
  order?: number;
  instruction_id?: string;
  option?: any[];
};

export type Location = {
  country_id?: string;
  department_id?: string;
  province_id?: string;
  district_id?: string;
};

export type LocationNames = {
  country_name: string;
  department_name: string;
  province_name: string;
  district_name: string;
} & Location;

export type KafeSistemas = {
  state: string;
  message: string;
  hash: string;
  code: number;
  entity_id: string;
};

export type ChangeHistory = {
  attr_id: string;
  attr_name: string;
  change: string;
  created_at: any;
  user_id: string;
};

export type Entity = {
  _id?: any;
  mongoId: string;
  objectId: string;
  idRef: string;
  tenant_id: string;
  module_name: string;
  module_id: string;
  module_detail: EntityDetail[];
  entity_relations: EntityRelations[];
  entity_type: EntityNameTypes;
  change_history?: ChangeHistory[];
  logo_path?: string;
  location?: Location;
  kafe_sistemas?: KafeSistemas;
  status?: string;
  created_at?: string;
  updated_at?: string;
  disabled_at: string;
};
