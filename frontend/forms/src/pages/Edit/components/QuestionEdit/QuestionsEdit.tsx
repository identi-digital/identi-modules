import { Box, IconButton, Typography, styled } from '@mui/material';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Instruction, SchemaCondition } from '../../../../models/forms';
// import BorderColorIcon from '@mui/icons-material/BorderColor';
import { State } from '@hookstate/core';
import QuestionPageEdit from './components/QuestionPageEdit';
import { Delete } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
// import { ContextLayout } from '~/ui/templates/Layouts/Layout';
import { useParams } from 'react-router-dom';

const RootStyle = styled('div')(() => ({
  width: '100%',
  maxHeight: '650px',
  overflow: 'auto',
  padding: '16px 0px 16px 32px',
  marginRight: '16px',
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '10px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#d9d9d9',
    borderRadius: '13px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#888',
  },
}));

type QuestionsEditProps = {
  instructions: State<Instruction[] | undefined, any>;
  moduleName: string;
  currentInstructionIndex: number;
  swapInstructions: (index1: number, index2: number) => void;
};

const QuestionsEdit: React.FC<QuestionsEditProps> = (
  props: QuestionsEditProps,
) => {
  const { instructions, currentInstructionIndex, swapInstructions } = props;
  // eslint-disable-next-line
  // @ts-ignore
  const { id_module = '' } = useParams();
  const [varsArray, setVarsArray] = useState<any[]>([]);
  // const { validateIfQuestionIsDefault } = useContext(ContextLayout);
  //manejo de scroll
  //arreglo de referencias a los componentes
  const componentRefs = useRef<React.Ref<HTMLDivElement>[]>([]);

  const setComponentRef = (index: number, ref: React.Ref<HTMLDivElement>) => {
    componentRefs.current[index] = ref;
  };

  const scrollToComponent = (index: number) => {
    if (componentRefs.current[index]) {
      // eslint-disable-next-line
      // @ts-ignore
      componentRefs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const removeElement = (index: number) => {
    instructions.set((prev: State<Instruction[] | undefined, any>) => {
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
  };

  useEffect(() => {
    scrollToComponent(currentInstructionIndex);
  }, [currentInstructionIndex]);

  useEffect(() => {
    const arrVars: any[] = [];
    instructions.ornull.forEach((instruction: State<Instruction>) => {
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
    });
    if (arrVars.length > 0) {
      setVarsArray(arrVars);
    }
  }, [instructions]);

  return (
    <RootStyle>
      {/* <Box width={'100%'}>
        <TextField
          variant="standard"
          fullWidth
          placeholder={'Nombre de Módulo'}
          value={moduleName}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" sx={{ color: '#929292' }}>
                <BorderColorIcon />
              </InputAdornment>
            ),
            sx: {
              fontSize: '20px',
              fontStyle: moduleName !== '' ? 'normal' : 'italic',
              '&::before': {
                border: 'none'
              }
            }
          }}
        />
      </Box> */}
      <Box mt={2}>
        {instructions.ornull.map(
          (instruction: State<Instruction>, index: number) => {
            // const isDefault =
            //   validateIfQuestionIsDefault && validateIfQuestionIsDefault(id_module, instruction.get().id ?? '');
            const isDefault = false;
            return (
              <Box
                key={instruction.get().id}
                ref={(ref: React.Ref<HTMLDivElement>) =>
                  setComponentRef(index, ref)
                }
              >
                {/* TOOLBAR PAGE */}
                <Box
                  display={'flex'}
                  justifyContent={'space-between'}
                  paddingRight={2}
                >
                  <Box display={'flex'} alignItems={'center'}>
                    <IconButton
                      disabled={index === 0}
                      onClick={() => swapInstructions(index, index - 1)}
                    >
                      <ArrowUpwardIcon
                        sx={{
                          fontSize: '22px',
                          color: index === 0 ? '#ccc' : 'gray',
                        }}
                      />
                    </IconButton>
                    <IconButton
                      disabled={index === instructions.ornull.length - 1}
                      onClick={() => swapInstructions(index, index + 1)}
                    >
                      <ArrowDownwardIcon
                        sx={{
                          fontSize: '22px',
                          color:
                            index === instructions.ornull.length - 1
                              ? '#ccc'
                              : 'gray',
                        }}
                      />
                    </IconButton>
                  </Box>
                  {!isDefault && (
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
                  )}
                </Box>
                {/* PAGE EDIT */}
                <QuestionPageEdit
                  currentInstruction={instruction}
                  varsArray={varsArray}
                  isDefault={isDefault || false}
                  index={index + 1}
                  // eslint-disable-next-line
                  // @ts-ignore
                  ref={(ref: React.Ref<HTMLDivElement>) =>
                    setComponentRef(index, ref)
                  }
                />
              </Box>
            );
          },
        )}
        {instructions.ornull.length <= 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              textAlign: 'center',
            }}
            mt={6}
          >
            <Typography>Seleccione alguna pregunta</Typography>
          </Box>
        )}
      </Box>
    </RootStyle>
  );
};

export default QuestionsEdit;
