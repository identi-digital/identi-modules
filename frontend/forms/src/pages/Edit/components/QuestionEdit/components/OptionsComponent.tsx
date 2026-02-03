import { Box, Link, styled } from '@mui/material';
import React, { useEffect, useState } from 'react';
import DialogOptions from './dialogs/DialogOptions';
import OptionComponentStyled from './OptionComponentStyled';
import { Rule } from '../../../../../models/forms';
import { ImmutableObject } from '@hookstate/core';
import { v4 as uuidv4 } from 'uuid';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
}));
const BoxOptionsStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  maxHeight: '200px',
}));

type OptionsComponentProps = {
  options: any[];
  is_multiple: boolean;
  is_increasing: boolean;
  label_increasing: string;
  handleChangeValues: (values: any[]) => void;
  rules?: ImmutableObject<Rule>;
};

const OptionsComponent: React.FC<OptionsComponentProps> = (
  props: OptionsComponentProps,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    options,
    is_multiple,
    label_increasing,
    is_increasing,
    handleChangeValues,
    rules,
  } = props;

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // verifica que las opciones tengan el campo id. Si no lo tiene, lo agrega
  useEffect(() => {
    if (options.length > 0) {
      let hasCorrectedOptions = false;
      const correctedOptions = options.map((element: any) => {
        if (!element.id) {
          element.id = uuidv4();
          hasCorrectedOptions = true;
        }
        return element;
      });
      if (hasCorrectedOptions) {
        handleChangeValues(correctedOptions);
      }
    }
    // console.log(options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  return (
    <RootStyled>
      <BoxOptionsStyled className="scrollBarClass">
        {options.map((element: any, index: number) => {
          // console.log(element);
          return (
            <OptionComponentStyled
              key={`${element.id}_${index}`}
              index={index}
              value={element.value}
              is_edit={false}
            />
          );
        })}
      </BoxOptionsStyled>
      {is_increasing ? (
        <Box mt={2}>
          <Link
            component="button"
            variant="body2"
            fontSize={16}
            color={'#1881D4'}
            onClick={handleClickOpen}
          >
            {label_increasing}
          </Link>
        </Box>
      ) : (
        <></>
      )}
      {open && (
        <DialogOptions
          open={open}
          handleClose={handleClose}
          handleSave={handleChangeValues}
          options={options}
          rules={rules}
        />
      )}
    </RootStyled>
  );
};

export default OptionsComponent;
