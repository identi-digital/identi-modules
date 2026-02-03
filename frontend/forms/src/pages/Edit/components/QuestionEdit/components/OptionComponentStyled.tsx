import React from 'react';
import { TextField, styled } from '@mui/material';

const BoxLetter = styled('div')(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  border: '1px solid #1881D4',
  backgroundColor: '#FFFFFF',
  fontSize: '14px',
  fontWeight: 500,
  width: '24px',
  height: '24px',
  marginRight: '8px',
  borderRadius: '4px'
}));
const OptionStyled = styled('div')(() => ({
  border: '1px solid #1881D4',
  borderRadius: '4px',
  padding: '8px',
  backgroundColor: '#ECF5FD',
  color: '#1881D4',
  fontSize: '14px',
  fontWeight: 500,
  height: '40px',
  marginTop: '8px',
  minWidth: '180px',
  display: 'flex',
  alignItems: 'center'
}));

type OptionComponentProps = {
  index: number;
  value: string;
  id?: string;
  is_edit: boolean;
  onChange?: (value: string, id: string) => void;
};

const OptionComponentStyled: React.FC<OptionComponentProps> = ({ index, is_edit, id, value, onChange }) => {
  const printLetters = (numero: number): string => {
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const resultado = [];
    while (numero > 0) {
      const indice = (numero - 1) % 26;
      resultado.push(letras.charAt(indice));
      numero = Math.floor((numero - 1) / 26);
    }
    resultado.reverse();
    return resultado.join('');
  };

  return (
    <OptionStyled>
      <BoxLetter>{printLetters(index + 1)}</BoxLetter>
      {is_edit ? (
        <TextField
          variant="standard"
          fullWidth
          value={value}
          InputProps={{
            sx: {
              color: '#1881D4',
              '&::before': {
                border: 'none'
              }
            }
          }}
          onChange={(e: any) => {
            onChange && onChange(e.target.value, id ?? '');
          }}
        />
      ) : (
        <>{value}</>
      )}
    </OptionStyled>
  );
};

export default OptionComponentStyled;
