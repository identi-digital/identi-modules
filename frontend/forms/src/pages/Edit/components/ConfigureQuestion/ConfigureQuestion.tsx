import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Box,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
  styled,
} from '@mui/material';
import {
  Instruction,
  ModuleTool,
  SchemaGather,
  SchemaInput,
  SchemaCondition,
} from '../../../../models/forms';
import { State } from '@hookstate/core';
import { Validation } from '@hookstate/validation';
import { showYesNoQuestion } from '@ui/utils/Messages';
import NumberInput from './components/NumberInput';
import TextInput from './components/textInput';
import { ContextContainer } from '../..';
import IconBox from '../SharedComponents/IconBox';
import { toolToInstruction } from '../../utils/flowFunctions';
import LinearProgress from '@ui/components/atoms/LinearProgress/LinearProgress';
import QuestionPageEdit from '../QuestionEdit/components/QuestionPageEdit';
import ConditionalComponent from '../FlowEdit/components/ConditionalComponent';
import { editingConditionals } from '../FlowEdit/components/BodyComponent';
import { Delete } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
// import { ContextLayout } from '~/ui/templates/Layouts/Layout';
import { useParams } from 'react-router-dom';
import BooleanInput from './components/BooleanInput';

type PageStyledProps = {
  flowView?: boolean;
};

const RootStyle = styled('div', {
  shouldForwardProp: (prop) => prop !== 'flowView',
})<PageStyledProps>(({ theme, flowView }) => ({
  width: flowView ? '24%' : '40%',
  backgroundColor: 'white',
  color: theme.palette.primary.main,
  maxHeight: '650px',
  overflow: 'auto',
  zIndex: 9,
}));
const BoxConfigStyled = styled('div')(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '10px',
}));
type ConfigureSchemaInstructionProps = {
  instructions: State<Instruction[] | undefined, any>;
  currentInstructionIndex: number;
  replaceQuestion: (question: Instruction, index: number) => void;
  flowView: boolean;
  handleChangeIndexCurrentInstruction: (index: number) => void;
};

const label = { inputProps: { 'aria-label': 'Switch type' } };

