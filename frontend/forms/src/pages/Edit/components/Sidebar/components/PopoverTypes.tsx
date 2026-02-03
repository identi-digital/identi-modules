import React, { useCallback, useContext, useState } from 'react';
import {
  Box,
  Button,
  // Chip,
  Grid,
  Popover,
  Tooltip,
  Typography,
  capitalize,
  styled,
} from '@mui/material';
import { AddRounded, Info } from '@mui/icons-material';
import { Instruction, ModuleTool } from '../../../../../models/forms';
import IconBox from '../../SharedComponents/IconBox';
import { ContextContainer } from '../../..';
import { toolToInstruction } from '../../../utils/flowFunctions';

const QuestionStyle = styled('div')(() => ({
  padding: '8px',
  display: 'flex',
  '&: hover': {
    cursor: 'pointer',
    borderRadius: '8px',
    backgroundColor: 'rgba(241, 241, 241, 1)',
  },
}));
const QuestionStyleDisabled = styled('div')(() => ({
  padding: '8px',
  display: 'flex',
}));

type PopoverTypesProps = {
  handleAddQuestion: (selected: Instruction) => void;
};

const PopoverTypes: React.FC<PopoverTypesProps> = (
  props: PopoverTypesProps,
) => {
  const { handleAddQuestion } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const context = useContext(ContextContainer);
  const { arrayTools, arrayIdsDisabled } = context;

  // console.log(arrayTools);
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAdd = useCallback(
    (tool: ModuleTool) => {
      const instruction = toolToInstruction(JSON.parse(JSON.stringify(tool)));
      handleAddQuestion(instruction);
      handleClose();
    },
    [handleAddQuestion],
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      <Button aria-describedby={id} variant="contained" onClick={handleClick}>
        <AddRounded />
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          width: '70%',
          maxHeight: '70%',
        }}
      >
        <Grid container spacing={3} p={2}>
          {arrayTools &&
            arrayTools.map((element: ModuleTool, index: number) => {
              if (arrayIdsDisabled && arrayIdsDisabled.includes(element.id))
                return (
                  <Grid
                    key={`${element.id}_${index}`}
                    size={{ xs: 12, sm: 6, md: 4 }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        '&: hover': {
                          cursor: 'pointer',
                        },
                      }}
                    >
                      <Tooltip title={'Próximamente'}>
                        <Info color="warning" sx={{ fontSize: '20px' }} />
                      </Tooltip>
                    </Box>
                    <QuestionStyleDisabled
                      key={`question_${index}`}
                      sx={{ color: '#777777' }}
                    >
                      <IconBox type={element.name ?? ''} index={-1} disabled />
                      &nbsp;
                      <Box
                        display={'flex'}
                        flexDirection={'column'}
                        alignItems={'flex-start'}
                      >
                        <Typography>
                          {capitalize(element.name ?? '')}
                        </Typography>
                      </Box>
                    </QuestionStyleDisabled>
                  </Grid>
                );
              return (
                <Grid
                  key={`${element.id}_${index}`}
                  size={{ xs: 12, sm: 6, md: 4 }}
                >
                  {/* <Typography sx={{ color: '#777777' }}>{element.name}</Typography> */}
                  <QuestionStyle
                    key={`question_${index}`}
                    onClick={() => handleAdd(element)}
                  >
                    <IconBox type={element.name ?? ''} index={-1} />
                    &nbsp;
                    <Typography>{capitalize(element.name ?? '')}</Typography>
                  </QuestionStyle>
                  {/* {element.questions.map((question: Question, index: number) => {
                  return (
                  );
                })} */}
                </Grid>
              );
            })}
        </Grid>
      </Popover>
    </>
  );
};

export default PopoverTypes;
