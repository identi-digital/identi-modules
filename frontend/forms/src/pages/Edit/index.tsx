import { Backdrop, CircularProgress, styled } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import SidebarEdit from './components/Sidebar/SidebarContent';
import QuestionsEdit from './components/QuestionEdit/QuestionsEdit';
import ConfigureQuestion from './components/ConfigureQuestion/ConfigureQuestion';
import {
  Module,
  ModuleSchema,
  Instruction,
  ModuleTool,
  SchemaCondition,
  SchemaInput,
  ValidatorSelect,
} from '../../models/forms';
import { useNavigate, useParams } from 'react-router-dom';
// import routes from '~/routes/routes';
// import { ContextLayout } from '~/ui/templates/Layouts/Layout';
import HeaderBar from './components/HeaderBar/HeaderBar';
import { showMessage, showYesNoQuestion } from '@ui/utils/Messages';
import { State, useHookstate } from '@hookstate/core';
import { v4 as uuidv4 } from 'uuid';
import PreviewPage from './components/Preview';

// import useModules from '~/atlas/modules';
// import useSchemaModule from '~/atlas/schema_module';
// import { useAtlasData } from '~/ui/contexts/AtlasDataContext';
import { Validation, validation } from '@hookstate/validation';
import FlowEdit from './components/FlowEdit';
import { XYPosition } from '@xyflow/react';
import { getListRoute } from '@/modules/forms';
import { FormService } from '../../services/forms';
import { ModuleConfig } from '@/core/moduleLoader';

const RootStyle = styled('div')(() => ({
  display: 'flex',
  width: '100%',
  height: '70vh',
  justifyContent: 'space-between',
}));

type ContextProps = {
  operators: Array<ValidatorSelect>;
  arrayTools: ModuleTool[];
  arrayIdsDisabled: string[];
  handleDeleteInstruction: (id: string) => void;
};

type DispenserType = {
  info: SchemaInput | undefined;
  location: any;
};

export const ContextContainer = React.createContext<Partial<ContextProps>>({});

