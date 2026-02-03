export type OperatorSelect = {
  id: string;
  name: string;
  description: string;
  type_value: string;
  created_at: string;
};

export type Tool = {
  id: string;
  name?: string;
  place_holder?: string;
  on_action?: OnAction;
  place_holder_icon?: string;
  description?: string;
  updated_at?: string;
};

type TypeToolTypes = 'data' | 'validation' | 'action';
type TypeOnActionTypes = 'api' | 'function';

export type OnAction = {
  location?: string;
  api_key?: string;
  content_type_request?: string;
  method?: string;
  type_tool?: TypeToolTypes;
  type?: TypeOnActionTypes;
};

export type ToolSchemaInput = {
  schema?: SchemaInput[];
  schema_advanced?: SchemaInput[];
  api_schema?: string;
  api_variant_schema_id?: string;
};

export type GatherSchemaInput = {
  type_value?: TypeValueTypes; // string | number | boolean | media | list
  type_media?: string;
  list_type_value?: ListTypeValueTypes; // string | number | boolean | media
  is_module_attr?: boolean;
};

export type ConfigSchemaInput = {
  is_gather?: boolean;
  is_channel?: boolean;
  gather?: GatherSchemaInput;
  condition?: ConditionTypes;
  is_unhappy_cond?: boolean;
  is_success_cond?: boolean;
};

export type ModuleTool = {
  id: string;
  // idRef: string;
  tenant_id?: string;
  category_name?: string;
  sub_category_name?: string;
  channels_array?: string[];
  name?: string;
  description?: string;
  place_holder_icon?: string;
  place_holder?: string;
  color?: string;
  // type: string;
  // color: string;
  icon?: string;
  on_action?: OnAction;
  schema_variables?: SchemaVariable[];
  schema_input?: SchemaInput[];
  schema_advanced?: SchemaInput[];
  config_form?: ConfigSchemaInput;
  created_at?: string | null;
  updated_at?: string | null;
  disabled_at?: string | null;
};

export type SpacePosition = {
  x: number;
  y: number;
};

type ConditionTypes = 'SIMPLE' | 'INPUT' | 'VARIABLE';

export type ConfigInstruction = {
  id?: string;
  tool?: Tool;
  name?: string;
  description?: string;
  color?: string;
  is_gather?: boolean;
  is_channel?: boolean;
  condition?: ConditionTypes; // SIMPLE | INPUT | VARIABLE
  space_position?: SpacePosition;
};

type TypeValueTypes =
  | 'text'
  | 'number'
  | 'boolean'
  | 'media'
  | 'list'
  | 'geojson'
  | 'entity'
  | 'option';
type ListTypeValueTypes = 'string' | 'number' | 'boolean' | 'media' | 'entity';

export type SchemaGatherMetadata = {
  metadata?: Metadata;
} & SchemaGather;

export type SchemaGather = {
  id: string;
  name?: string;
  type_value?: TypeValueTypes; // 'text' | 'number' | 'boolean' | 'media' | 'list' | 'geojson' | 'entity' | 'option'
  type_media?: string;
  type_list_value?: ListTypeValueTypes; // string | number | boolean | media
  list_type_value?: ListTypeValueTypes; // string | number | boolean | media
  is_module_attr?: boolean;
  is_unique?: boolean;
  schema_conditions?: SchemaCondition[];
  is_optional?: boolean;
  is_representative?: boolean;
  is_visual_table?: number;
  order?: number;
  instruction_id?: string;
  option?: any[];
};
export const SchemaGatherDefault: SchemaGather = {
  id: '',
  is_unique: false,
};

export type ValidatorSelect = {
  id: string;
  name: string;
  description: string;
  type_value: string;
  created_at: string;
};

export type Validator = {
  validator_name?: string;
  value?: any;
};

type TypeConditionTypes =
  | 'by_var'
  | 'by_success'
  | 'by_unhappy'
  | 'by_gather'
  | 'by_input';
type LogicalOperatorTypes = 'AND' | 'OR';

