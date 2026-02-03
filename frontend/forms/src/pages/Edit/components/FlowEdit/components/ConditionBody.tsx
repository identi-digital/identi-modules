import React, { useContext } from 'react';
import { Box, styled, Tooltip } from '@mui/material';
import {
  SchemaCondition,
  Validator,
  ValidatorSelect,
} from '../../../../../models/forms';
import { ContextContainer } from '../../../index';
import { Connection, Handle, Position } from '@xyflow/react';
import '../global.css';

const ConditionsBoxStyle = styled(Box)(() => ({
  border: '1px dashed rgba(204, 211, 221, 1)',
  padding: '12px',
  margin: 0,
  marginTop: '8px',
  fontSize: '14px',
  borderRadius: '4px',
  fontWeight: 600,
  color: 'rgba(235, 121, 35, 1)',
}));

export type editingConditionals = {
  idInstruction: string;
  newConditions: SchemaCondition[];
};

type ConditionalComponentProps = {
  idInstruction: string;
  conditions: SchemaCondition[];
  isConnecting: boolean;
  handleCreateEdge: (conn: Connection) => void;
};

const ConditionalComponent: React.FC<ConditionalComponentProps> = (
  props: ConditionalComponentProps,
) => {
  const { conditions, idInstruction, handleCreateEdge } = props;
  // let first: number = 55;
  const context = useContext(ContextContainer);
  const { operators } = context;

  return (
    <>
      {conditions &&
        conditions.length > 0 &&
        conditions.map((element: SchemaCondition, index: number) => {
          // first = first + 48;
          // first = first + 48 + (element.validators?.length || 1) * 15;
          // first = first + 40 + (element.validators?.length || 1) * 5;

          return (
            <React.Fragment
              key={`conditional_box_component_${idInstruction}_${index}`}
            >
              {element.type_condition !== 'by_success' &&
                element.type_condition !== 'by_unhappy' && (
                  <div>
                    <ConditionsBoxStyle
                      display="flex"
                      flexDirection={'column'}
                      mt={1}
                      mb={2}
                    >
                      <Box
                        key={`condition_${index}`}
                        display="flex"
                        alignItems={'center'}
                        justifyContent={'space-between'}
                      >
                        <Box>
                          {element.validators &&
                            element.validators?.length > 0 &&
                            element.validators?.map(
                              (operador: Validator, idx: number) => {
                                // if (idx >= 1) {
                                //   first += 10;
                                // }
                                return (
                                  <Box
                                    key={`condition_${index}_operator_${idx}`}
                                    display={'flex'}
                                    paddingBottom="5px"
                                  >
                                    <Box
                                      sx={{
                                        fontWeight: 500,
                                        color: 'var(--navy-primary)',
                                      }}
                                    >
                                      {operators?.map(
                                        (element: ValidatorSelect) => {
                                          return (
                                            operador.validator_name ===
                                              element.name &&
                                            element.description
                                          );
                                        },
                                      )}
                                    </Box>
                                    {operador.validator_name !== 'exist' &&
                                      operador.validator_name !==
                                        'is_number' && (
                                        <Box>:&nbsp;{operador.value}</Box>
                                      )}
                                  </Box>
                                );
                              },
                            )}
                        </Box>
                        <Tooltip title={`Conector de condición ${index + 1}`}>
                          <Handle
                            id={`${element.id}`}
                            style={{
                              // top: first,
                              backgroundColor: 'white',
                              border: '2px solid #09304F',
                              width: '10px',
                              height: '10px',
                              // right: '0',
                              position: 'relative',
                              left: '30px',
                            }}
                            isValidConnection={(connection) =>
                              connection.source !== idInstruction
                            }
                            onConnect={(params: any) =>
                              handleCreateEdge(params)
                            }
                            type="target"
                            position={Position.Right}
                          />
                        </Tooltip>
                      </Box>
                    </ConditionsBoxStyle>
                  </div>
                )}
            </React.Fragment>
          );
        })}
    </>
  );
};

export default ConditionalComponent;