const ConfigureSchemaInstruction: React.FC<ConfigureSchemaInstructionProps> = (
  props: ConfigureSchemaInstructionProps,
) => {
  // const [instructionCurrent, setInstructionCurrent] = useState<State<Instruction[] | undefined, any>>(undefined);
  const {
    instructions,
    currentInstructionIndex,
    replaceQuestion,
    flowView,
    handleChangeIndexCurrentInstruction,
  } = props;
  // eslint-disable-next-line
  // @ts-ignore
  const { id_module = '' } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const context = useContext(ContextContainer);
  // const { validateIfQuestionIsDefault } = useContext(ContextLayout);
  const { arrayTools, arrayIdsDisabled } = context;

  // const [isUpdateConditions, setIsUpdateConditions] = useState<boolean>(false);
  const [conditionsEditing, setConditionsEditing] = useState<
    editingConditionals[]
  >([]);

  const handleChangeIsRepresentative = async (id: string, check: boolean) => {
    let sig = true;
    if (check) {
      sig = await showYesNoQuestion(
        '',
        'Este será el único atributo representativo del módulo, ¿seguro de guardar el cambio?',
        'info',
      );
    }
    if (sig) {
      instructions.ornull.forEach((element: State<Instruction>) => {
        if (element.get().id === id) {
          element.schema_gather.set(
            (prev: State<SchemaGather | undefined, any>) => {
              if (prev) {
                return {
                  ...prev,
                  is_representative: check,
                  is_visual_table: 0,
                };
              }
              return prev;
            },
          );
        } else {
          element.schema_gather.set(
            (prev: State<SchemaGather | undefined, any>) => {
              if (prev) {
                return {
                  ...prev,
                  is_representative: false,
                  is_visual_table: 0,
                };
              }
              return prev;
            },
          );
        }
      });
    }
  };
  const [varsArray, setVarsArray] = useState<any[]>([]);

  // const handleIsUpdateConditionsVal = useCallback((val: boolean) => {
  //   setIsUpdateConditions(val);
  // }, []);

  const updateEditingConditions = useCallback(
    (obj: editingConditionals) => {
      const indexObj = conditionsEditing.findIndex(
        (element: editingConditionals) =>
          element.idInstruction === obj.idInstruction,
      );
      if (indexObj >= 0) {
        setConditionsEditing((prev: editingConditionals[]) => {
          const newConditionsEditing: editingConditionals[] = prev.map(
            (element: editingConditionals) => {
              if (element.idInstruction === obj.idInstruction) {
                return { ...element, newConditions: obj.newConditions };
              }
              return element;
            },
          );
          return newConditionsEditing;
        });
      } else {
        setConditionsEditing((prev: editingConditionals[]) => [...prev, obj]);
      }
    },
    [conditionsEditing],
  );

  const removeElement = async (index: number) => {
    await instructions.set((prev: State<Instruction[] | undefined, any>) => {
      const updatedArray = prev.slice(); // Create a copy of the array
      //actualizar conexión
      let nextId = '';
      if (updatedArray[index + 1]) {
        nextId = updatedArray[index + 1].id;
      }

      if (updatedArray[index - 1]) {
        const lastInstructionCondition: SchemaCondition = {
          id: uuidv4(),
          next_instruction_id: nextId,
          type_condition: 'by_success',
        };
        updatedArray[index - 1].schema_conditions = [lastInstructionCondition];
      }

      updatedArray.splice(index, 1); // Remove the element at indexToRemove
      return updatedArray;
    });
    if (index > 0) {
      handleChangeIndexCurrentInstruction(index - 1);
    }
  };

  useEffect(() => {
    const arrVars: any[] = [];
    instructions.ornull.forEach(
      (instruction: State<Instruction>, _index: number) => {
        // if (index === currentInstructionIndex) {
        //   // console.log(JSON.parse(JSON.stringify(instruction.get())));
        //   setInstructionCurrent(instruction.get());
        // }
        if (instruction.get().schema_gather) {
          arrVars.push(instruction.get().schema_gather?.name);
        }
        if (instruction.get().schema_variables) {
          const vars = instruction.schema_variables.get();
          vars &&
            vars.forEach((element: any) => {
              arrVars.push(element.name);
            });
        }
      },
    );
    if (arrVars.length > 0) {
      setVarsArray(arrVars);
    }
  }, [currentInstructionIndex, instructions]);

  if (loading) {
    return (
      <RootStyle flowView={flowView}>
        <LinearProgress loading={true} />
      </RootStyle>
    );
  }

  return (
    <RootStyle>
      {instructions.ornull.map(
        (instruction: State<Instruction, Validation>, index: number) => {
          const isDefault = false;
          // validateIfQuestionIsDefault && validateIfQuestionIsDefault(id_module, instruction.get().id ?? '');
          const schema_gather = instruction.schema_gather;
          const schema_input_advanced =
            instruction.schema_input_advanced.ornull;
          if (instruction.schema_gather.ornull) {
            instruction.schema_gather.ornull.name.validate(
              (taskName: any) => taskName.length > 0,
              'El campo es obligatorio',
            );
            instruction.schema_gather.ornull.name.validate(
              (taskName: any) => taskName.length >= 3,
              'El campo debe tener mínimo 3 caracteres',
            );
          }
          if (index === currentInstructionIndex) {
            return (
              <>
                {flowView && (
                  <>
                    <Box
                      display={'flex'}
                      justifyContent={'flex-end'}
                      alignItems={'center'}
                    >
                      <Tooltip title={'Eliminar'}>
                        <IconButton
                          onClick={() => {
                            removeElement(index);
                          }}
                        >
                          <Delete
                            sx={{
                              fontSize: '22px',
                              color: 'gray',
                            }}
                          />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <QuestionPageEdit
                      currentInstruction={instruction}
                      varsArray={varsArray}
                      index={index + 1}
                      // hideIcon={true}
                      flowView={flowView}
                      // eslint-disable-next-line
                      // @ts-ignore
                      ref={(ref: React.Ref<HTMLDivElement>) =>
                        // eslint-disable-next-line
                        // @ts-ignore
                        setComponentRef(index, ref)
                      }
                    />
                  </>
                )}
                <Box p={2}>
                  <Typography sx={{ fontWeight: 600 }}>Tipo</Typography>
                  <FormControl sx={{ width: '100%', mt: 1 }}>
                    <Select
                      value={instruction.get().config?.tool?.name ?? ''}
                      MenuProps={{ sx: { maxHeight: '500px', width: '100%' } }}
                      onChange={async (e: any) => {
                        const sig = await showYesNoQuestion(
                          '',
                          '¿Seguro de querer cambiar la pregunta?',
                          'warning',
                        );
                        // if (sig) {
                        //   setLoading(true);
                        //   const newTool =
                        //     arrayTools && arrayTools.find((element: ModuleTool) => element.name === e.target.value);
                        //   if (newTool) {
                        //     const newInstruction = toolToInstruction(JSON.parse(JSON.stringify(newTool)));
                        //     replaceQuestion(newInstruction, index);
                        //   }
                        //   setLoading(false);
                        // }
                        if (sig) {
                          setLoading(true);
                          const newTool =
                            arrayTools &&
                            arrayTools.find(
                              (element: ModuleTool) =>
                                element.name === e.target.value,
                            );
                          if (newTool) {
                            // obtengoschema_conditions y reemplza al del newInstruction
                            const schema_conditions = instruction
                              .get()
                              ?.schema_conditions?.map((element: any) => {
                                return {
                                  ...element,
                                };
                              });
                            const intructionId = instruction.get()?.id ?? '';
                            const newInstruction = toolToInstruction(
                              JSON.parse(JSON.stringify(newTool)),
                            );
                            newInstruction.schema_conditions = schema_conditions;
                            newInstruction.id = intructionId;
                            replaceQuestion(newInstruction, index);
                          }
                          setLoading(false);
                        }
                      }}
                      size="small"
                      displayEmpty
                      inputProps={{ 'aria-label': 'type question select' }}
                      disabled={isDefault}
                    >
                      {arrayTools &&
                        arrayTools.map((element: ModuleTool, index: number) => {
                          return (
                            <MenuItem
                              key={`${element.name}_${index}`}
                              value={element.name}
                              disabled={
                                arrayIdsDisabled &&
                                arrayIdsDisabled.includes(element.id)
                              }
                            >
                              <Box sx={{ display: 'flex' }}>
                                <IconBox type={element.name ?? ''} index={-1} />
                                &nbsp;
                                <Typography>{element.name}</Typography>
                              </Box>
                            </MenuItem>
                          );
                        })}
                    </Select>
                  </FormControl>
                </Box>
                <Divider />
                <Box p={2}>
                  <Typography sx={{ fontWeight: 600 }} mb={2}>
                    Configuración
                  </Typography>
                  {Object(instruction.schema_gather.get()).hasOwnProperty(
                    'is_optional',
                  ) && (
                    <BoxConfigStyled>
                      <Typography fontSize={13}>
                        Pregunta obligatoria
                      </Typography>
                      <Switch
                        {...label}
                        name={'is_optional'}
                        onChange={(e: any) => {
                          schema_gather.set(
                            (prev: State<SchemaGather | undefined, any>) => {
                              if (prev) {
                                return {
                                  ...prev,
                                  is_optional: !e.target.checked,
                                };
                              }
                              return prev;
                            },
                          );
                        }}
                        checked={!instruction.get().schema_gather?.is_optional}
                      />
                    </BoxConfigStyled>
                  )}
                  {Object(instruction.schema_gather.get()).hasOwnProperty(
                    'is_representative',
                  ) && (
                    <BoxConfigStyled>
                      <Typography fontSize={13}>
                        Pregunta representativa
                      </Typography>
                      <Switch
                        {...label}
                        name={'is_representative'}
                        onChange={(e: any) => {
                          handleChangeIsRepresentative(
                            instruction.get().id,
                            e.target.checked,
                          );
                        }}
                        // disabled={isDefault}
                        checked={
                          instruction.get().schema_gather?.is_representative
                        }
                      />
                    </BoxConfigStyled>
                  )}
                  {Object(instruction.schema_gather.get()).hasOwnProperty(
                    'is_unique',
                  ) && (
                    <BoxConfigStyled>
                      <Typography fontSize={13}>Atributo único</Typography>
                      <Switch
                        {...label}
                        name={'is_unique'}
                        onChange={(e: any) => {
                          schema_gather.set(
                            (prev: State<SchemaGather | undefined, any>) => {
                              if (prev) {
                                return { ...prev, is_unique: e.target.checked };
                              }
                              return prev;
                            },
                          );
                        }}
                        checked={instruction.get().schema_gather?.is_unique}
                      />
                    </BoxConfigStyled>
                  )}
                  {Object(instruction.schema_gather.get()).hasOwnProperty(
                    'name',
                  ) && (
                    <Box mt={1}>
                      <Typography fontSize={13} mb={1}>
                        Etiqueta
                      </Typography>
                      <TextField
                        name="name"
                        id="name"
                        variant="outlined"
                        placeholder="Etiqueta"
                        disabled={isDefault}
                        size="small"
                        value={instruction.get().schema_gather?.name}
                        onChange={(e: any) => {
                          schema_gather.set(
                            (prev: State<SchemaGather | undefined, any>) => {
                              if (prev) {
                                return { ...prev, name: e.target.value };
                              }
                              return prev;
                            },
                          );
                        }}
                        error={!instruction.schema_gather.ornull?.name.valid()}
                        helperText={
                          !instruction.schema_gather.ornull?.name.valid() &&
                          instruction.schema_gather.ornull?.name
                            .errors()
                            .map((error: any) => error.message)
                            .join(', ')
                        }
                      />
                    </Box>
                  )}
                  {Object(instruction.schema_gather.get()).hasOwnProperty(
                    'is_visual_table',
                  ) && (
                    <Box mt={1}>
                      <Typography fontSize={13} mb={1}>
                        Orden de tabla
                      </Typography>
                      <TextField
                        name="is_visual_table"
                        id="is_visual_table"
                        variant="outlined"
                        type="number"
                        placeholder="Etiqueta"
                        size="small"
                        value={
                          instruction.get().schema_gather?.is_visual_table ?? 0
                        }
                        onChange={(e: any) => {
                          schema_gather.set(
                            (prev: State<SchemaGather | undefined, any>) => {
                              if (prev) {
                                return {
                                  ...prev,
                                  is_visual_table: e.target.value,
                                };
                              }
                              return prev;
                            },
                          );
                        }}
                      />
                    </Box>
                  )}
                </Box>
                <Divider />
                {/* schema input advanced */}
                {schema_input_advanced && (
                  <Box mt={2}>
                    {schema_input_advanced &&
                      schema_input_advanced.ornull.map(
                        (schema: State<SchemaInput>, _index: number) => {
                          // console.log(schema);
                          return (
                            <Box px={2} pt={1} key={schema.get().id}>
                              <Typography fontSize={13} mb={1}>
                                {schema.get().display_name}
                              </Typography>
                              {schema.get().type_input === 'boolean' && (
                                <BooleanInput
                                  fontSize={schema.get().font_size ?? 4}
                                  schema={schema}
                                />
                              )}
                              {schema.get().type_input === 'number' && (
                                <NumberInput
                                  fontSize={schema.get().font_size ?? 4}
                                  schema={schema}
                                />
                              )}
                              {schema.get().type_input === 'text' &&
                                !schema.get().is_increasing && (
                                  <TextInput
                                    fontSize={schema.get().font_size ?? 4}
                                    schema={schema}
                                  />
                                )}
                            </Box>
                          );
                        },
                      )}
                  </Box>
                )}
                {flowView && (
                  <Box p={2}>
                    <ConditionalComponent
                      idInstruction={instruction.get().id ?? ''}
                      conditions={instruction.schema_conditions}
                      // handleUpdateConditions={handleIsUpdateConditionsVal}
                      updateEditingConditions={updateEditingConditions}
                      isConnecting={false}
                      // isConnecting={isConnecting}
                      isGather={
                        instruction.get().schema_gather !== undefined &&
                        Object.keys(instruction.get().schema_gather ?? {})
                          .length > 0
                      }
                      dataGather={instruction.get().schema_gather}
                      isConditional={
                        instruction.get().schema_conditions &&
                        (instruction.get().schema_conditions ?? []).length > 0
                      }
                      showMode={true}
                    />
                  </Box>
                )}
              </>
            );
          }
          return null;
        },
      )}
      {instructions.ornull.length <= 0 && (
        <Box p={2}>
          <Typography>Seleccione alguna pregunta</Typography>
        </Box>
      )}
    </RootStyle>
  );
};

export default ConfigureSchemaInstruction;
