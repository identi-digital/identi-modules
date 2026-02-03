import {
  Instruction,
  ModuleTool,
  SchemaCondition,
  SchemaGather,
} from '../../../models/forms';
import { v4 as uuidv4 } from 'uuid';

const toolToInstruction = (moduleTool: ModuleTool): Instruction => {
  const is_gather = Object(moduleTool.config_form).hasOwnProperty('is_gather')
    ? moduleTool.config_form?.is_gather
    : undefined;
  const is_channel = Object(moduleTool.config_form).hasOwnProperty('is_channel')
    ? moduleTool.config_form?.is_channel
    : undefined;
  const is_unhappy_cond = Object(moduleTool.config_form).hasOwnProperty(
    'is_unhappy_cond',
  )
    ? moduleTool.config_form?.is_unhappy_cond
    : undefined;
  const is_success_cond = Object(moduleTool.config_form).hasOwnProperty(
    'is_success_cond',
  )
    ? moduleTool.config_form?.is_success_cond
    : undefined;
  const newIdInstruction = uuidv4();
  const conditions: SchemaCondition[] = [
    {
      id: uuidv4(),
      next_instruction_id: '',
      type_condition: 'by_success',
    },
  ];
  //schema gather
  let dataGather: SchemaGather | undefined = undefined;
  if (is_gather) {
    const gatherConf = Object(moduleTool.config_form).hasOwnProperty('gather')
      ? moduleTool.config_form?.gather
      : undefined;
    dataGather = {
      id: uuidv4(),
      name: '',
      type_value: gatherConf?.type_value ?? 'text',
      is_module_attr: gatherConf?.is_module_attr ?? false,
      is_unique: false,
      is_optional: false,
      is_representative: false,
      is_visual_table: 0,
      list_type_value: gatherConf?.list_type_value ?? undefined,
      type_media: gatherConf?.type_media ?? undefined,
      // is_form: true
    };
  }
  if (is_success_cond) {
    conditions.push({
      id: uuidv4(),
      next_instruction_id: '',
      type_condition: 'by_success',
    });
  }
  if (is_unhappy_cond) {
    conditions.push({
      id: uuidv4(),
      next_instruction_id: '',
      type_condition: 'by_unhappy',
    });
  }

  const newInstruction: Instruction = {
    id: newIdInstruction,
    config: {
      tool: {
        id: moduleTool.id,
        name: moduleTool.name,
        description: moduleTool.description,
        place_holder: moduleTool.place_holder,
        on_action: moduleTool.on_action,
      },
      color: moduleTool.color,
      is_gather,
      is_channel,
    },
    schema_gather: dataGather,
    schema_input: moduleTool.schema_input ?? [],
    schema_input_advanced: moduleTool.schema_advanced ?? [],
    schema_variables: moduleTool.schema_variables ?? [],
    schema_conditions: conditions,
    group_index: 0,
  };
  return newInstruction;
};

export { toolToInstruction };
