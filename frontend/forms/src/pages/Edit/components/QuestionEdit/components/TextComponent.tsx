import { Typography, styled } from '@mui/material';
import React from 'react';

const RootStyled = styled('div')(() => ({
  marginBlock: '32px',
  border: '1px solid #8DC5F2',
  borderRadius: '4px',
  padding: '14px 16px',
  color: '#8DC5F2',
  fontSize: '18px',
  fontWeight: 500
}));

type TextComponentProps = {
  size: 'small' | 'medium';
  text: string;
};

const TextComponent: React.FC<TextComponentProps> = (props: TextComponentProps) => {
  const { size, text } = props;
  return (
    <RootStyled sx={{ height: size === 'medium' ? '120px' : '56px' }}>
      <Typography>{text.toString()}</Typography>
    </RootStyled>
  );
};

export default TextComponent;
