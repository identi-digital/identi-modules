import React, { memo } from 'react';
import { Connection, Handle, Position, useStore } from '@xyflow/react';
import {
  SchemaCondition,
  Instruction,
  InstructionFlow,
} from '../../../../../models/forms';
import BodyComponentv2 from './BodyComponent';
import ConditionBody from './ConditionBody';
import { Box, styled, Tooltip } from '@mui/material';

const ConditionsBody = styled(Box)(() => ({
  zIndex: 3,
  paddingInline: '8px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  opacity: 0.9,
  borderRadius: '0px 0px 8px 8px',
}));

type DataComponent = {
  data: InstructionFlow;
  handleInstruction: (instruction?: Instruction, keyComponent?: string) => void;
  label: string;
  handleCreateEdge: (con: Connection) => void;
  isCurrent: boolean;
  index: number;
};

type NodeComponentProps = {
  data: DataComponent;
  // handleInstruction: (instruction?: Instruction, keyComponent?: string) => void;
};

const connectionNodeIdSelector = (state: any) => state.connectionNodeId;

const NodeComponent: React.FC<NodeComponentProps> = (
  props: NodeComponentProps,
) => {
  // const { handleInstruction } = props;
  const {
    data: instruction,
    handleInstruction,
    label,
    handleCreateEdge,
    isCurrent,
    index,
  } = props.data;
  // const nodes = useNodes();
  const connectionNodeId = useStore(connectionNodeIdSelector);

  const isConnecting = !!connectionNodeId;
  const onConnect = (params: any) => handleCreateEdge(params);

  return (
    <div
      style={{
        minWidth: '315px',
        // padding: '0.5rem 1rem',
        border: '1.5px solid rgba(220, 220, 220, 1)',
        borderRadius: '8px',
        // pongo sombra azul al componente
        boxShadow: isCurrent
          ? 'rgb(43 126 193 / 77%) 0px 0px 12px 4px'
          : 'none',
        backgroundColor: 'var(--light-cream)',
        padding: '8px',
      }}
      // eslint-disable-next-line no-console
      onClick={() => console.log(props.data)}
    >
      <div
        style={{
          display: 'flex',
          marginBottom: '5px',
          // visibility: isConnecting ? 'visible' : 'hidden'
        }}
      >
        <Tooltip title={'Conector de pregunta'}>
          <Handle
            key={`${instruction?.id}`}
            id={`${instruction?.id}`}
            style={{
              left: 0,
              backgroundColor: 'white',
              border: '2px solid #3A75FF',
              width: '10px',
              height: '10px',
            }}
            type="source"
            position={Position.Top}
            isValidConnection={(connection) =>
              connection.source !== instruction?.id
            }
            onConnect={onConnect}
          />
        </Tooltip>
      </div>
      <div
        style={{ display: 'flex', alignItems: 'center' }}
        ref={instruction.reference}
      >
        <BodyComponentv2
          keyComponent={instruction.id ?? ''}
          iconTitle={'record_voice_over'}
          title={label ?? ''}
          instruction={instruction}
          handleInstruction={handleInstruction}
          idxInstruction={index}
          //   isEditDialog={instructionCurrent?.id === instruction?.id}
          isEditDialog={true}
          isConnecting={isConnecting}
        />
      </div>
      <>
        {instruction?.schema_conditions &&
          instruction?.schema_conditions?.length > 0 && (
            <ConditionsBody>
              <ConditionBody
                conditions={instruction.schema_conditions ?? []}
                idInstruction={instruction.id ?? ''}
                isConnecting={isConnecting}
                handleCreateEdge={handleCreateEdge}
              />
            </ConditionsBody>
          )}
      </>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          marginTop: '8px',
        }}
      >
        {instruction?.schema_conditions &&
          instruction?.schema_conditions.length > 0 &&
          instruction?.schema_conditions.map(
            (condition: SchemaCondition, index: number) => {
              return (
                <Box
                  key={`conditional_box_component_${instruction?.id}_${index}`}
                >
                  {condition.type_condition === 'by_unhappy' && (
                    <Tooltip title={'Camino de desacuerdo'}>
                      <Handle
                        id={condition.id}
                        style={{
                          left: 90,
                          backgroundColor: 'white',
                          border: '2px solid #D84D44',
                          width: '10px',
                          height: '10px',
                        }}
                        type="target"
                        position={Position.Bottom}
                        isValidConnection={(connection) =>
                          connection.source !== instruction?.id
                        }
                        onConnect={onConnect}
                      />
                    </Tooltip>
                  )}
                  {condition.type_condition === 'by_success' && (
                    <Tooltip title={'Camino de éxito'}>
                      <Handle
                        id={condition.id}
                        style={{
                          left: 215,
                          backgroundColor: 'white',
                          border: '2px solid #09304F',
                          width: '10px',
                          height: '10px',
                        }}
                        type="target"
                        position={Position.Bottom}
                        onConnect={onConnect}
                        isValidConnection={(connection) =>
                          connection.source !== instruction?.id
                        }
                        hidden={condition.type_condition !== 'by_success'}
                      />
                    </Tooltip>
                  )}
                </Box>
              );
            },
          )}
      </div>
    </div>
  );
};

export default memo(NodeComponent);
