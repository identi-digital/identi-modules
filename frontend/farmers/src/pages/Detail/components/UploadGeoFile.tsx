import React, { useCallback, useState } from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { showMessage } from '@ui/utils/Messages';
import { convertToGeoJson } from '@services/shape_file';
import { Box, CircularProgress } from '@mui/material';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

type UploadGeoFileProps = {
  text: string;
  farm?: any;
  handleOnUploadFile: (data: any, farm: any) => void;
  loading?: boolean;
};

const UploadGeoFile: React.FC<UploadGeoFileProps> = ({
  text,
  farm,
  handleOnUploadFile,
  loading,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleOnChange = useCallback(
    (acceptedFiles: any) => {
      const file = acceptedFiles?.target?.files[0];
      if (file) {
        if (file.size >= 3000000) {
          showMessage('', 'El archivo es muy pesado.', 'error', true);
          return;
        }
        const newForm = new FormData();
        newForm.append('file', file);
        setIsLoading(true);
        convertToGeoJson(newForm)
          .then((resp) => {
            if (resp) {
              handleOnUploadFile(resp, farm);
            }
            setIsLoading(false);
          })
          .catch(() => {
            showMessage(
              '',
              'No se pudo convertir el archivo seleccionado.',
              'warning',
            );
            setIsLoading(false);
          });
      }
    },
    [handleOnUploadFile],
  );

  return (
    <>
      {isLoading || loading ? (
        <Box
          display={'flex'}
          width={'100%'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Button
          component="label"
          role={undefined}
          sx={{ borderRadius: '0px' }}
          variant="contained"
          color="secondary"
          tabIndex={-1}
        >
          {text}
          <VisuallyHiddenInput type="file" onChange={handleOnChange} />
        </Button>
      )}
    </>
  );
};

export default UploadGeoFile;
