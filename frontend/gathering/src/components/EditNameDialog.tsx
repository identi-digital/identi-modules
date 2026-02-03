import { Box, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';
import Dialog from '@ui/components/molecules/Dialog/Dialog';
import Button from '@ui/components/atoms/Button/Button';
// import { EntityDetail } from '~/models/entities';
// import { capitalizeAllWords } from '~/utils/Word';
// import { translateText } from '@ui/components/components/shared/translation';
import TextField from '@ui/components/atoms/TextField/TextField';
import { showMessage } from '@ui/utils/Messages';

type EditNameDialogProps = {
  element: any;
  idEntity: string;
  userId: string;
  handleCloseDialog: (isRefresh?: boolean) => void;
  handleChangeName: (
    idEntity: string,
    idEntityDetail: string,
    newEntityDetail: any,
  ) => void;
};

const EditNameDialog: React.FC<EditNameDialogProps> = ({
  element,
  // entityDetail,
  //   userId,
  idEntity,
  handleCloseDialog,
  handleChangeName,
  //   handleEditEntityDetail
}) => {
  //   console.log(userId);
  const themes = useTheme();
  const [isSaving, _setIsSaving] = useState<boolean>(false);
  const [newValue, setNewValue] = useState<string>(element.value);

  const updateEntityDetail = (id: string, value: any) => {
    setNewValue(value);
  };

  const handleSaveChange = useCallback(() => {
    if (newValue.length <= 0) {
      showMessage('', 'El nombre no puede estar vacío.', 'error');
      return;
    }
    if (newValue.length >= 100) {
      showMessage(
        '',
        'El nombre no puede tener más de 100 caracteres.',
        'error',
      );
      return;
    }
    const newElement = Object.assign({}, element);
    newElement.value = newValue;
    handleChangeName(idEntity, newElement.id, newElement);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element, idEntity, newValue]);

  return (
    <Dialog
      open={true}
      title="Editar nombre"
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
            text="Guardar cambios"
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
            {element.name ?? ''}
          </Typography>
          <TextField
            id={element.name}
            variant="outlined"
            size="small"
            label={''}
            type={'text'}
            disabled={element.is_unique === true}
            name={element.name}
            onChange={(e: any) => {
              updateEntityDetail(element.id, e.target.value);
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

export default EditNameDialog;
