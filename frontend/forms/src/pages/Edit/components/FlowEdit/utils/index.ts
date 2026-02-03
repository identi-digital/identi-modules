import ELK, { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk.bundled.js';
import {
  InstructionDefault,
  InstructionFlow,
  SchemaCondition,
} from '../../../../../models/forms';
// ELK ORDER TREE ALGORITHM

const calculateHeightOfNode = (node: any): number => {
  // cuando cuantos schemaconditions hay con type_condition by_var
  let byVarConditions: any = [];
  if (node.data && node.data.data) {
    const instruction: InstructionFlow =
      (node.data.data as InstructionFlow) ?? InstructionDefault;
    byVarConditions = instruction.schema_conditions?.filter(
      (condition: SchemaCondition) => condition.type_condition === 'by_var',
    );
  }
  return 114 + byVarConditions.length * 55; // altura base de 100 por cada condition
};

const elk = new ELK();
type elkOptionsType = {
  'elk.algorithm'?: string;
  'elk.layered.spacing.nodeNodeBetweenLayers'?: string;
  'elk.spacing.nodeNode'?: string;
};
const elkOptions: elkOptionsType = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80',
};

const getLayoutElements = (
  nodes: Node[],
  edges: ElkExtendedEdge[],
  options: elkOptionsType = {},
) => {
  // const isHorizontal = options?.['elk.direction'] === 'RIGHT';
  // console.log(nodes);
  const isHorizontal = true;
  const graph: ElkNode = {
    id: 'root',
    layoutOptions: options,
    children: nodes.map((node: any) => ({
      ...node,
      // Adjust the target and source handle positions based on the layout
      // direction.
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',

      // Hardcode a width and height for elk to use when layouting.
      width: node.width ?? 425,
      height: calculateHeightOfNode(node),
      // height: node.height ?? 114
      // height: node.height ?? 153
    })),
    edges: edges,
  };

  return elk
    .layout(graph)
    .then((layoutedGraph: ElkNode) => ({
      nodes:
        layoutedGraph.children &&
        layoutedGraph.children.map((node: any) => ({
          ...node,
          // React Flow expects a position property on the node instead of `x`
          // and `y` fields.
          position: { x: node.x, y: node.y },
        })),

      edges: layoutedGraph.edges,
    }))
    .catch(console.error);
};

export { getLayoutElements, elkOptions, elk };
