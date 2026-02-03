import React, { useCallback, useState } from 'react';
import { TextField } from '@mui/material';
import { NumberRule, SchemaInput } from '../../../../../models/forms';
import { State } from '@hookstate/core';

type NumberInputProps = {
  schema: State<SchemaInput>;
  fontSize: number;
};

const NumberInput: React.FC<NumberInputProps> = (props: NumberInputProps) => {
  const { schema, fontSize } = props;
  const [validationMessage, setValidationMessage] = useState<string>('');

  const assignValue = useCallback(
    (newValue: number) => {
      let isValid = true;

      schema.rules.ornull?.number.ornull?.forEach(
        (element: State<NumberRule>) => {
          if (
            element.get().type_rule === 'min' &&
            newValue < +element.get().value
          ) {
            setValidationMessage(`Valor mínimo ${element.get().value}`);
            isValid = false;
          }
          if (
            element.get().type_rule === 'max' &&
            newValue > +element.get().value
          ) {
            setValidationMessage(`Valor máximo ${element.get().value}`);
            isValid = false;
          }
          if (
            element.get().type_rule === 'not_equal' &&
            newValue !== +element.get().value
          ) {
            setValidationMessage(
              `Valor debe ser diferente a ${element.get().value}`,
            );
            isValid = false;
          }
        },
      );

      if (!isNaN(newValue) && isValid) {
        setValidationMessage('');
        schema.nested('value').set(newValue);
      }
    },
    [schema],
  );

  return (
    <>
      <TextField
        variant="outlined"
        size="small"
        fullWidth
        //   maxRows={2}
        placeholder={schema.get().place_holder ?? ''}
        id={`input_element_${schema.get().id ?? ''}`}
        name={`input_element_${schema.get().id ?? ''}`}
        value={schema.get().value}
        type="number"
        helperText={validationMessage}
        error={validationMessage !== ''}
        onChange={(e: any) => {
          assignValue(e.target.value);
        }}
        InputProps={{
          sx: {
            fontSize: `${fontSize * 4}px`,
            '&::before': {
              border: 'none',
            },
          },
        }}
      />
      {/* {validationMessage !== '' && <FormHelperText>{validationMessage}</FormHelperText>} */}
    </>
  );
};

export default NumberInput;
