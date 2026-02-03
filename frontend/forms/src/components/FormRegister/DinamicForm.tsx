import React, { useState } from 'react';
// import { FormStep } from './RegisterConditional';

// tu JSON de nodos
// const tree = [
//   /* ... JSON del árbol ... */
// ];

type DynamicFormProps = {
  tree: any[];
  instructionStart: string;
};

function DynamicForm({ tree, instructionStart }: DynamicFormProps) {
  const [answers, setAnswers] = useState<any>({});
  const idToNode = new Map(tree.map((n) => [n.id, n]));

  const rootId = instructionStart;

  //   function renderChildren(node: FormStep, answer: string, level: number) {
  //     if (!node.schema_conditions) return null;

  //     const children = [];

  //     for (const cond of node.schema_conditions) {
  //       if (cond.type_condition === 'by_success' && cond.next_instruction_id) {
  //         children.push(renderNode(cond.next_instruction_id, level));
  //       }
  //       if (cond?.validators) {
  //         const validator = cond?.validators[0];
  //         if (
  //           cond.type_condition === 'by_var' &&
  //           validator.validator_name === 'equal' &&
  //           validator.value.toLowerCase() === answer.toLowerCase() &&
  //           cond.next_instruction_id
  //         ) {
  //           children.push(renderNode(cond.next_instruction_id, level));
  //         }
  //       }
  //     }

  //     return children;
  //   }

  //   function renderChildren(node: FormStep, answer: string, level: number) {
  //     if (!node.schema_conditions) return null;

  //     const rendered = [];

  //     for (const cond of node.schema_conditions) {
  //       if (cond.type_condition === 'by_var') {
  //         // si la respuesta coincide → mostrar rama condicional
  //         if (cond?.validators) {
  //           const validator = cond?.validators[0];
  //           if (
  //             cond.type_condition === 'by_var' &&
  //             validator.validator_name === 'equal' &&
  //             validator.value.toLowerCase() === answer.toLowerCase() &&
  //             cond.next_instruction_id
  //           ) {
  //             rendered.push(renderNode(cond.next_instruction_id, level));
  //           }
  //         }
  //         // if (answer.toLowerCase() === cond.value.toLowerCase() && cond.next_instruction_id) {
  //         //   rendered.push(renderNode(cond.next_instruction_id, level));
  //         // }
  //       }

  //       if (cond.type_condition === 'by_success' && cond.next_instruction_id) {
  //         // flujo normal → siempre se muestra, pero en orden
  //         rendered.push(renderNode(cond.next_instruction_id, level));
  //       }
  //     }

  //     return rendered;
  //   }

  function renderChildren(node: any, answer: string, level: number) {
    if (!node.schema_conditions) return null;

    const rendered = [];

    // 1. Primero by_var (condicionales)
    for (const cond of node.schema_conditions) {
      if (cond?.validators) {
        const validator = cond?.validators[0];
        if (
          cond.type_condition === 'by_var' &&
          validator.validator_name === 'equal' &&
          validator.value.toLowerCase() === answer.toLowerCase() &&
          cond.next_instruction_id
        ) {
          rendered.push(renderNode(cond.next_instruction_id, level));
        }
      }
    }

    // 2. Luego by_success (flujo normal)
    for (const cond of node.schema_conditions) {
      if (cond.type_condition === 'by_success' && cond.next_instruction_id) {
        rendered.push(renderNode(cond.next_instruction_id, level));
      }
    }

    return rendered;
  }
  function renderNode(nodeId: string, level = 0) {
    const node = idToNode.get(nodeId);
    if (!node) return null;

    const title =
      node.metadata?.data_input?.title || node.schema_gather?.name || node.config?.tool?.name || '(sin título)';

    const currentAnswer = answers[node.id] || '';

    // render del nodo actual
    //     return (
    //       <div key={node.id} style={{ marginLeft: level * 20 }}>
    //         <label>{title}</label>
    //         <input
    //           type="text"
    //           value={currentAnswer}
    //           onChange={(e) => setAnswers({ ...answers, [node.id]: e.target.value })}
    //         />

    //         {/* hijos condicionales */}
    //         {renderChildren(node, currentAnswer, level + 1)}
    //       </div>
    //     );
    //   }
    // render del nodo actual
    return (
      <div key={node.id}>
        <div style={{ marginLeft: level * 20 }}>
          <label>{title}</label>
          <input
            type="text"
            value={currentAnswer}
            onChange={(e) => setAnswers({ ...answers, [node.id]: e.target.value })}
          />
        </div>

        {/* hijos que dependen de este nodo */}
        {renderChildren(node, currentAnswer, level + 1)}
      </div>
    );
  }
  return (
    <div>
      <div>{renderNode(rootId)}</div>
      <div>
        <p>
          <strong>Datos:</strong> {JSON.stringify(answers, null, 2)}
        </p>
      </div>
    </div>
  );
}

export default DynamicForm;
