import React, { useCallback, useEffect, useRef, useState } from 'react';
import '@xyflow/react/dist/style.css';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  ReactFlowInstance,
  XYPosition,
  Node,
  Edge,
  BackgroundVariant,
  ControlButton,
  Connection,
  useReactFlow,
  MarkerType,
} from '@xyflow/react';
import {
  Instruction,
  // InstructionDefault,
  InstructionFlow,
  SchemaCondition,
  SchemaGather,
  SchemaVariable,
} from '../../../../models/forms';
import NodeComponent from './components/NodeComponent';
import EdgeComponent from './components/EdgeComponent';
import { v4 as uuidv4 } from 'uuid';
import { State } from '@hookstate/core';
import { AutoFixHighRounded } from '@mui/icons-material';
import { elkOptions, getLayoutElements } from './utils';
import './global.css';

type ContextProps = {
  //   audiosList: MediaAudio[];
  arrEnvironments: SchemaVariable[];
  //   getMedias: () => void;
  updateDataGather: (id: string, data: any) => void;
  getGatherVars: (idComponent: string) => void;
  showGatherVars: SchemaGather[];
  //   handleUpdateCurrentGatherByField: (fieldName: string, value: string) => void;
  //   handleOpenGuide: () => void;
  //   handleOpenGuideWIndex: (idx: number) => void;
  //   handleSaveCategories: (categories: SchemaTool[]) => void;
  //   categories: SchemaTool[];
};

export const ContextContainer = React.createContext<Partial<ContextProps>>({});

const nodeTypes: any = {
  dragHandleNode: NodeComponent,
};

const edgeTypes: any = {
  selfConnecting: EdgeComponent,
};

enum EditModes {
  voice = 'voice',
  text = 'text',
}

type FlowEditProps = {
  instructions: State<Instruction[] | undefined, any>;
  initialInstructionId?: string;
  flowView: boolean;
  currentInstructionIndex: number;
  handleChangeIndexCurrentInstruction: (index: number) => void;
  handleUpdateViewPortCenter: (position: XYPosition) => void;
};

