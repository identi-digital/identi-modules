import React, { useContext, useEffect } from 'react';
import {
  Box,
  TextField,
  Select,
  FormControl,
  styled,
  MenuItem,
  Tooltip,
  Divider,
  Button,
  Typography,
} from '@mui/material';
// import { makeStyles } from '@mui/styles';
import MaterialIcon from '@mui/material/Icon';
import {
  SchemaGather,
  OperatorSelect,
  SchemaCondition,
  Validator,
} from '../../../../../../models/forms';
import { v4 as uuidv4 } from 'uuid';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { ContextContainer } from '../../../../';
import { ContextContainer as FlowContext } from '../../';
import { editingConditionals } from '../BodyComponent';
// import TitleComponent from '../TitleComponent';
import FilterAltSharpIcon from '@mui/icons-material/FilterAltSharp';
import { State } from '@hookstate/core';
// import PointConnector from '../PanelComponents/PointConnector';

const BoxCursorStyle = styled(Box)({
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
});

type ConditionalComponentProps = {
  idInstruction: string;
  conditions: State<SchemaCondition[] | undefined>;
  // handleUpdateConditions: (val: boolean) => void;
  updateEditingConditions: (val: editingConditionals) => void;
  isConnecting: boolean;
  // handleCreateConnection: (e: any, idInstruction: string, idxCondition: number) => void;
  isGather?: boolean;
  dataGather?: State<SchemaGather | undefined, any>;
  isConditional?: boolean;
  showMode: boolean;
};

// const gatherTypes: Array<any> = [
//   {
//     display_name: 'Cadena',
//     value: 'text'
//   },
//   {
//     display_name: 'Entero',
//     value: 'number'
//   },
//   {
//     display_name: 'Si o No',
//     value: 'boolean'
//   },
//   {
//     display_name: 'Multimedia',
//     value: 'media'
//   },
//   {
//     display_name: 'Lista',
//     value: 'list'
//   },
//   {
//     display_name: 'Geojson',
//     value: 'geojson'
//   },
//   {
//     display_name: 'Entidad',
//     value: 'entity'
//   },
//   {
//     display_name: 'Opción',
//     value: 'option'
//   }
// ];