// type EditModulePageProps = {
//   instructions: State<Instruction[] | undefined, any>;
// };
interface FormsListProps {
  config?: ModuleConfig;
}
export default function EditFormsPage({ config }: FormsListProps) {
  const navigate = useNavigate();
  //   const context = useContext(ContextLayout);
  //   const { handleSetHeaderComponent } = context;
  // eslint-disable-next-line
  // @ts-ignore
  const { id_module } = useParams();

  if (!id_module) navigate(getListRoute());

  const [currentModule, setCurrentModule] = useState<Module | undefined>(
    undefined,
  );
  const [currentSchemaModule, setCurrentSchemaModule] = useState<
    ModuleSchema | undefined
  >(undefined);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isSavingData, setIsSavingData] = useState<boolean>(false);
  const [isShowPreview, setIsShowPreview] = useState<boolean>(false);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState<
    number
  >(0);
  const [flowMode, setFlowMode] = useState<boolean>(false);
  const [viewPortCenter, setViewPortCenter] = useState<XYPosition>({
    x: 0,
    y: 0,
  });

  const [operators] = useState<Array<ValidatorSelect>>([
    {
      id: 'f30c2561c12',
      name: 'exist',
      description: 'Existe',
      type_value: 'exist',
      created_at: '2022-12-05T03:02:07.003434+00:00',
    },
    {
      id: 'f30c25621d6',
      name: 'long',
      description: 'Con longitud',
      type_value: 'number',
      created_at: '2022-12-05T03:02:07.151007+00:00',
    },
    {
      id: 'f30c25629a2',
      name: 'contain',
      description: 'Contiene el texto',
      type_value: 'text',
      created_at: '2022-12-05T03:02:07.350687+00:00',
    },
    {
      id: 'f30c25630c5',
      name: 'equal',
      description: 'Es igual a',
      type_value: 'text',
      created_at: '2022-12-05T03:02:07.533304+00:00',
    },
    {
      id: 'f30c2563790',
      name: 'is_number',
      description: 'Es un numero',
      type_value: 'number',
      created_at: '2022-12-05T03:02:07.707240+00:00',
    },
    {
      id: 'f30c2563e29',
      name: 'smaller_than',
      description: 'Es menor que',
      type_value: 'number',
      created_at: '2022-12-05T03:02:07.876173+00:00',
    },
    {
      id: 'f30c256446b',
      name: 'greater_than',
      description: 'Es mayor que',
      type_value: 'number',
      created_at: '2022-12-05T03:02:08.036335+00:00',
    },
    {
      id: 'f30c2564ba0',
      name: 'prefix',
      description: 'Empieza con',
      type_value: 'text',
      created_at: '2022-12-05T03:02:08.220807+00:00',
    },
  ]);

  // const { atlasApp } = useRealmApp();
  //   const { getModuleByObjectId, updateModuleSchemaId } = useModules();
  //   const { getModuleSchemaById, createModuleSchema } = useSchemaModule();
  //   const { arrayTools } = useAtlasData();
  const [arrayTools, setArrayTools] = useState<any[]>([]);
  const stateInstructions: State<
    Instruction[] | undefined,
    Validation
  > = useHookstate<Instruction[] | undefined, Validation>(
    undefined,
    validation(),
  );

  // rules instructions

  const handleTogglePreview = () => {
    setIsShowPreview((prev: boolean) => !prev);
  };

  const addQuestion = useCallback(
    (question: Instruction) => {
      const lastInstructionCondition: SchemaCondition = {
        id: uuidv4(),
        next_instruction_id: question.id,
        type_condition: 'by_success',
      };
      if (flowMode) {
        //obj se le agrega a la ultima instrucción, indicando que la nueva es la siguiente
        lastInstructionCondition.next_instruction_id = '';
        if (question?.config) {
          question.config.space_position = {
            x: viewPortCenter.x,
            y: viewPortCenter.y,
          };
        }
        // question?.config?.space_position?.x = viewPortCenter.x;
        // question?.config?.space_position?.y = viewPortCenter.y;
      }
      stateInstructions.set(
        (instructions: State<Instruction[] | undefined, any>) => {
          if (!flowMode) {
            const updatedArray = instructions.slice();
            // console.log(updatedArray);
            if (updatedArray[updatedArray.length - 1]) {
              updatedArray[updatedArray.length - 1].schema_conditions = [
                lastInstructionCondition,
              ];
            }
            setCurrentInstructionIndex(updatedArray.length);
            return updatedArray.concat([question]);
          }
          return instructions.concat([question]);
        },
      );
    },
    [flowMode, stateInstructions, viewPortCenter.x, viewPortCenter.y],
  );

  const replaceQuestion = (question: Instruction, index: number) => {
    // setIsLoadingData(true);
    stateInstructions.set(
      (instructions: State<Instruction[] | undefined, any>) => {
        const updatedArray = instructions.slice();
        if (updatedArray[index]) {
          // obtengo las condiciones de tipo 'by_success' y by_unhappy'
          const foundConditions = updatedArray[index].schema_conditions?.filter(
            (condition: SchemaCondition) =>
              condition.type_condition === 'by_success' ||
              condition.type_condition === 'by_unhappy',
          );
          if (foundConditions && foundConditions.length > 0) {
            foundConditions.forEach((condition: SchemaCondition) => {
              const foundIndex = updatedArray.findIndex(
                (element: Instruction) => element.id === condition.id,
              );
              if (foundIndex >= 0) {
                updatedArray[foundIndex] = question;
              }
            });
          }
          // obtengo la posición de la instrucción que se quiere reemplazar
          const position = updatedArray[index].config?.space_position;
          if (position && question.config) {
            question.config.space_position = position;
          }
          updatedArray[index] = question;
        }
        return updatedArray;
      },
    );
    // setIsLoadingData(false);
  };

  const swapInstructions = (from: number, to: number) => {
    if (
      to < 0 ||
      !stateInstructions?.ornull ||
      to >= stateInstructions.ornull.length
    )
      return;
    stateInstructions.set((prev: State<Instruction[] | undefined, any>) => {
      const updatedArray = prev.slice();

      // Intercambiar instrucciones
      [updatedArray[from], updatedArray[to]] = [
        updatedArray[to],
        updatedArray[from],
      ];

      // Actualizar schema_conditions de tipo 'by_success' para todos los elementos
      updatedArray.forEach(
        (
          inst: {
            schema_conditions: {
              id: string;
              next_instruction_id: any;
              type_condition: string;
            }[];
          },
          idx: number,
        ) => {
          const nextId = updatedArray[idx + 1]?.id || null;
          if (Array.isArray(inst.schema_conditions)) {
            // Busca la condición de tipo 'by_success' y actualiza el next_instruction_id
            const found = inst.schema_conditions.find(
              (cond) => cond.type_condition === 'by_success',
            );
            if (found) {
              found.next_instruction_id = nextId;
            } else if (idx < updatedArray.length - 1) {
              // Si no existe, la crea
              inst.schema_conditions.push({
                id: uuidv4(),
                next_instruction_id: nextId,
                type_condition: 'by_success' as any, // or as TypeConditionTypes if imported
              });
            }
          } else if (idx < updatedArray.length - 1) {
            // Si no existe el array, lo crea
            inst.schema_conditions = [
              {
                id: uuidv4(),
                next_instruction_id: nextId,
                type_condition: 'by_success',
              },
            ];
          }
          if (nextId === null) {
            inst.schema_conditions = [];
          }
        },
      );
      setCurrentInstructionIndex(to);
      return updatedArray;
    });
  };

  const handleChangeIndexCurrentInstruction = useCallback((index: number) => {
    setCurrentInstructionIndex(index);
  }, []);

  const handleDeleteInstruction = useCallback((id: string) => {
    showYesNoQuestion(
      '¿Seguro de querer eliminar la pregunta?',
      '',
      'warning',
    ).then((val: any) => {
      if (val) {
        setCurrentSchemaModule((prev: ModuleSchema | undefined) => {
          if (prev && prev.instructions.length > 0) {
            const newInstructions = prev.instructions.filter(
              (item: Instruction) => item.id === id,
            );
            return { ...prev, instructions: newInstructions };
          }
          return prev;
        });
      }
    });
  }, []);

  const addValue = (obj: any, path: string, newName: string, newValue: any) => {
    const keys = path.split('.');

    const lastObj = keys.reduce((acc, currentKey) => {
      // Si la currentKey es una cadena vacía, permanece en el nivel actual.
      if (currentKey === '') {
        return acc;
      }
      // De lo contrario, avanza al nivel del objeto o crea uno si no existe.
      acc[currentKey] = acc[currentKey] || {};
      return acc[currentKey];
    }, obj);

    // Asigna la nueva clave y valor en el nivel correcto.
    lastObj[newName] = newValue;
    return obj;
  };

  function extraerPatrones(texto: string): string[] {
    const regex = /\{\{\s*(.*?)\s*\}\}/g;
    const coincidencias: string[] = [];
    let match;

    while ((match = regex.exec(texto)) !== null) {
      coincidencias.push(match[1]);
    }

    return coincidencias;
  }

  const handleGetMetadataInstructions = (instruction: Instruction): any => {
    // dispensador
    const dispenser: DispenserType[] = [];
    if (instruction.schema_input && instruction.schema_input?.length <= 0) {
      return null;
    }
    let result: any = {};
    // se agregan los primeros items

    const schemaInputArray: SchemaInput[] = instruction.schema_input ?? [];
    for (const payload of schemaInputArray) {
      dispenser.push({
        info: payload,
        location: '',
      });
    }
    const schemaInputAdvanceArray: SchemaInput[] =
      instruction.schema_input_advanced ?? [];
    for (const payload of schemaInputAdvanceArray) {
      dispenser.push({
        info: payload,
        location: '',
      });
    }

    const newDispenser: any[] = Object.assign([], dispenser ?? []);
    while (newDispenser.length > 0) {
      const item = newDispenser.pop();
      const schemaInput = item?.info;
      const location = item?.location;
      if (schemaInput) {
        const {
          name,
          type_input,
          value,
          is_increasing,
          rules,
          options,
        } = schemaInput;
        if (is_increasing) {
          //sera una lista
          if (value && Array.isArray(value) && value.length > 0) {
            const arrValues = value.map((element: any) => element.value);
            if (arrValues.length > 0) {
              const newObj = addValue(result, location, name ?? '', arrValues);
              result = newObj;
            }
          } else if (
            typeof value === 'string' &&
            extraerPatrones(value).length > 0
          ) {
            const newObj = addValue(result, location, name ?? '', value.trim());
            result = newObj;
          }
          if (type_input === 'dict') {
            const newObj = addValue(
              result,
              location,
              name ?? '',
              value ?? null,
            );
            result = newObj;
            const schemaInputArray: SchemaInput[] =
              schemaInput.schema_input ?? [];
            for (const payload of schemaInputArray) {
              newDispenser.push({
                info: payload,
                location: `${location}`.concat(`${name}.`),
              });
            }
          }
        } else {
          //no es una lista
          if (type_input === 'dict') {
            const newObj = addValue(
              result,
              `${location}`.concat(`${name}.`),
              name ?? '',
              value ?? null,
            );
            result = newObj;
            const schemaInputArray: SchemaInput[] =
              schemaInput.schema_input ?? [];
            for (const payload of schemaInputArray) {
              newDispenser.push({
                info: payload,
                location: `${location}`.concat(`${name}.`),
              });
            }
          } else if (type_input === 'options') {
            if (rules && rules.options && Array.isArray(rules.options)) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              let valueData: any = '';
              rules.options.forEach((ruleObj: any) => {
                if (ruleObj.rule === 'select') {
                  if (ruleObj.value === 'multiple') {
                    valueData = [];
                  }
                }
                if (ruleObj.rule === 'data') {
                  if (ruleObj.value === 'simple') {
                    valueData = value;
                  }
                  if (ruleObj.value === 'all') {
                    const newArrResult: any[] = [];
                    if (Array.isArray(value) && value.length > 0) {
                      //value debe ser un arreglo de strings
                      value.forEach((element: any) => {
                        const obj = options.find(
                          (opt: any) => opt.id === element,
                        );
                        if (obj) {
                          newArrResult.push(obj);
                        }
                      });
                    }
                    if (newArrResult.length > 0) {
                      const newObj = addValue(
                        result,
                        location,
                        name ?? '',
                        newArrResult ?? [],
                      );
                      result = newObj;
                    }
                  }
                }
              });
            }
          } else {
            const newObj = addValue(
              result,
              location,
              name ?? '',
              value ?? null,
            );
            result = newObj;
          }
        }
      }
    }
    return result;
  };

  const handleSaveModule = useCallback(() => {
    if (id_module) {
      const tempInstructions: Instruction[] = JSON.parse(
        JSON.stringify(stateInstructions.value),
      );
      // console.log(tempInstructions);
      const newInstructions = tempInstructions.map(
        (instruction: Instruction) => {
          const metadata = handleGetMetadataInstructions(instruction);
          // console.log(metadata);
          return { ...instruction, metadata: { data_input: metadata } };
        },
      );
      if (Array.isArray(newInstructions) && newInstructions.length > 0) {
        showYesNoQuestion(
          '',
          '¿Seguro de querer guardar los cambios del módulo?',
          'info',
          false,
        ).then((val: any) => {
          if (val) {
            setIsSavingData(true);
            //create new schema to save
            // const newIdSchema = uuidv4();
            const newSchema: any = {
              // idRef: newIdSchema,
              // instruction_group_summary: [],
              instruction_start: newInstructions[0].id ?? '',
              instructions: newInstructions,
              module_id: currentSchemaModule?.module_id ?? '',
              schema_gather_summary: [],
              created_at: new Date(),
            };
            console.log('createModuleSchema', newSchema);
            setIsSavingData(false);
            FormService.createFormSchema(id_module, {
              schema: newSchema,
            })
              .then(() => {
                setIsSavingData(false);
                showMessage(
                  '',
                  'Se guardaron los cambios correctamente.',
                  'success',
                  false,
                );
                navigate(getListRoute());
              })
              .catch(() => {
                setIsSavingData(false);
                showMessage(
                  '',
                  'No se pudieron guardar los cambios correctamente.',
                  'error',
                  false,
                );
              });

            // createModuleSchema(newSchema)
            //   .then((_resp: any) => {
            //     // console.log(resp);

            //     updateModuleSchemaId(id_module, newIdSchema)
            //       .then(() => {
            //         setIsSavingData(false);
            //         showMessage(
            //           '',
            //           'Se guardaron los cambios correctamente.',
            //           'success',
            //           false,
            //         );
            //         navigate(routes.collection);
            //       })
            //       .catch(() => {
            //         setIsSavingData(false);
            //         showMessage(
            //           '',
            //           'No se pudieron guardar los cambios correctamente.',
            //           'error',
            //           false,
            //         );
            //       });
            //   })
            //   .catch(() => {
            //     setIsSavingData(false);
            //     showMessage(
            //       '',
            //       'No se pudieron guardar los cambios correctamente.',
            //       'error',
            //       false,
            //     );
            //   });
          }
        });
      } else {
        showMessage(
          '',
          'Debe tener al menos una pregunta para guardar los cambios',
          'error',
          true,
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSchemaModule, id_module]);

  const handleUpdateViewPortCenter = useCallback((position: XYPosition) => {
    // console.log(position);
    setViewPortCenter(position);
  }, []);

  useEffect(() => {
    if (id_module) {
      // console.log(id_module);
      setIsLoadingData(true);
      //get modulo
      FormService.getById(id_module)
        .then((resp: any) => {
          setCurrentModule(resp);
          console.log(resp);
          setCurrentSchemaModule(resp?.schema);
          stateInstructions.set(
            Object.assign([], resp?.schema?.instructions ?? []),
          );
          setIsLoadingData(false);
        })
        .catch(() => {
          setIsLoadingData(false);
          showMessage('', 'No se pudo obtener el módulo', 'error', true);
          navigate(getListRoute());
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_module, navigate]);

  const handleToggleFlowMode = () => {
    setFlowMode((prev) => !prev);
  };

  //   useEffect(() => {
  //     if (handleSetHeaderComponent) {
  //       handleSetHeaderComponent(
  //         <HeaderBar
  //           isLoading={isSavingData}
  //           isShowPreview={isShowPreview}
  //           handleSaveModule={handleSaveModule}
  //           isValid={stateInstructions.valid()}
  //           handleTogglePreview={handleTogglePreview}
  //           moduleName={currentModule?.name ?? ''}
  //           handleToggleFlowMode={handleToggleFlowMode}
  //           flowMode={flowMode}
  //         />,
  //       );
  //     }
  //     return () => {
  //       if (handleSetHeaderComponent) {
  //         handleSetHeaderComponent(undefined);
  //       }
  //     };
  //     // }, [handleSaveModule, handleSetHeaderComponent, isSavingData, isShowPreview, stateInstructions]);

  //     // useEffect(() => {
  //     //   console.log('State Instructions Valid:', stateInstructions.valid());
  //     //   console.log('State Instructions Errors:', stateInstructions.errors());
  //     // }, [stateInstructions]);
  //   }, [
  //     currentModule?.name,
  //     flowMode,
  //     handleSaveModule,
  //     handleSetHeaderComponent,
  //     isSavingData,
  //     isShowPreview,
  //     stateInstructions,
  //   ]);

  useEffect(() => {
    if (arrayTools.length === 0) {
      FormService.getTools(1, 100, 'name', 'asc', '')
        .then((resp: any) => {
          console.log(resp?.items);
          setArrayTools(resp?.items);
        })
        .catch(() => {
          setArrayTools([]);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <HeaderBar
        isLoading={isSavingData}
        isShowPreview={isShowPreview}
        handleSaveModule={handleSaveModule}
        isValid={stateInstructions.valid()}
        handleTogglePreview={handleTogglePreview}
        moduleName={currentModule?.name ?? ''}
        handleToggleFlowMode={handleToggleFlowMode}
        flowMode={flowMode}
      />
      <RootStyle>
        <ContextContainer.Provider
          value={{
            operators,
            arrayTools,
            arrayIdsDisabled: ['7', '8', '10', '12', '14', '16', '17'],
            handleDeleteInstruction,
          }}
        >
          {!isLoadingData && currentModule && currentSchemaModule ? (
            <>
              {isShowPreview ? (
                <>
                  <PreviewPage
                    instructions={stateInstructions ?? []}
                    moduleName={currentModule.name ?? ''}
                  />
                </>
              ) : (
                <>
                  <SidebarEdit
                    questionsModule={stateInstructions || []}
                    currentIndex={currentInstructionIndex}
                    handleAddQuestion={addQuestion}
                    handleChangeIndexCurrentInstruction={
                      handleChangeIndexCurrentInstruction
                    }
                  />
                  {flowMode ? (
                    <FlowEdit
                      instructions={stateInstructions ?? []}
                      initialInstructionId={
                        currentSchemaModule?.instruction_start
                      }
                      currentInstructionIndex={currentInstructionIndex}
                      flowView={flowMode}
                      handleChangeIndexCurrentInstruction={
                        handleChangeIndexCurrentInstruction
                      }
                      handleUpdateViewPortCenter={handleUpdateViewPortCenter}
                    />
                  ) : (
                    <QuestionsEdit
                      moduleName={currentModule.name ?? ''}
                      instructions={stateInstructions ?? []}
                      currentInstructionIndex={currentInstructionIndex}
                      swapInstructions={swapInstructions}
                    />
                  )}
                  <ConfigureQuestion
                    instructions={stateInstructions ?? []}
                    currentInstructionIndex={currentInstructionIndex}
                    replaceQuestion={replaceQuestion}
                    flowView={flowMode}
                    handleChangeIndexCurrentInstruction={
                      handleChangeIndexCurrentInstruction
                    }
                  />
                </>
              )}
            </>
          ) : (
            <>
              <Backdrop
                sx={{
                  color: '#fff',
                  zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={true}
              >
                <CircularProgress color="inherit" />
              </Backdrop>
            </>
          )}
        </ContextContainer.Provider>
      </RootStyle>
    </>
  );
}