export type SchemaCondition = {
  id: string;
  next_instruction_id?: string;
  instruction_id?: string;
  var_name?: string;
  input_id?: string;
  type_condition?: TypeConditionTypes;
  logical_operator?: LogicalOperatorTypes;
  validators?: Validator[];
};

export type SchemaVariable = {
  name: string;
  display_name?: string;
  place_holder?: string;
  renamed?: string;
  description?: string;
  type_value?: TypeValueTypes;
  type_media?: string;
  list_type_value?: ListTypeValueTypes;
  list_length?: number;
  is_module_attr?: boolean;
  is_representative?: boolean;
  is_unique?: boolean;
  is_optional?: boolean;
  is_visual_table?: number;
  is_condition?: boolean;
  option?: any;
};

export type Option = {
  id: string; //el id va ser el name
  name: string;
  display_name: string;
  description: string;
  schema_input: SchemaInput;
};

export type StringRule = {
  rule: 'equal' | 'min' | 'max';
  value: string | number;
};

export type NumberRule = {
  type_rule: 'not_equal' | 'min' | 'max';
  value: number;
};

export type MediaRule = {
  rule: 'audio' | 'image' | 'video' | 'document';
  supported_types: any;
};

export type IncreasingRule = {
  rule: 'equal' | 'min' | 'max' | 'view';
  value: string | number | 'dropdown' | 'list';
};

export type OptionRule = {
  rule: 'select' | 'data';
  value: 'simple' | 'multiple' | 'all';
};

export type Rule = {
  string?: StringRule[];
  number?: NumberRule[];
  media?: MediaRule[];
  increasing?: IncreasingRule[];
  options?: OptionRule[];
};

type TypeInputTypes =
  | 'text'
  | 'number'
  | 'boolean'
  | 'media'
  | 'dict'
  | 'name_var'
  | 'options';

export type SchemaInput = {
  id?: string;
  name?: string;
  font_size?: number;
  place_holder?: string;
  display_name?: string;
  description?: string;
  type_input?: TypeInputTypes;
  value?: any;
  value_defect?: string;
  label_increasing?: string;
  is_increasing?: boolean;
  is_optional?: boolean;
  is_disabled_edit?: boolean;
  is_gather_name?: boolean;
  is_gather_value?: boolean;
  is_representative?: boolean;
  is_hidden?: boolean;
  is_condition?: boolean;
  api_options?: string;
  options?: Option[];
  schema_input?: SchemaInput[];
  rules?: Rule;
};

type DataVariant = {
  id: string;
  name: string;
  description: string;
};

export type Metadata = {
  data_input?: any;
  data_variant?: DataVariant;
};

export type Instruction = {
  id: string;
  config?: ConfigInstruction;
  schema_gather?: SchemaGather;
  schema_conditions?: SchemaCondition[];
  schema_variables?: SchemaVariable[];
  schema_input?: SchemaInput[];
  schema_input_advanced?: SchemaInput[];
  group_index?: number;
  metadata?: Metadata;
  //
};
type Action = {
  id?: string;
  name?: string;
  display_name?: string;
  description?: string;
  is_gather?: string;
  is_conditional?: string;
  is_channel?: string;
  is_array?: string;
};

type PositionFront = {
  x: number;
  y: number;
};

export type InstructionFlow = Instruction & {
  name?: string;
  action?: Action;
  reference?: any;
  description?: string;
  color?: string;
  is_initial?: boolean;
  is_end?: boolean;
  is_conditional?: boolean;
  is_gather?: boolean;
  is_channel?: boolean;
  enviroments?: SchemaVariable[];
  position_front?: { x: number; y: number };
  editMode?: string;
  position: PositionFront;
  falied_instruction_id?: string;
  failed_instruction_condition_id?: string;
  success_instruction_condition_id?: string;
  success_instruction_id?: string;
  sub_flow_id?: string;
  is_failed_instruction?: boolean;
  is_success_instruction?: boolean;
};

export type ModuleSchema = {
  objectId?: string;
  _id?: any;
  idRef: string;
  // id: string;
  module_id: string;
  instructions: Instruction[];
  instruction_start: string;
  instruction_group_summary: number[];
  schema_gather_summary: any[];
  disabled_at?: any;
  created_at?: any;
};