const ConditionalComponent: React.FC<ConditionalComponentProps> = (
  props: ConditionalComponentProps,
) => {
  const {
    idInstruction,
    isGather,
    showMode,
    // dataGather,
    isConditional,
    conditions,
  } = props;
  // const classes = useStyles();
  const context = useContext(ContextContainer);
  const flow_context = useContext(FlowContext);
  const { operators } = context;
  const { getGatherVars } = flow_context;
  // console.log(operators);
  // const [isConditionalValue, setIsConditionalValue] = useState<string>('');
  // const [conditionsLocal, setConditionsLocal] = useState<Array<SchemaCondition>>([]);
  // const [restConditions, setRestConditions] = useState<Array<SchemaCondition>>([]);
  // const [dataGatherLocal, setDataGatherLocal] = useState<SchemaGather>({ id: '', name: '', type_value: 'text' });

  // const handleDataGatherValues = useCallback((e: any) => {
  //   const { name, value } = e.target;
  //   setDataGatherLocal((prevValue: SchemaGather) => {
  //     return { ...prevValue, [name]: value };
  //   });
  // }, []);

  const addCondition = () => {
    // agrego una condicional al state de conditions
    const newCondition: SchemaCondition = {
      id: uuidv4(),
      next_instruction_id: '',
      validators: [
        {
          // name_env: isConditionalValue !== '' ? isConditionalValue : '',
          validator_name: '',
          value: '',
        },
      ],
      type_condition: 'by_var',
    };
    conditions.set((conditions2) => (conditions2 || []).concat([newCondition]));

    // setConditionsLocal((prevValue: Array<SchemaCondition>) => {
    //   const newConditions = Object.assign([], prevValue);
    //   const newCondition: SchemaCondition = {
    //     id: uuidv4(),
    //     next_instruction_id: '',
    //     validators: [
    //       {
    //         // name_env: isConditionalValue !== '' ? isConditionalValue : '',
    //         validator_name: '',
    //         value: ''
    //       }
    //     ],
    //     type_condition: 'by_gather'
    //     // type_condition: isGather ? 'by_gather' : isConditional ? 'by_env' : ''
    //   };
    //   newConditions.push(newCondition);
    //   return [...newConditions];
    // });
  };

  // const deleteCondition = useCallback(
  //   (index: number) => {
  //     const newConditions = Object.assign([], conditionsLocal);

  //     newConditions.splice(index, 1);
  //     setConditionsLocal(newConditions);
  //   },
  //   [conditionsLocal]
  // );

  // const deleteOperator = useCallback((idxCondition: number, idxIOperator: number) => {
  //   // console.log(index);

  //   setConditionsLocal((prev: SchemaCondition[]) => {
  //     const newConditions: SchemaCondition[] = Object.assign([], prev);
  //     // if (newConditions.length > 1) {
  //     // newConditions[idxCondition].operator
  //     const operador = newConditions[idxCondition].validators;
  //     if (operador && operador.length > 1) {
  //       // delete operador[idxIOperator];
  //       operador.splice(idxIOperator, 1);
  //       return [...newConditions];
  //     }
  //     // }
  //     return [...prev];
  //   });
  // }, []);
  // const addOperator = useCallback((idxCondition: number) => {
  //   setConditionsLocal((prev: SchemaCondition[]) => {
  //     const newConditions: SchemaCondition[] = Object.assign([], prev);
  //     // console.log(typeof newConditions);
  //     if (newConditions) {
  //       newConditions[idxCondition].validators?.push({
  //         // name_env: isConditionalValue !== '' ? isConditionalValue : '',
  //         validator_name: '',
  //         value: ''
  //       });
  //       return [...newConditions];
  //     }
  //     return [...prev];
  //   });
  // }, []);

  // const handleOnChangeConditionValue = useCallback(
  //   (e: any, idxOperator: number, idxInstruction: number) => {
  //     // console.log(conditions[index]);
  //     const valor = e.target.value;
  //     // console.log(valor);
  //     const newConditions = conditionsLocal.map((obj: SchemaCondition, index: number) => {
  //       if (index === idxInstruction) {
  //         const validatorsLocal = Object.assign([], obj.validators);
  //         const newValidators = validatorsLocal.map((validator: Validator, ix: number) => {
  //           if (ix === idxOperator) {
  //             const objoperator: Validator = {
  //               ...validator,
  //               value: valor
  //             };
  //             return objoperator;
  //           }
  //           return validator;
  //         });
  //         return { ...obj, validators: newValidators };
  //       }
  //       return obj;
  //     });
  //     setConditionsLocal(newConditions);
  //   },
  //   [conditionsLocal]
  // );

  // const handleChangeSelectOperator = useCallback(
  //   (e: any, idxOperator: number, idxCondition: number) => {
  //     // console.log(e);
  //     console.log(idxOperator);
  //     console.log(idxCondition);
  //     const operatorSelected = operators?.find((op: ValidatorSelect) => op.name === e.target.value);
  //     if(conditions.ornull){
  //       const newConditions = conditions.ornull.map((obj: State<SchemaCondition>, index: number) => {
  //         if (index === idxCondition) {
  //           const operatorsLocal = Object.assign([], obj.validators);
  //           const newOperators = operatorsLocal.map((operator: Validator, ix: number) => {
  //             if (ix === idxOperator) {
  //               const objoperator: Validator = {
  //                 ...operator,
  //                 validator_name: operatorSelected?.name ?? ''
  //               };
  //               return objoperator;
  //             }
  //             return operator;
  //           });
  //           return { ...obj, validators: newOperators };
  //         }
  //         return obj;
  //       });
  //       console.log(newConditions);
  //       setConditionsLocal(newConditions);
  //     }
  //   },
  //   [conditionsLocal, operators]
  // );

  // const handleChangeSelectIsConditional = useCallback((e: any) => {
  //   setIsConditionalValue(e.target.value);
  //   setConditionsLocal((prev: SchemaCondition[]) => {
  //     const newConditions: SchemaCondition[] = prev.map((element: SchemaCondition) => {
  //       if (element.validators) {
  //         const newValidators: Validator[] = element.validators.map((preValue: Validator) => {
  //           return { ...preValue, name_env: e.target.value ?? '' };
  //         });
  //         return { ...element, validators: newValidators };
  //       }
  //       return element;
  //     });
  //     return newConditions;
  //   });
  // }, []);

  // filtramos las condiciones
  // useEffect(() => {
  //   // console.log(conditions);
  //   let newConditions: SchemaCondition[] = [];
  //   newConditions = conditions.ornull.filter((condition: SchemaCondition, index: number) => {
  //     if (condition.type_condition !== 'by_success' && condition.type_condition !== 'by_unhappy') {
  //       return { ...condition, realidx: index };
  //     }
  //     return undefined;
  //   });
  //   let restConditions: SchemaCondition[] = [];
  //   restConditions = conditions.ornull.filter((condition: SchemaCondition) => {
  //     if (condition.type_condition === 'by_success' || condition.type_condition === 'by_unhappy') {
  //       return condition;
  //     }
  //     return undefined;
  //   });
  //   setRestConditions(restConditions);
  //   // console.log(restConditions);
  //   // console.log(newConditions);
  //   setConditionsLocal(newConditions);
  // }, [conditions]);

  // useEffect(() => {
  //   let newConditions: SchemaCondition[] = [];
  //   newConditions = conditions.filter((condition: SchemaCondition) => {
  //     if (condition.type_condition !== 'by_success' && condition.type_condition !== 'by_unhappy') {
  //       return condition;
  //     }
  //     return undefined;
  //   });
  //   const arr1 = Object.assign([], newConditions);
  //   const arr2 = Object.assign([], conditionsLocal);
  //   const hasChanged = JSON.stringify(arr1) !== JSON.stringify(arr2);
  //   // console.log(hasChanged);
  //   // if (hasChanged) {
  //   if (hasChanged) {
  //     const obj: editingConditionals = {
  //       idInstruction: props.idInstruction,
  //       newConditions: [...conditionsLocal, ...restConditions]
  //     };
  //     props.updateEditingConditions(obj);
  //   }
  //   props.handleUpdateConditions(hasChanged);
  //   // }
  //   // setShowUpdate(hasChanged);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [conditionsLocal, restConditions, conditions]);

  // useEffect(() => {
  //   if (conditions && conditions.length > 0 && isConditional) {
  //     conditions.forEach((element: SchemaCondition) => {
  //       // if (element.type_condition === 'by_env') {
  //       //   element.validators?.forEach((operator: Validator) => {
  //       //     if (operator && operator.name_env) {
  //       //       setIsConditionalValue(operator.name_env || '');
  //       //     }
  //       //   });
  //       // }
  //     });
  //   }
  // }, [conditions, isConditional]);

  // useEffect(() => {
  //   isGather && updateDataGather !== undefined && updateDataGather(props.idInstruction, dataGatherLocal);
  // }, [dataGatherLocal, isGather, props.idInstruction, updateDataGather]);

  useEffect(() => {
    getGatherVars && getGatherVars(idInstruction);
  }, [idInstruction, getGatherVars]);

  // useEffect(() => {
  //   // console.log(dataGather);
  //   if (dataGather && dataGather.name) {
  //     setDataGatherLocal(dataGather);
  //   }
  // }, [dataGather]);
  // useEffect(() => {
  //   console.log(operators);
  // }, [operators]);

  return (
    <Box display="flex" flexDirection={'column'} mt={1} mb={2}>
      <Typography sx={{ fontWeight: 600 }} mb={2}>
        Condicionales
      </Typography>
      {/* {showMode && isGather && (
        <Box display="flex" flexDirection={'column'}>
          <TitleComponent name="Dato recolectado " />
          <Box display="flex">
            <TextField
              label=""
              placeholder="valor"
              id={'name'}
              variant="outlined"
              size="small"
              name={'name'}
              onChange={handleDataGatherValues}
              value={dataGatherLocal.name ?? ''}
              fullWidth
            />
            <TextField
              // InputProps={{
              //   style: {
              //     fontSize: '16px',
              //     fontWeight: 400,
              //     border: '1px solid rgba(149, 149, 149, 1)'
              //   }
              // }}
              label=""
              placeholder="tipo"
              id={'type_value'}
              variant="outlined"
              size="small"
              name={'type_value'}
              select
              onChange={handleDataGatherValues}
              value={dataGatherLocal.type_value ?? ''}
              fullWidth
              sx={{ marginLeft: '8px' }}
            >
              {gatherTypes.map((option: any) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.display_name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>
      )} */}
      {/* {showMode && isConditional && (
        <Box display="flex" mb={1}>
          <Select
            id={'select_is_var_operator'}
            name={'select_is_var_operator'}
            size="small"
            title={isConditionalValue}
            value={isConditionalValue}
            fullWidth
            // sx={{ width: '50%' }}
            // value={element.operator?.value}
            onChange={(e: any) => handleChangeSelectIsConditional(e)}
            // sx={{
            //   height: '44px',
            //   border: '1px solid rgba(149, 149, 149, 1)'
            // }}
          >
            {showGatherVars?.map((element: SchemaGather, idx: number) => {
              return (
                <MenuItem key={`operator_select_${idx}`} value={element.name}>
                  {element.name}
                </MenuItem>
              );
            })}
          </Select>
        </Box>
      )} */}
      <Box mt={2}>
        {conditions.ornull &&
          conditions.ornull.length > 0 &&
          conditions.ornull
            .filter(
              (condition: State<SchemaCondition>) =>
                condition.get().type_condition !== 'by_success' &&
                condition.get().type_condition !== 'by_unhappy',
            )
            .map((elementState: State<SchemaCondition>, index: number) => {
              // const element = elementState.get();
              return (
                <div key={`condition_${index}`}>
                  <Divider style={{ color: 'rgba(149, 149, 149, 1)' }} />
                  <Box
                    display="flex"
                    alignItems={'center'}
                    justifyContent={'space-between'}
                    pb="8px"
                  >
                    {showMode ? (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          marginTop: '16px',
                        }}
                      >
                        {elementState.ornull.validators.ornull &&
                          elementState.ornull.validators.ornull.length > 0 &&
                          elementState.ornull.validators.ornull.map(
                            (operador: State<Validator>, idx: number) => {
                              // console.log(operador);
                              return (
                                <Box
                                  key={`condition_${index}_operator_${idx}`}
                                  display={'flex'}
                                  paddingBottom="5px"
                                >
                                  <FormControl
                                    required
                                    sx={{
                                      minWidth: 120,
                                      height: '44px',
                                    }}
                                  >
                                    <Select
                                      id={`select_operator_${index}_${idx}`}
                                      name={`select_operator_${index}_${idx}`}
                                      size="small"
                                      value={
                                        operador.validator_name.get() ?? ''
                                      }
                                      title={
                                        operador.validator_name.get() ?? ''
                                      }
                                      // value={element.operator?.value}
                                      onChange={(e: any) =>
                                        operador.validator_name.set(
                                          e.target.value,
                                        )
                                      }
                                      // onChange={(e: any) => handleChangeSelectOperator(e, idx, index)}
                                      // sx={{
                                      //   height: '44px',
                                      //   border: '1px solid rgba(149, 149, 149, 1)'
                                      // }}
                                    >
                                      {operators?.map(
                                        (
                                          element: OperatorSelect,
                                          idx: number,
                                        ) => {
                                          return (
                                            <MenuItem
                                              key={`operator_select_${idx}`}
                                              value={element.name}
                                            >
                                              {element.description}
                                            </MenuItem>
                                          );
                                        },
                                      )}
                                    </Select>
                                  </FormControl>
                                  {operador.validator_name.get() !== 'exist' &&
                                    operador.validator_name.get() !==
                                      'is_number' && (
                                      <TextField
                                        // InputProps={{
                                        //   style: {
                                        //     fontSize: '16px',
                                        //     fontWeight: 400,
                                        //     border: '1px solid rgba(149, 149, 149, 1)'
                                        //   }
                                        // }}
                                        label=""
                                        placeholder="valor"
                                        id={`input_operator_${index}_${idx}`}
                                        variant="outlined"
                                        size="small"
                                        name={`input_operator_${index}_${idx}`}
                                        value={
                                          operador.nested('value').get() ?? ''
                                        }
                                        type={
                                          operador.validator_name.get() ===
                                            'long' ||
                                          operador.validator_name.get() ===
                                            'smaller_than' ||
                                          operador.validator_name.get() ===
                                            'greater_than'
                                            ? 'number'
                                            : 'text'
                                        }
                                        // name={element.operator?.operator_name}
                                        // value={element.operator?.value}
                                        onChange={(e: any) =>
                                          operador
                                            .nested('value')
                                            .set(e.target.value)
                                        }
                                        // onChange={(e: any) => handleOnChangeConditionValue(e, idx, index)}
                                        sx={{ marginLeft: '8px' }}
                                      />
                                    )}
                                  <BoxCursorStyle
                                    display="flex"
                                    alignItems={'center'}
                                    // onClick={() => deleteOperator(index, idx)}
                                    onClick={() =>
                                      elementState.validators.set(
                                        (validators) => {
                                          const newValidators = (
                                            validators || []
                                          ).filter((_, i) => i !== idx);
                                          return newValidators;
                                        },
                                      )
                                    }
                                  >
                                    <Tooltip title={'Eliminar operador'}>
                                      <MaterialIcon
                                        style={{
                                          marginRight: '10px',
                                          color: '#d84d44',
                                        }}
                                      >
                                        {'close_outline'}
                                      </MaterialIcon>
                                    </Tooltip>
                                  </BoxCursorStyle>
                                </Box>
                              );
                            },
                          )}
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'flex-start',
                              alignItems: 'flex-start',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#6E767D',
                            }}
                            mr={1}
                          >
                            <BoxCursorStyle
                              display="flex"
                              alignItems={'center'}
                              onClick={() =>
                                elementState.validators.set((validators) =>
                                  (validators || []).concat([
                                    {
                                      validator_name: '',
                                      value: '',
                                    },
                                  ]),
                                )
                              }
                            >
                              <MaterialIcon style={{ marginRight: '10px' }}>
                                {'add_circle_outline'}
                              </MaterialIcon>
                              Agregar operador
                            </BoxCursorStyle>
                          </Box>
                          <Tooltip title="Eliminar condicional">
                            <BoxCursorStyle
                              display="flex"
                              alignItems={'center'}
                              onClick={
                                () => {
                                  // console.log(elementState);
                                  conditions.set((conditions) => {
                                    if (conditions) {
                                      const newConditions = conditions.filter(
                                        (condition) =>
                                          condition.id !==
                                          elementState?.get().id,
                                      );
                                      return newConditions;
                                    }
                                    return conditions;
                                  });
                                }
                                // elementState.validators.set((validators) =>
                                //   (validators || []).filter((_, i) => i !== index)
                                // )

                                //  elementState.validators.set((validators) => {
                                //       const newValidators = (validators || []).filter((_, i) => i !== idx);
                                //       return newValidators;
                                //     })
                              }
                              // onClick={() => deleteCondition(index)}
                            >
                              <DeleteOutlineIcon />
                            </BoxCursorStyle>
                          </Tooltip>
                        </Box>
                      </Box>
                    ) : (
                      <Box>{`Condición ${index + 1}`}</Box>
                    )}
                    {/* <PointConnector
                    code={`${element.id}`}
                    isConnecting={isConnecting}
                    // verifyNodeHasConecction={verifyNodeHasConnection}
                    handleCreateConnection={(e: any) => handleCreateConnection(e, props.idInstruction, index)}
                    size={showMode ? 'md' : 'sm'}
                    indexCondition={index}
                  /> */}
                  </Box>
                </div>
              );
            })}
      </Box>

      {showMode && (isGather || isConditional) && (
        <>
          <Divider style={{ color: 'rgba(149, 149, 149, 1)' }} />
          {/* <Box className={classes.boxAdditional} mt={2}>
            <Box className={classes.cursorPointer} display="flex" alignItems={'center'} onClick={addCondition}>
              <MaterialIcon style={{ marginRight: '10px' }}>{'add_circle_outline'}</MaterialIcon>
              Agregar condicional
            </Box>
          </Box> */}
          <Button
            variant="outlined"
            style={{ marginTop: '16px', paddingBlock: '12px' }}
            color={'primary'}
            onClick={addCondition}
            endIcon={<FilterAltSharpIcon />}
          >
            Añadir condicional
          </Button>
        </>
      )}
    </Box>
  );
};

export default ConditionalComponent;
