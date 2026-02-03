import { Box, Tooltip, Typography, styled } from '@mui/material';
import React from 'react';
import { Instruction } from '../../../../models/forms';
// import MoreVertIcon from '@mui/icons-material/MoreVert';
import PopoverTypes from './components/PopoverTypes';
import IconBox from '../SharedComponents/IconBox';
import { State } from '@hookstate/core';
import { Validation } from '@hookstate/validation';
import { CheckCircleRounded, ErrorRounded } from '@mui/icons-material';

const RootStyle = styled('div')(({ theme }) => ({
  width: '18%',
  backgroundColor: 'white',
  // maxHeight: '650px',
  // overflowY: 'scroll',
  color: theme.palette.primary.main,
  zIndex: 9,
}));
const QuestionStyle = styled('div')(() => ({
  padding: '16px',
  '&: hover': {
    cursor: 'pointer',
    backgroundColor: '#F1F1F1',
  },
}));

type SidebarEditProps = {
  questionsModule: State<Instruction[] | undefined, any>;
  currentIndex: number;
  handleAddQuestion: (question: Instruction) => void;
  handleChangeIndexCurrentInstruction: (index: number) => void;
};

const SidebarEdit: React.FC<SidebarEditProps> = (props: SidebarEditProps) => {
  const {
    questionsModule,
    currentIndex,
    handleAddQuestion,
    handleChangeIndexCurrentInstruction,
  } = props;

  return (
    <RootStyle>
      <Box
        px={2}
        pt={2}
        display={'flex'}
        justifyContent={'space-between'}
        alignItems={'center'}
      >
        <Typography sx={{ fontWeight: 600 }}>Contenido</Typography>
        <PopoverTypes handleAddQuestion={handleAddQuestion} />
      </Box>
      <Box
        mt={1}
        className="scrollBarClass"
        sx={{
          height: '90%',
        }}
      >
        {questionsModule &&
          questionsModule.ornull.map(
            (question: State<Instruction, Validation>, index: number) => {
              const schemaInput = question.get().schema_input ?? undefined;
              const firstInput =
                schemaInput && schemaInput.length > 0
                  ? schemaInput[0]
                  : undefined;
              return (
                <QuestionStyle
                  key={question.get().id}
                  sx={{
                    backgroundColor:
                      currentIndex === index ? '#F1F1F1' : 'white',
                  }}
                  onClick={() => handleChangeIndexCurrentInstruction(index)}
                >
                  <Box
                    display={'flex'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <IconBox
                      type={question.get().config?.tool?.name ?? ''}
                      index={index + 1}
                    />

                    <Box paddingInline={1} width={'100%'}>
                      {firstInput && firstInput.value === '' ? (
                        <Typography
                          sx={{
                            color: '#929292',
                            fontSize: 12,
                            fontStyle: 'italic',
                          }}
                        >
                          Escribe texto
                        </Typography>
                      ) : (
                        <Typography
                          fontSize={12}
                          className="two-lines-text"
                          sx={{
                            fontSize: '12px',
                            maxWidth: '80px',
                          }}
                        >
                          {firstInput && firstInput.value
                            ? firstInput.value
                            : ''}
                          {!question.get().config?.is_channel && (
                            <>{question.get().config?.tool?.name ?? ''}</>
                          )}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      {/* <MoreVertIcon /> */}
                      {!question.valid() ? (
                        <Tooltip title="La pregunta tiene errores">
                          <ErrorRounded color="error" />
                        </Tooltip>
                      ) : (
                        <CheckCircleRounded color="success" />
                      )}
                    </Box>
                  </Box>
                </QuestionStyle>
              );
            },
          )}
        {questionsModule.ornull.length <= 0 && (
          <Box mt={4} textAlign={'center'}>
            <Typography>Seleccione alguna pregunta</Typography>
          </Box>
        )}
      </Box>
    </RootStyle>
  );
};

export default SidebarEdit;
