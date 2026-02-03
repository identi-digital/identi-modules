import { Box, TextField } from '@mui/material';
import React from 'react';
import { SchemaInput } from '../../../../../models/forms';
import IconBox from '../../SharedComponents/IconBox';

type TitleComponentProps = {
  question: SchemaInput;
  tool_name: string;
  index: number;
};

const TitleComponent: React.FC<TitleComponentProps> = ({
  question,
  tool_name,
  index,
}) => {
  return (
    <Box display={'flex'} alignItems={'start'}>
      <Box mt={1}>
        <IconBox type={tool_name} index={index} />
      </Box>
      <Box ml={2}>
        <TextField
          variant="standard"
          fullWidth
          multiline
          maxRows={2}
          placeholder={question.place_holder ?? ''}
          value={question.value}
          InputProps={{
            sx: {
              fontSize: '20px',
              '&::before': {
                border: 'none',
              },
            },
          }}
        />
        <TextField
          variant="standard"
          fullWidth
          placeholder={'Descripción opcional'}
          value={question.description}
          InputProps={{
            sx: {
              fontSize: '14px',
              fontStyle: 'italic',
              '&::before': {
                border: 'none',
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default TitleComponent;
