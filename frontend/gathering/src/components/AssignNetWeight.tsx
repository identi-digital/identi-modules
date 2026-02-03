import { Box, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';
import Dialog from '@ui/components/molecules/Dialog/Dialog';
import Button from '@ui/components/atoms/Button/Button';
// import { EntityDetail } from '~/models/entities';
// import { capitalizeAllWords } from '@ui/utils/Word';
// import { translateText } from '@ui/components/components/shared/translation';
import TextField from '@ui/components/atoms/TextField/TextField';
import { showMessage } from '@ui/utils/Messages';

type AssignNetWeightProps = {
  currentValue: number;
  idLot: string;
  userId: string;
  handleCloseDialog: (isRefresh?: boolean) => void;
  handleChangeNetWeight: (id: string, value: number) => void;
};

const AssignNetWeight: React.FC<AssignNetWeightProps> = ({
  currentValue,
  idLot,
  handleCloseDialog,
  handleChangeNetWeight,
  //   handleEditEntityDetail
}) => {
  const themes = useTheme();
  const [isSaving, _setIsSaving] = useState<boolean>(false);
  const [newValue, setNewValue] = useState<number>(+currentValue);

  const updateValue = (value: any) => {
    if (!isNaN(value)) {
      setNewValue(value);
    }
  };

  const handleSaveChange = useCallback(() => {
    if (newValue === 0) {
      showMessage('', 'El peso neto no puede ser 0.', 'error');
      return;
    }
    if (newValue < 0) {
      showMessage('', 'El peso neto no puede ser negativo.', 'error');
      return;
    }
    handleChangeNetWeight(idLot, newValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idLot, newValue]);

  return (
    <Dialog
      open={true}
      title="Asignar peso neto"
      subtitle="Ingresa el campo solicitado"
      onClose={() => handleCloseDialog()}
      sx={{
        '& .MuiDialog-container': {
          '& .MuiPaper-root': {
            width: '100%',
            maxWidth: '360px', // Set your width here
          },
        },
      }}
      actions={
        <Box display="flex" justifyContent={'space-between'} width={'100%'}>
          <Button
            onClick={() => handleCloseDialog()}
            variant="outlined"
            disabled={isSaving}
            text="Cancelar"
          />
          <Button
            onClick={() => handleSaveChange()}
            color="primary"
            variant="contained"
            disabled={isSaving}
            isLoading={isSaving}
            text="Asignar"
          />
        </Box>
      }
    >
      <Grid container spacing={1}>
        <Grid>
          <Typography
            sx={{
              color: themes.palette.primary.main,
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            {/* {capitalizeAllWords(translateText(element.name ?? ''))} */}
            Peso Neto
          </Typography>
          <TextField
            id={'peso_neto'}
            variant="outlined"
            size="small"
            label={''}
            type={'number'}
            name={'peso_neto'}
            onChange={(e: any) => {
              let inputValue = e.target.value;
              // Permitir valores decimales como 0.1, pero no números como 000123
              if (inputValue === '0' || inputValue === '0.') {
                updateValue(inputValue);
              } else if (inputValue.match(/^0\d+/)) {
                // Si el número empieza con 0 seguido de más dígitos, elimina los ceros iniciales
                inputValue = inputValue.replace(/^0+/, '');
                updateValue(inputValue);
              } else if (!isNaN(inputValue) || inputValue === '') {
                // Permitir solo números y dejar vacío el campo si el usuario lo limpia
                updateValue(inputValue);
              }
            }}
            // errors={errors}
            // touched={touched}
            value={newValue}
            style={{ marginTop: '8px' }}
          />
        </Grid>
      </Grid>
    </Dialog>
  );
};

export default AssignNetWeight;
