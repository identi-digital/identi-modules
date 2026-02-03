import React, { memo, useCallback } from 'react';
import { BaseEdge, EdgeProps, EdgeLabelRenderer, getBezierPath, useEdges, Edge } from '@xyflow/react';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { Tooltip } from '@mui/material';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-unused-vars
interface CustomEdgeProps extends EdgeProps {
  deleteEdge: (id: string) => void;
}

// type EdgePropsDefault = {
//   edgeProps: EdgeProps;
//   deleteEdge: (id: string) => void;
// };

const EdgeComponent: React.FC<CustomEdgeProps> = (props: CustomEdgeProps) => {
  //   if (props.source !== props.target) {
  //     return <BezierEdge {...props} />;
  //   }
  const edges = useEdges();
  //   const { deleteEdge } = edgeProps;
  //   console.log(props);
  const {
    sourceX,
    sourceY,
    targetX,
    targetY,
    id,
    sourcePosition,
    targetPosition,
    style = { strokeWidth: '2px' },
    // markerEnd,
    data,
    selected
  } = props;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  const onClick = useCallback(
    (evt: any, id: string) => {
      const element = edges.find((element: Edge) => element.id === id);
      if (data && typeof data.deleteEdge === 'function') {
        data.deleteEdge([element]);
      }
    },
    [data, edges]
  );

  //   let newPath = edgePath;
  //   const radiusX = (sourceX - targetX) * 0.6;
  //   const radiusY = 50;
  //   newPath = `M ${sourceX - 5} ${sourceY} A ${radiusX} ${radiusY} 0 1 0 ${targetX + 2} ${targetY}`;

  return (
    <>
      <BaseEdge
        path={edgePath}
        // markerStart={markerEnd}
        // markerEnd={markerEnd}
        style={selected ? { stroke: 'var(--orange-accent)', strokeWidth: '2px' } : style}
      />
      ;
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            // everything inside EdgeLabelRenderer has no pointer events by default
            // if you have an interactive element, set pointer-events: all
            pointerEvents: 'all'
          }}
          className="nodrag nopan"
        >
          {selected && (
            <Tooltip title="Eliminar">
              <button
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'white',
                  border: '1px solid rgba(185, 185, 185, 1)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  lineHeight: 1
                  // '&: hover': {
                  //   boxShadow: '0 0 6px 2px rgba(0, 0, 0, 0.08)'
                  // }
                }}
                onClick={(event) => onClick(event, id)}
              >
                <DeleteOutlineOutlinedIcon color="error" />
              </button>
            </Tooltip>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default memo(EdgeComponent);
