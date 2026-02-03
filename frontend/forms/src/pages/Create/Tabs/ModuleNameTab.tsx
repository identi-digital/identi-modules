import React, { useCallback, useState } from 'react';
import { Box, Typography } from '@mui/material';
import TextField from '@ui/components/atoms/TextField/TextField';
import UploadImage from '../components/UploadImage';
import { showMessage } from '@ui/utils/Messages';

type ModuleNameTabProps = {
  formik: any;
  handleSaveNewImage: (image: any) => void;
  hasId: boolean;
};

const ModuleNameTab: React.FC<ModuleNameTabProps> = ({
  formik,
  handleSaveNewImage,
}) => {
  const [newLogo, setNewLogo] = useState<any>(undefined);
  // console.log(isConfigure);
  const handleDropLogo = useCallback(
    (acceptedFiles: any) => {
      const file = acceptedFiles[0];
      if (file) {
        if (file.size >= 3000000) {
          showMessage('', 'El archivo es muy pesado.', 'error', true);
          return;
        }
        const newFile = {
          file: file,
          file_name: file.name,
          file_type: file.type,
        };
        setNewLogo(newFile);
        handleSaveNewImage(file);
      }
    },
    [handleSaveNewImage],
  );

  return (
    <>
      <Box margin={2} sx={{ width: { xs: '98%', md: '40%' } }}>
        <Typography>1. Nombre del formulario</Typography>
        <TextField
          id={'name'}
          label={''}
          name={'name'}
          size="small"
          variant="outlined"
          value={formik.values.name}
          onChange={formik.handleChange}
          disabled={formik.isSubmitting}
          errors={formik.errors}
          touched={formik.touched}
        />
        <Typography>2. Descripción del formulario</Typography>
        <TextField
          id={'description'}
          label={''}
          name={'description'}
          size="small"
          variant="outlined"
          value={formik.values.description}
          onChange={formik.handleChange}
          disabled={formik.isSubmitting}
          errors={formik.errors}
          touched={formik.touched}
        />
        {/* <Typography mt={2}>2. Imagen de referencia</Typography>
        <UploadImage
          disabled={formik.isSubmitting}
          //   accept="image/*"
          file={newLogo}
          onDrop={handleDropLogo}
          caption={
            <Typography
              variant="caption"
              sx={{
                mt: 2,
                mx: 'auto',
                display: 'block',
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
              Agrega una foto de la marca <br />
              formato png
            </Typography>
          }
        /> */}
      </Box>
    </>
  );
};

export default ModuleNameTab;
