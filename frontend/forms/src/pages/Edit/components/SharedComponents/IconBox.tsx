import React, { useContext, useEffect, useState } from 'react';
import { Icon, Typography, styled } from '@mui/material';
import { ModuleTool } from '../../../../models/forms';
import { ContextContainer } from '../..';

const IconBoxStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '24px',
  padding: '2px 4px 2px 4px',
  borderRadius: '4px',
  fontWeight: 500,
  color: theme.palette.primary.main,
}));

type IconBoxProps = {
  type: string;
  index: number;
  disabled?: boolean;
};

const IconBox: React.FC<IconBoxProps> = ({ type, index, disabled }) => {
  const [typeSelected, setTypeSelected] = useState<ModuleTool | undefined>(
    undefined,
  );

  const context = useContext(ContextContainer);
  const { arrayTools } = context;

  useEffect(() => {
    let value;
    if (arrayTools) {
      const v = arrayTools.find((e: ModuleTool) => e.name === type);
      if (v) {
        value = v;
        setTypeSelected(value);
        return;
      }
    }
  }, [arrayTools, type]);

  return (
    <IconBoxStyled
      sx={{ backgroundColor: disabled ? '#F1F1F1' : typeSelected?.color }}
    >
      <Icon sx={{ fontSize: '18px !important' }}>{typeSelected?.icon}</Icon>
      {index >= 0 && <Typography>&nbsp;{index}</Typography>}
    </IconBoxStyled>
  );
};

export default IconBox;