const FlowEdit: React.FC<FlowEditProps> = ({
  instructions,
  initialInstructionId,
  // flowView,
  currentInstructionIndex,
  handleChangeIndexCurrentInstruction,
  handleUpdateViewPortCenter,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [
    reactFlowInstance,
    setReactFlowInstance,
  ] = useState<ReactFlowInstance | null>(null);
  // const [currentNodeId, setCurrentNodeId] = useState<string>();
  // const [keyComponent, setKeyComponent] = useState<string | undefined>();
  // const [instructionCurrent, setInstructionCurrent] = useState<Instruction | undefined>();
  // const [envsInstructionCurrent, setEnvsInstructionCurrent] = useState<SchemaVariable[]>([]);
  // const [changeCurrent, setChangeCurrent] = useState<boolean>(true);
  const [arrEnvironments, setArrEnvironments] = useState<SchemaVariable[]>([]);

  const clearEndComponentBoxCondition = useCallback(
    (con: Edge) => {
      instructions.set(
        (prevInstructions: State<Instruction[] | undefined, any>) => {
          const newInstructions = prevInstructions.map(
            (instruction: State<Instruction, any>) => {
              if (instruction.id === con.target) {
                const newConditions:
                  | SchemaCondition[]
                  | undefined = instruction?.schema_conditions?.map(
                  (condition: SchemaCondition) => {
                    if (condition.id === con.targetHandle) {
                      const conditionnew: SchemaCondition = {
                        ...condition,
                        next_instruction_id: '',
                      };
                      return conditionnew;
                    }
                    return condition;
                  },
                );
                if (newConditions) {
                  instruction.schema_conditions = newConditions;
                }
                instruction.schema_conditions = newConditions;
                return instruction;
              }
              return instruction;
            },
          );
          return newInstructions;
        },
      );
    },
    [instructions],
  );

  const handleInstruction = useCallback(
    (instruction?: Instruction, keyComponent?: string, index?: number) => {
      // console.log(instruction);
      // setChangeCurrent(true);
      // setInstructionCurrent(undefined);
      // setKeyComponent(undefined);
      // setInstructionCurrent(instruction);
      // if (instruction && instruction.schema_variables && instruction.schema_variables.length > 0) {
      //   setEnvsInstructionCurrent(instruction.schema_variables || []);
      // }
      // setKeyComponent(keyComponent);
      // setTimeout(() => {
      //   setChangeCurrent(false);
      // }, 300);
      if (index !== undefined && !isNaN(index)) {
        // instruction && setCurrentNodeId(instruction.id);
        handleChangeIndexCurrentInstruction(index);
      }
      // if(!instruction && !keyComponent){
      // console.log('container', instruction?.id, keyComponent);
      // }
    },
    [handleChangeIndexCurrentInstruction],
  );

  const addEnvironment = useCallback((envs: SchemaVariable[]) => {
    setArrEnvironments((prev: SchemaVariable[]) => [...prev, ...envs]);
  }, []);

  const handleOnAddNewComponent = useCallback(
    (item: any, delta: XYPosition): InstructionFlow => {
      //Estas añadiendo un componente desde un tool
      //obtiene las coordenadas del ultimo box para asignar las nuevas
      // console.log(monitor);
      // let boxesLength = 0;
      // boxesLength = Object.keys(boxes).length;
      // const res =
      //   boxesLength >= 1
      //     ? boxes[Object.keys(boxes)[boxesLength - 1]].position_front ?? { y: 30, x: 50 }
      //     : { y: 30, x: 50 };

      // let { x: leftAnt, y: topAnt } = res;
      // if (boxesLength >= 1) {
      //   leftAnt += 50;
      //   topAnt += 140;
      // }

      const left = delta.x;
      const top = delta.y;
      // const leftAnt = left - 280;
      const leftAnt = left;

      const topAnt = top;
      // const arrSchemaTool = item.schema_request.schema_template;

      //   const data_request: DataRequest = {
      //     content_type: '',
      //     enviroments: [],
      //     user: arrSchemaTool
      //   };

      const newIdInstruction = uuidv4();

      // const arrSchema = [item.schemaTool.schema_request];

      //asignamos condicionales
      const is_conditional = item?.is_conditional || false;
      // const data_dinamic = item?.data_dinamic;
      const is_gather = item?.is_gather;

      const is_failed_instruction = item?.is_failed_instruction;
      const is_success_instruction = item?.is_success_instruction;
      const conditions: SchemaCondition[] = [];
      if (is_conditional) {
        conditions.push({
          id: uuidv4(),
          instruction_id: newIdInstruction,
          next_instruction_id: '',
          validators: [
            {
              validator_name: '',
              value: '',
            },
          ],
          //   type_condition: 'by_env'
        });
      }
      // let dataGather = undefined;
      if (is_gather) {
        // dataGather = {
        //   name: '',
        //   type_value: '',
        //   is_form: true
        // };
        conditions.push({
          id: uuidv4(),
          instruction_id: newIdInstruction,
          next_instruction_id: '',
          validators: [
            {
              validator_name: '',
              value: '',
            },
          ],
          type_condition: 'by_gather',
        });
      }
      const failedIdCondition = uuidv4();
      if (is_failed_instruction) {
        conditions.push({
          id: failedIdCondition,
          instruction_id: newIdInstruction,
          next_instruction_id: '',
          validators: [],
          type_condition: 'by_unhappy',
        });
      }
      const successIdCondition = uuidv4();
      if (is_success_instruction) {
        conditions.push({
          id: successIdCondition,
          instruction_id: newIdInstruction,
          next_instruction_id: '',
          validators: [],
          type_condition: 'by_success',
        });
      }

      //asignar environments
      const envs: SchemaVariable[] = item?.schema_response?.enviroments ?? [];
      if (envs.length > 0) {
        addEnvironment(envs);
      }

      const newInstruction: InstructionFlow = {
        id: newIdInstruction,
        // action_id: item.schemaTool.id,
        action: {
          id: item?.id,
          description: item?.description,
          name: item?.name,
          display_name: item?.display_name,
          is_gather: is_gather,
          is_conditional: is_conditional,
          is_channel: item?.is_channel,
        },
        name: item?.display_name,
        description: item?.description,
        color: '',
        schema_conditions: conditions,
        // schema_form: arrSchemaTool,
        is_initial: false,
        is_gather: is_gather,
        is_conditional: is_conditional,
        // data_request_api: data_request,
        // falied_instruction_id: '',
        // success_instruction_id: '',
        // failed_instruction_condition_id: is_failed_instruction ? failedIdCondition : '',
        // success_instruction_condition_id: is_success_instruction ? successIdCondition : '',
        // sub_flow_id: '',
        reference: null,
        editMode: EditModes.voice,
        // data_dinamic: data_dinamic,
        position_front: {
          x: leftAnt,
          y: topAnt,
        },
        // data_gather: is_gather ? dataGather : undefined,
        // is_failed_instruction: item?.is_failed_instruction,
        // is_success_instruction: item?.is_success_instruction,
        enviroments: envs,
        position: {
          x: leftAnt,
          y: topAnt,
        },
      };
      //Devuelve nueva instrucción
      // addBox(leftAnt + 50, topAnt + 140, item.name, item.icon);
      return newInstruction;
    },
    [addEnvironment],
  );

  //   FUNCIONES PARA LOS NODOS

  const handleCreateEdge = useCallback(
    (con: Connection) => {
      instructions.set(
        (prevInstructions: State<Instruction[] | undefined, any>) => {
          return prevInstructions.map((instr: State<Instruction, any>) => {
            // console.log(instr);
            if (instr.id === con.target) {
              const newConditions:
                | SchemaCondition[]
                | undefined = instr?.schema_conditions?.map(
                (condition: SchemaCondition) => {
                  if (condition.id === con.targetHandle) {
                    const conditionnew: SchemaCondition = {
                      ...condition,
                      next_instruction_id: con.source ?? '',
                    };
                    return conditionnew;
                  }
                  return condition;
                },
              );
              if (newConditions) {
                instr.schema_conditions = newConditions;
              }
              instr.schema_conditions = newConditions;

              return instr;
            }
            return instr;
          });
        },
      );
    },
    [instructions],
  );

  // setNodes((nodes: Node[]) => {
  //   const newNodes: Node[] = nodes.map((element: Node) => {
  //     if (element?.data?.data && element.id === con.target) {
  //       const instruction: InstructionFlow = (element?.data?.data as InstructionFlow) ?? InstructionDefault;
  //       const newConditions: SchemaCondition[] | undefined = instruction?.schema_conditions?.map(
  //         (condition: SchemaCondition) => {
  //           if (condition.id === con.targetHandle) {
  //             const conditionnew: SchemaCondition = { ...condition, next_instruction_id: con.source ?? '' };
  //             return conditionnew;
  //           }
  //           return condition;
  //         }
  //       );
  //       if (newConditions) {
  //         instruction.schema_conditions = newConditions;
  //       }
  //       instruction.schema_conditions = newConditions;
  //       element.data.data = instruction;
  //       return element;
  //     }
  //     return element;
  //   });
  //   // console.log(nodes);
  //   return newNodes;
  //   // return nodes;
  // });
  //   },
  //   [setNodes]
  // );

  const onDeleteEdgeButton = useCallback(
    (edges: Edge[]) => {
      // console.log('Deleting edges:', edges);
      edges.forEach((element: Edge) => {
        setEdges((edges: Edge[]) => edges.filter((el) => el.id !== element.id));
        clearEndComponentBoxCondition(element);
      });
    },
    [clearEndComponentBoxCondition, setEdges],
  );

  const onConnect = useCallback(
    (params: any) => {
      setEdges((els: any) =>
        addEdge(
          {
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed },
            type: 'selfConnecting',
            data: {
              deleteEdge: onDeleteEdgeButton,
            },
          },
          els,
        ),
      );
    },
    [onDeleteEdgeButton, setEdges],
  );

  const onDeleteEdge = useCallback(
    (edges: Edge[]) => {
      edges.forEach((element: Edge) => {
        clearEndComponentBoxCondition(element);
      });
    },
    [clearEndComponentBoxCondition],
  );

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();
      if (reactFlowWrapper && reactFlowWrapper.current) {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        // const type = event.dataTransfer.getData('application/reactflow');
        const schemaTool = event.dataTransfer.getData('schema');

        // console.log(JSON.parse(schemaTool));

        // check if the dropped element is valid
        // if (typeof type === 'undefined' || !type) {
        //   return;
        // }

        if (reactFlowInstance) {
          const { x: vx, y: vy, zoom } = reactFlowInstance.getViewport();
          const canvasX = (event.clientX - reactFlowBounds.left - vx) / zoom;
          const canvasY = (event.clientY - reactFlowBounds.top - vy) / zoom;
          const position = {
            x: canvasX,
            y: canvasY,
          };
          const newObjInstruction = handleOnAddNewComponent(
            JSON.parse(schemaTool),
            position,
          );
          const newNode: Node = {
            id: newObjInstruction.id ?? '',
            type: 'dragHandleNode',

            position,
            data: {
              label: newObjInstruction.name ?? '',
              data: newObjInstruction,
              handleInstruction: handleInstruction,
              handleCreateEdge: handleCreateEdge,
            },
          };

          setNodes((nds) => {
            // if (nds.length === 0) {
            //   newNode.data.data.is_initial = true;
            // }
            return nds.concat(newNode);
          });
        }
      }
    },
    [
      handleCreateEdge,
      handleInstruction,
      handleOnAddNewComponent,
      reactFlowInstance,
      setNodes,
    ],
  );

  useEffect(() => {
    //asignar instrucciones a boxes
    // setIsLoadLines(false);
    // const instructions = instructions as Instruction[];
    // console.log(instructions);
    // const localInstructions = instructions;
    // console.log(localInstructions);
    // let newBoxes: BoxCanvas = {};
    // let newLines: LineCanvas = {};
    const localInstructions: InstructionFlow[] = [];
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    instructions &&
      instructions.ornull.forEach(
        (question: State<Instruction>, _index: number) => {
          const newInstruction = JSON.parse(JSON.stringify(question.get()));
          // console.log(newInstruction);
          localInstructions.push(newInstruction);
        },
      );
    if (localInstructions && localInstructions.length >= 1) {
      localInstructions.forEach((element: InstructionFlow, index: number) => {
        // if (element.id === 'f47235b7-66ed-4075-99aa-bcaab105404a') {
        //   element.is_array = true;
        // }
        if (initialInstructionId && initialInstructionId === element.id) {
          element.is_initial = true;
        }
        // element.is_conditional = Boolean(element?.action?.is_conditional);
        // element.is_array = Boolean(element?.action?.is_array);
        // element.is_gather = Boolean(element?.action?.is_gather);
        element.is_gather = element?.config?.is_gather;
        if (element.schema_variables && element.schema_variables.length > 0) {
          addEnvironment(element.schema_variables);
        }
        if (element.is_gather) {
          element.schema_gather = element.schema_gather;
        }
        // if (element.is_conditional) {
        //   addEnvironment(element.enviroments);
        // }
        // element.reference = referenceBox;
        element.editMode = EditModes.voice;
        const x = element?.config?.space_position?.x || 0;
        const y = element?.config?.space_position?.y || 0;
        element.position = {
          x,
          y,
        };
        element.position_front = {
          x,
          y,
        };
        //varifica si tiene condicionales
        //crea las conexiones
        if (element.schema_conditions && element.schema_conditions.length > 0) {
          const conditionsupdate: SchemaCondition[] = element.schema_conditions.map(
            (condition: SchemaCondition) => {
              const idLine = uuidv4();
              if (condition.type_condition === 'by_success') {
                element.success_instruction_condition_id = condition.id;
                element.is_success_instruction = true;
                element.success_instruction_id =
                  condition.next_instruction_id !== ''
                    ? condition.next_instruction_id
                    : '';
              }
              if (condition.type_condition === 'by_unhappy') {
                element.failed_instruction_condition_id = condition.id;
                element.is_failed_instruction = true;
                element.falied_instruction_id =
                  condition.next_instruction_id !== ''
                    ? condition.next_instruction_id
                    : '';
              }
              if (condition.type_condition === 'by_var') {
              }

              if (
                condition.next_instruction_id &&
                condition.next_instruction_id !== ''
              ) {
                if (condition.id !== '') {
                  // const newLine: LineCanvas = {
                  //   [idLine]: {
                  //     start: condition.id ?? '',
                  //     end: condition.next_instruction_id ?? '',
                  //     instructionConditions: element.id ?? ''
                  //   }
                  // };
                  const newLine: any = {
                    id: idLine,
                    target: element.id ?? '',
                    targetHandle: condition.id ?? '',
                    source: condition.next_instruction_id ?? '',
                    type: 'selfConnecting',
                    markerEnd: { type: MarkerType.ArrowClosed },
                    data: {
                      deleteEdge: onDeleteEdgeButton,
                    },
                    // start: condition.id ?? '',
                    // end: condition.next_instruction_id ?? '',
                    // instructionConditions: element.id ?? ',
                  };
                  newEdges.push(newLine);
                  // newLines = { ...newLines, ...newLine };
                }
                // element.is_conditional = true;
                return { ...condition, lineId: idLine };
              }
              return { ...condition, lineId: '' };
            },
          );

          if (conditionsupdate && conditionsupdate.length > 0) {
            element.schema_conditions = conditionsupdate;
          }
        }

        // if (element.data_gather) {
        //   element.is_gather = true;
        // }

        const newInstr = {
          ...element,
        };
        // cuando cuantos schemaconditions hay con type_condition by_var
        let byVarConditions: any = [];
        if (
          element.schema_conditions &&
          Array.isArray(element.schema_conditions) &&
          element.schema_conditions.length > 0
        ) {
          byVarConditions = element.schema_conditions.find(
            (condition: SchemaCondition) =>
              condition.type_condition === 'by_var',
          );
        }
        const newNode: Node = {
          id: newInstr.id ?? '',
          data: {
            isCurrent: index === currentInstructionIndex,
            data: newInstr,
            handleInstruction: handleInstruction,
            handleCreateEdge: handleCreateEdge,
            label: newInstr?.action?.display_name ?? '',
            index: index,
          },
          position: {
            x: newInstr.position.x,
            y: newInstr.position.y,
          },
          height: 114 + byVarConditions?.length * 55,
          type: 'dragHandleNode',
        };
        // newNodes = [...newNodes, newNode];
        newNodes.push(newNode);
        // newBoxes = { ...newBoxes, ...newInstr };
      });
    }
    // console.log(newLines);
    // setBoxes(newBoxes);
    // renderLines(instructions);
    // setTimeout(() => {
    // console.log(newEdges);
    setNodes(newNodes);
    setEdges(newEdges);
    // setEdges(newLines);
    // setLines(newLines);
    // setIsLoadLines(true);
    // }, 1000);
  }, [
    addEnvironment,
    instructions,
    initialInstructionId,
    currentInstructionIndex,
    handleCreateEdge,
    handleInstruction,
    onDeleteEdgeButton,
    setEdges,
    setNodes,
  ]);

  const onLayout = useCallback(
    ({ direction }: { direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' }) => {
      const opts = { 'elk.direction': direction, ...elkOptions };
      const ns: any = nodes;
      const es: any = edges;

      getLayoutElements(ns, es, opts).then((props: any) => {
        if (props) {
          // eslint-disable-next-line react/prop-types
          const { nodes: nodesLayout, edges: edgesLayout } = props;
          // eslint-disable-next-line react/prop-types
          if (
            edgesLayout &&
            nodesLayout &&
            Array.isArray(nodesLayout) &&
            nodesLayout.length > 0
          ) {
            // actualizo el estado de las instructions con las nuevas coordenadas de los nodos
            instructions.set(
              (prevInstructions: State<Instruction[] | undefined, any>) => {
                return prevInstructions.map(
                  (instr: State<Instruction, any>) => {
                    // eslint-disable-next-line react/prop-types
                    const newNode = nodesLayout.find(
                      (node: any) => node.id === instr.id,
                    );
                    if (newNode) {
                      return {
                        ...instr,
                        config: {
                          ...instr.config,
                          space_position: {
                            x: newNode.position.x,
                            y: newNode.position.y,
                          },
                        },
                      };
                    }
                    return instr;
                  },
                );
              },
            );
            // setNodes(nodesLayout);
            setEdges(edgesLayout);

            window.requestAnimationFrame(() => fitView());
          }
        }
      });
    },
    [nodes, edges, instructions, setEdges, fitView],
  );

  const getStartLines = useCallback(
    (id: string, prevId?: string): string[] => {
      const arrStarts = new Set<string>();
      for (let i = 0; i < edges.length; i++) {
        const element = edges[i];
        if (element.source === id) {
          if (prevId) {
            if (prevId !== element.target) {
              arrStarts.add(element.target);
            }
          } else {
            arrStarts.add(element.target);
          }
        }
      }
      return Array.from(arrStarts);
    },
    [edges],
  );

  const getGatherBoxes = useCallback(
    (arrStarts: string[]): SchemaGather[] | undefined => {
      if (arrStarts.length > 0) {
        const arrGathers: SchemaGather[] = [];
        for (let i = 0; i < arrStarts.length; i++) {
          const objFind: any = nodes.find(
            (node: Node) => node.id === arrStarts[i],
          );
          // const newObj: Instruction = Object.assign({}, objFind?.data);
          if (objFind && objFind.data) {
            const { data } = objFind?.data;
            if (data) {
              const { data_gather, enviroments } = data;
              if (data?.id === arrStarts[i] && data_gather) {
                arrGathers.push(data_gather);
              }
              if (enviroments && enviroments.length > 0) {
                enviroments.forEach((element: SchemaVariable) => {
                  const obj: SchemaGather = {
                    id: '',
                    name: element.name,
                    type_value: element.type_value,
                  };
                  if (obj.name) {
                    arrGathers.push(obj);
                  }
                });
              }
            }
          }
        }
        // for (const [, value] of Object.entries(boxes)) {
        //   if (value.data_gather) {
        //     arrGathers.push(value.data_gather);
        //   }
        // }
        return arrGathers;
      }
    },
    [nodes],
  );

  const saveGathersToArray = useCallback(
    (idPrincipalComponent: string, prev?: string, recorridos?: string[]) => {
      let arrGathers: SchemaGather[] = [];

      let arrRecorridos: string[] = [];
      if (recorridos && recorridos.length > 0) {
        arrRecorridos = [...recorridos];
      } else {
        arrRecorridos.push(idPrincipalComponent);
      }
      const arrStarts = getStartLines(idPrincipalComponent, prev);
      if (arrStarts.length > 0) {
        const arr = getGatherBoxes(arrStarts);
        if (arr !== undefined) {
          arrGathers = [...arrGathers, ...arr];
        }
        if (arrGathers.length > 0) {
          // const arr = [...arrGathers];

          setShowGatherVars((prev: SchemaGather[]) => {
            // const arrUnique = new Set<DataGather>([...prev, ...arrGathers]);
            const arrUnique = [
              ...Array.from(
                new Map(
                  prev.map((item: SchemaGather) => [item['name'], item]),
                ).values(),
              ),
              ...Array.from(
                new Map(
                  arrGathers.map((item: SchemaGather) => [item['name'], item]),
                ).values(),
              ),
            ];
            if (arrUnique !== undefined) {
              return Array.from(arrUnique);
            }
            return [];
          });
          // setShowGatherVars(arrGathers);
        }
        for (let i = 0; i < arrStarts.length; i++) {
          const encontrado = arrRecorridos.findIndex(
            (value: string) => value === arrStarts[i],
          );
          if (encontrado >= 0) {
            return;
          }
          arrRecorridos.push(arrStarts[i]);
          saveGathersToArray(arrStarts[i], idPrincipalComponent, arrRecorridos);
        }
      }
      // return arrGathers;
    },
    [getGatherBoxes, getStartLines],
  );

  // const updateDataGather = useCallback((id: string, data_gather: any) => {
  //   // setInstructionCurrent((value: any) => {
  //   //   if (value?.id === id) {
  //   //     return { ...value, data_gather: data_gather };
  //   //   }
  //   //   return value;
  //   // });
  // }, []);
  const [showGatherVars, setShowGatherVars] = useState<SchemaGather[]>([]);
  const getGatherVars = useCallback(
    (idPrincipalComponent: string) => {
      // console.log(lines);
      setShowGatherVars([]);

      saveGathersToArray(idPrincipalComponent);
      //recorrer las lineas para tener el camino
      //luego sacar los gather
    },
    [saveGathersToArray],
  );

  const handleNodeDragStop = (_event: any, node: Node) => {
    // console.log('Nodo soltado:', node.id);
    // console.log('Posición final:', node.position);
    // console.log(node);
    // // actualizo la posición de la instrucción que se movió
    // updateNodePosition(node.id, node.position);
    // const id = node.id;
    // const position = node.position;
    instructions.set(
      (prevInstructions: State<Instruction[] | undefined, any>) => {
        return prevInstructions.map((instr: State<Instruction, any>) => {
          if (instr.id === node.id) {
            return {
              ...instr,
              // position: position,
              // position_front: position,
              config: {
                ...instr.config,
                space_position: { x: node.position.x, y: node.position.y },
              },
            };
          }
          return instr;
        });
      },
    );
  };

  // useEffect(() => {
  //   // console.log(operators);
  //   setOperators();
  // }, []);

  // useEffect(() => {
  //   return () => {};
  // }, []);

  // useEffect(() => {
  //   if (currentNodeId) {
  //     const node = getNode(currentNodeId);
  //     if (node) {
  //       fitView({ nodes: [node], duration: 800, padding: 0.2, maxZoom: 1 });
  //     }
  //   }
  // }, [currentNodeId]);

  useEffect(() => {
    // console.log(currentInstructionIndex);
    const node = nodes.find(
      (node: Node) => node?.data.index === currentInstructionIndex,
    );
    if (node)
      fitView({ nodes: [node], duration: 800, padding: 0.2, maxZoom: 0.5 });
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentInstructionIndex]);

  const handleViewportChange = useCallback(() => {
    const screenCenter = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    // convertir a coordenadas del flow
    const flowCenter = screenToFlowPosition(screenCenter);
    handleUpdateViewPortCenter(flowCenter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  // }, [handleUpdateViewPortCenter, screenToFlowPosition]);

  return (
    <>
      <ContextContainer.Provider
        value={{
          // audiosList: audios,
          arrEnvironments,
          // getMedias: _getMedias,
          // updateDataGather,
          getGatherVars,
          showGatherVars,
          // handleSaveCategories,
          // categories,
          // handleOpenGuide,
          // handleOpenGuideWIndex,
          // handleUpdateCurrentGatherByField
        }}
      >
        <div
          className="reactflow-wrapper"
          ref={reactFlowWrapper}
          style={{
            width: '-webkit-fill-available',
            height: '-webkit-fill-available',
            position: 'absolute',
          }}
        >
          <ReactFlow
            nodes={nodes}
            onNodesChange={onNodesChange}
            edges={edges}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onEdgesDelete={onDeleteEdge}
            onNodeDragStop={handleNodeDragStop}
            onViewportChange={handleViewportChange}
            // onDrag={onDrag}
            fitView
          >
            <Background
              color="#ccc"
              style={{ backgroundColor: 'rgba(255, 255, 255, 1)' }}
              variant={BackgroundVariant.Cross}
              size={10}
              gap={40}
            />
            <Controls
              // style={{
              //   position: 'absolute',
              //   top: '37%',
              //   height: 'fit-content',
              //   // right: instructionCurrent && keyComponent ? '345px' : '20px',
              //   right: '20px',
              //   border: '1px solid #ccc',
              //   borderBottom: '1px solid #ccc'
              //   // '& button': {
              //   //   height: '30px',
              //   //   width: '30px'
              //   // }
              // }}
              style={{
                display: 'flex',
                flexDirection: 'row',
              }}
              //   className={classes.buttons}
              position="bottom-center"
              showInteractive={false}
            >
              <ControlButton
                onClick={() => onLayout({ direction: 'UP' })}
                title="Ordenar"
              >
                <AutoFixHighRounded style={{ fontSize: '14px' }} />
              </ControlButton>
            </Controls>
          </ReactFlow>
        </div>
      </ContextContainer.Provider>
    </>
  );
};

// export default FlowEdit;
type FlowEditDefaultProps = {
  instructions: State<Instruction[] | undefined, any>;
  handleChangeIndexCurrentInstruction: (index: number) => void;
  initialInstructionId?: string;
  flowView: boolean;
  currentInstructionIndex: number;
  handleUpdateViewPortCenter: (position: XYPosition) => void;
};
export default ({
  instructions,
  handleChangeIndexCurrentInstruction,
  initialInstructionId,
  flowView,
  currentInstructionIndex,
  handleUpdateViewPortCenter,
}: FlowEditDefaultProps) => (
  <ReactFlowProvider>
    <FlowEdit
      instructions={instructions}
      currentInstructionIndex={currentInstructionIndex}
      initialInstructionId={initialInstructionId}
      handleChangeIndexCurrentInstruction={handleChangeIndexCurrentInstruction}
      flowView={flowView}
      handleUpdateViewPortCenter={handleUpdateViewPortCenter}
    />
  </ReactFlowProvider>
);
