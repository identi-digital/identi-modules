import { Box, Dialog, Typography } from '@mui/material';
import React from 'react';
import Autocomplete from '@ui/components/atoms/Autocomplete/Autocomplete';

type VarsDialogProps = {
  handleClose: () => void;
  handleSave: (value: string) => void;
  value: string;
  open: boolean;
  arrVars: any[];
};

const VarsDialog: React.FC<VarsDialogProps> = (props: VarsDialogProps) => {
  const { handleClose, handleSave, open, arrVars, value } = props;

  return (
    <Dialog onClose={handleClose} open={open}>
      <Box
        sx={{
          minWidth: '250px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'start',
          padding: '32px',
        }}
      >
        <Typography fontSize={16} fontWeight={600} color={'#1881D4'}>
          Variables
        </Typography>

        <Box width={'100%'}>
          <Autocomplete
            id={'vars'}
            label={''}
            name={'vars'}
            items={arrVars}
            selectedValue={value}
            value={value}
            defaultValue={value}
            onChange={(_name: string, value: any) => {
              handleSave(value);
              handleClose();
            }}
          />
        </Box>
      </Box>
    </Dialog>
  );
};

export default VarsDialog;
