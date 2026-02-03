import {
  Box,
  Button,
  Dialog,
  IconButton,
  Link,
  Typography,
  styled,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import OptionComponentStyled from '../OptionComponentStyled';
import { Close } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { showMessage } from '@ui/utils/Messages';
import { ImmutableObject } from '@hookstate/core';
import { Rule } from '../../../../../../models/forms';

type DialogOptionsProps = {
  handleClose: () => void;
  handleSave: (values: any[]) => void;
  open: boolean;
  options: any[];
  rules?: ImmutableObject<Rule>;
};

const BoxOptionsStyled = styled('div')(() => ({
  marginTop: '16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  maxHeight: '250px',
  paddingBlock: '16px',
}));

const DialogOptions: React.FC<DialogOptionsProps> = (
  props: DialogOptionsProps,
) => {
  const { handleClose, handleSave, open, options, rules } = props;
  const [optionsArray, setOptionsArray] = useState<any[]>(options ?? []);
  const [isMore, setIsMore] = useState(false);
  const [ruleStr, setRuleStr] = useState<string>('');

  const onChangeInput = useCallback((value: string, id: string) => {
    setOptionsArray((prev: any[]) => {
      const newOptions = prev.map((element: any) => {
        if (element.id === id) {
          return { ...element, value: value };
        }
        return element;
      });
      return newOptions;
    });
  }, []);

  const onDeleteInput = (index: number) => {
    setOptionsArray((prev: any[]) => {
      const temp = Object.assign([], prev);
      temp.splice(index, 1);
      return temp;
    });
  };

  const handleOnSave = useCallback(() => {
    let isValid = true;
    optionsArray.forEach((element: any) => {
      if (`${element.value ?? ''}`.trim() === '') {
        isValid = false;
      }
    });
    if (isValid) {
      handleSave(optionsArray);
      handleClose();
    } else {
      showMessage(
        'Opciones incompletas',
        'Las opciones deben tener un texto, no se guardaron los cambios',
        'warning',
      );
    }
  }, [handleClose, handleSave, optionsArray]);

  const handleAddOption = () => {
    const newOption = {
      id: uuidv4(),
      value: '',
    };
    setOptionsArray((prev: any[]) => [...prev, newOption]);
  };

  useEffect(() => {
    setIsMore(false);
    setRuleStr('');
    if (rules && rules?.increasing) {
      rules.increasing.forEach((element: any) => {
        if (element.rule === 'equal') {
          if (element.value === optionsArray.length) {
            setIsMore(true);
          }
        }
        if (element.rule === 'max') {
          if (element.value <= optionsArray.length) {
            setIsMore(true);
            setRuleStr(`Valor máximo ${element.value}`);
          }
        }
      });
    }
  }, [optionsArray.length, rules]);

  return (
    <Dialog onClose={handleClose} open={open}>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'start',
          padding: '32px',
          minWidth: '370px',
        }}
      >
        <Typography fontSize={16} fontWeight={600} color={'#1881D4'}>
          Opciones
        </Typography>
        <BoxOptionsStyled className="scrollBarClass">
          {optionsArray.map((element: any, index: number) => {
            return (
              <Box
                key={`${element.id}_${index}`}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  alignItems: 'center',
                }}
              >
                <OptionComponentStyled
                  index={index}
                  value={element.value}
                  id={element.id}
                  is_edit={true}
                  onChange={onChangeInput}
                />
                <IconButton
                  onClick={() => {
                    onDeleteInput(index);
                  }}
                >
                  <Close />
                </IconButton>
              </Box>
            );
          })}
        </BoxOptionsStyled>
        <Box mt={2}>
          <Link
            component="button"
            variant="body2"
            fontSize={16}
            color={isMore ? '#929292' : '#1881D4'}
            disabled={isMore}
            onClick={handleAddOption}
          >
            Agregar opción
          </Link>
          {ruleStr !== '' && <Typography color={'error'}>{ruleStr}</Typography>}
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            marginTop: '32px',
          }}
        >
          <Button variant="contained" color="inherit" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleOnSave}>
            Guardar
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default DialogOptions;
