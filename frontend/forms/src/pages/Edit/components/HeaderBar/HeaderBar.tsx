import React from 'react';
import {
  Box,
  Divider,
  FormControlLabel,
  Switch,
  Tooltip,
  Typography,
  styled,
} from '@mui/material';
import Button from '@ui/components/atoms/Button/Button';
import { PhoneAndroid } from '@mui/icons-material';

const HeaderBarStyled = styled('div')(() => ({
  padding: '8px',
  display: 'flex',
  color: 'black',
  alignItems: 'center',
}));
const HeaderPrototypeBarStyled = styled('div')(() => ({
  padding: '8px',
  display: 'flex',
  color: 'black',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        // 👇 icono flujo HORIZONTAL
        backgroundImage:
          // eslint-disable-next-line quotes
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'><rect x='2' y='6' width='4' height='8' stroke='%23fff' fill='none' stroke-width='2'/><rect x='14' y='6' width='4' height='8' stroke='%23fff' fill='none' stroke-width='2'/><line x1='6' y1='10' x2='14' y2='10' stroke='%23fff' stroke-width='2'/><polygon points='14,8 18,10 14,12' fill='%23fff'/></svg>\")",
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#aab4be',
        ...theme.applyStyles('dark', {
          backgroundColor: '#8796A5',
        }),
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#001e3c',
    width: 32,
    height: 32,
    '&::before': {
      content: '""',
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      // 👇 icono flujo VERTICAL
      backgroundImage:
        // eslint-disable-next-line quotes
        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'><rect x='6' y='2' width='8' height='4' stroke='%23fff' fill='none' stroke-width='2'/><rect x='6' y='14' width='8' height='4' stroke='%23fff' fill='none' stroke-width='2'/><line x1='10' y1='6' x2='10' y2='14' stroke='%23fff' stroke-width='2'/><polygon points='8,14 10,18 12,14' fill='%23fff'/></svg>\")",
    },
    ...theme.applyStyles('dark', {
      backgroundColor: '#003892',
    }),
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: '#aab4be',
    borderRadius: 20 / 2,
    ...theme.applyStyles('dark', {
      backgroundColor: '#8796A5',
    }),
  },
}));

type HeaderBarProps = {
  handleSaveModule: () => void;
  handleTogglePreview: () => void;
  handlePrint?: () => void;
  isValid: boolean;
  isLoading: boolean;
  isShowPreview: boolean;
  moduleName: string;
  handleToggleFlowMode: () => void;
  flowMode: boolean;
};

const HeaderBar: React.FC<HeaderBarProps> = ({
  handleSaveModule,
  handleTogglePreview,
  handlePrint,
  isValid,
  isLoading,
  isShowPreview,
  moduleName,
  handleToggleFlowMode,
  flowMode,
}) => {
  return (
    <>
      {isShowPreview ? (
        <HeaderPrototypeBarStyled>
          <Box sx={{ width: '16%' }}></Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography
              fontWeight={500}
              fontSize={16}
              color={'rgba(0, 0, 0, 1)'}
            >
              Vista de prototipo
            </Typography>
            <Typography variant="subtitle2">{moduleName}</Typography>
          </Box>
          <Box display={'flex'} m={2}>
            <Button
              text={'Regresar'}
              onClick={handleTogglePreview}
              disabled={isLoading}
              variant="contained"
            />
            <Divider orientation="vertical" sx={{ height: 'auto' }} />
          </Box>
        </HeaderPrototypeBarStyled>
      ) : (
        <HeaderBarStyled>
          <Typography variant="subtitle1">
            <Typography variant="caption" component={'span'}>
              Nombre:{' '}
            </Typography>
            {moduleName}
          </Typography>
          <Box display={'flex'} m={2}>
            {handlePrint && (
              <Button onClick={handlePrint} text="Print" variant="contained" />
            )}
            <Tooltip title={flowMode ? 'Ver lista' : 'Ver diagrama'}>
              <FormControlLabel
                control={
                  <MaterialUISwitch
                    sx={{ m: 1 }}
                    value={flowMode}
                    onChange={handleToggleFlowMode}
                  />
                }
                label=""
              />
            </Tooltip>
            <Button
              text={'Vista de prototipo'}
              onClick={handleTogglePreview}
              disabled={isLoading}
              variant="outlined"
              endIcon={<PhoneAndroid />}
            />

            <Button
              text={'Publicar Módulo'}
              variant="contained"
              isLoading={isLoading}
              disabled={isLoading || !isValid}
              sx={{ marginLeft: 2 }}
              onClick={handleSaveModule}
            />
          </Box>
          <Divider orientation="vertical" sx={{ height: 'auto' }} />
        </HeaderBarStyled>
      )}
    </>
  );
};

export default HeaderBar;
