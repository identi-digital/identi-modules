import React, { useCallback } from 'react';
import { styled, Switch, Typography } from '@mui/material';
import { SchemaInput } from '../../../../../models/forms';
import { State } from '@hookstate/core';

const BoxConfigStyled = styled('div')(() => ({
  display: 'flex',
  //   justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '10px',
}));

type BooleanInputProps = {
  schema: State<SchemaInput>;
  fontSize: number;
};

const label = { inputProps: { 'aria-label': 'Switch boolean input' } };

const BooleanInput: React.FC<BooleanInputProps> = (
  props: BooleanInputProps,
) => {
  const { schema } = props;
  //   const [validationMessage, setValidationMessage] = useState<string>('Hola');

  const assignValue = useCallback(
    (newValue: string) => {
      //   let isValid = true;

      //   schema.rules.ornull?.string.ornull?.forEach((element: State<StringRule>) => {
      //     if (element.get().rule === 'min' && newValue.length < +element.get().value) {
      //       setValidationMessage(`Valor mínimo ${element.get().value}`);
      //       isValid = false;
      //     }
      //     if (element.get().rule === 'max' && newValue.length > +element.get().value) {
      //       setValidationMessage(`Valor máximo ${element.get().value}`);
      //       isValid = false;
      //     }
      //     if (element.get().rule === 'equal' && newValue.length !== +element.get().value) {
      //       setValidationMessage(`Valor debe ser igual a ${element.get().value}`);
      //       isValid = false;
      //     }
      //   });

      //   if (isValid) {
      schema.nested('value').set(newValue);
      //   setValidationMessage('');
      //   }
    },
    [schema],
  );

  return (
    <>
      <BoxConfigStyled>
        <Switch
          {...label}
          name={'is_optional'}
          onChange={(e: any) => {
            // console.log(e.target.checked);
            assignValue(e.target.checked);
            // console.log(schema);
          }}
          checked={schema.get().value ?? false}
        />
        <Typography fontSize={13}>
          {schema.get().value ? 'Si' : 'No'}
        </Typography>
      </BoxConfigStyled>
      {/* <TextField
        variant="outlined"
        fullWidth
        multiline
        //   maxRows={2}
        placeholder={schema.get().place_holder ?? ''}
        id={`input_element_${schema.get().id ?? ''}`}
        name={`input_element_${schema.get().id ?? ''}`}
        value={schema.get().value}
        helperText={validationMessage}
        error={validationMessage !== ''}
        onChange={(e: any) => {
          // schema.nested('value').set(e.target.value);
          assignValue(e.target.value);
        }}
        InputProps={{
          sx: {
            fontSize: `${fontSize * 4}px`,
            '&::before': {
              border: 'none'
            }
          }
        }}
      /> */}
      {/* {validationMessage !== '' && <FormHelperText>{validationMessage}</FormHelperText>} */}
    </>
  );
};

export default BooleanInput;
