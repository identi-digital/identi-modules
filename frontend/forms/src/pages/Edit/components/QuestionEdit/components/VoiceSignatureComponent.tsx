import React from 'react';
import { Typography, styled } from '@mui/material';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';

const RootStyled = styled('div')(() => ({
  padding: '32px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#8DC5F2',
  fontSize: '18px',
  fontWeight: 500
}));
const IconBoxStyled = styled('div')(() => ({
  color: 'white',
  backgroundColor: '#8DC5F2',
  borderRadius: '50%',
  display: 'flex',
  padding: '16px',
  justifyContent: 'center',
  alignItems: 'center'
}));

const VoiceSignatureComponent = () => {
  return (
    <RootStyled>
      <IconBoxStyled>
        <KeyboardVoiceIcon />
      </IconBoxStyled>
      <Typography mt={1}>Click para grabar</Typography>
    </RootStyled>
  );
};

export default VoiceSignatureComponent;
