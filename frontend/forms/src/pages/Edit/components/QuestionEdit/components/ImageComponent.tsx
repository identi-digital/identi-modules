import React from 'react';
import { Typography, styled } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const RootStyled = styled('div')(() => ({
  marginBlock: '32px',
  border: '2px dashed #8DC5F2',
  borderRadius: '4px',
  padding: '16px',
  color: '#8DC5F2',
  fontSize: '18px',
  fontWeight: 500,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
}));

type ImageComponentProps = unknown;

const ImageComponent: React.FC<ImageComponentProps> = () => {
  return (
    <RootStyled sx={{ height: '120px' }}>
      <AddPhotoAlternateIcon sx={{ fontSize: '36px' }} />
      <Typography mt={2}>Selecciona tu imagen aquí</Typography>
    </RootStyled>
  );
};

export default ImageComponent;
