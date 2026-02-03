import { Typography, styled } from '@mui/material';
import React from 'react';

const RootStyled = styled('div')(() => ({
  marginBlock: '32px',
  backgroundColor: '#ECF5FD',
  borderRadius: '4px',
  padding: '14px 16px',
  color: '#1881D4',
  fontSize: '18px',
  fontWeight: 500,
  textAlign: 'center'
}));

type GeoComponentProps = {
  type: 'point' | 'polygon';
};

const GeoComponent: React.FC<GeoComponentProps> = ({ type }) => {
  return (
    <RootStyled sx={{ height: '56px' }}>
      <Typography>Guardar {type === 'polygon' ? 'polígono' : 'punto'}</Typography>
    </RootStyled>
  );
};

export default GeoComponent;