export type GpsTracking = {
  frequency: number; //intervalo de tiempo en segundos
};

export type EntityNameTypes = 'entity' | 'free' | 'complementary';
export type TypeModuleTypes = 'ENTITY' | 'FREE';
export type ModuleChannelNames = 'wsp' | 'call' | 'sms' | 'identi connect';
export type TypeFlowTypes = 'linear' | 'branching';
type TypeViewTypes = 'ALL' | 'PANEL';

export type Module = {
  // objectId: string;
  // idRef: string;
  id: string;
  entity_type?: EntityNameTypes; // 'PERSON' | 'ORGANIZATION' | 'OBJECT' | 'COMPLEMENTARY'
  form_purpose?: EntityNameTypes;
  channel_name?: ModuleChannelNames;
  description?: string;
  viewer?: string[];
  name?: string;
  entity_name?: string;
  schema_id?: string;
  image_path?: string;
  module_type?: TypeModuleTypes; // ENTITY | COMPLEMENTARY | FREE
  flow_type: TypeFlowTypes; // linear | branching
  type_view?: TypeViewTypes; // ALL | NOBODY | ONLY | ALL_EXCEPT
  viewers?: string[];
  is_simple?: boolean;
  active_init_at?: string;
  active_end_at?: string;
  frequency?: string; // YEAR
  gps_tracking?: GpsTracking | null;
  created_at?: any;
  updated_at?: any;
  disabled_at?: any;
};

type EventDirection = 'incoming' | 'outgoing';
type SessionStatus = 'open' | 'flow_process' | 'close';
type SessionEntity = {
  id: string;
  type: EntityNameTypes;
};

type ModuleSessionStatus = {
  id: string;
  schema_id: string;
};

type UserSession = {
  id: string;
  channel: ModuleChannelNames;
  identifier: string;
};

export type ModuleSession = {
  idRef: string;
  tenant: string;
  channel_name: ModuleChannelNames;
  session_status_name: SessionStatus;
  instruction_now_id: string;
  module: ModuleSessionStatus;
  entity: SessionEntity;
  user: UserSession;
  receiver: any;
  sender: any;
  event_direction: EventDirection;
  variables: SchemaVariable[];
  duration: number;
  instruction_history: string[];
  is_manual_attention: boolean;
  tracking_gps: any;
  created_at: any;
  updated_at: any;
};

export const ModuleSessionDefault: ModuleSession = {
  idRef: '',
  tenant: '',
  channel_name: 'identi connect',
  session_status_name: 'close',
  instruction_now_id: '',
  module: {
    id: '',
    schema_id: '',
  },
  entity: {
    id: '',
    type: 'complementary',
  },
  user: {
    id: '',
    channel: 'identi connect',
    identifier: '',
  },
  receiver: null,
  sender: null,
  event_direction: 'outgoing',
  variables: [],
  duration: 0, // en ms
  instruction_history: [], // array de ids de instrucciones
  is_manual_attention: false,
  tracking_gps: null,
  created_at: '',
  updated_at: '',
};

export const ModuleDefault: Module = {
  // objectId: '',
  // idRef: '',
  id: '',
  name: '',
  entity_type: 'complementary',
  form_purpose: 'complementary',
  flow_type: 'linear',
  module_type: 'ENTITY',
  image_path: '',
  schema_id: '',
  type_view: 'ALL',
  active_init_at: '',
  active_end_at: '',
  channel_name: 'identi connect',
  gps_tracking: null,
};

export type QuestionList = {
  group: string;
  name: string;
  tools: ModuleTool[];
};

export const InstructionDefault: InstructionFlow = {
  id: 'id1',
  config: undefined,
  schema_gather: undefined,
  schema_conditions: undefined,
  schema_variables: undefined,
  schema_input: undefined,
  schema_input_advanced: undefined,
  group_index: 0,
  metadata: undefined,
  is_initial: false,
  is_end: false,
  is_conditional: false,
  is_gather: false,
  is_channel: false,
  position: { x: 0, y: 0 },
};
