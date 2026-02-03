import React, { useCallback, useState } from 'react';
import { TextField } from '@mui/material';
import { SchemaInput, StringRule } from '../../../../../models/forms';
import { State } from '@hookstate/core';

type TextInputProps = {
  schema: State<SchemaInput>;
  fontSize: number;
};

const TextInput: React.FC<TextInputProps> = (props: TextInputProps) => {
  const { schema, fontSize } = props;
  const [validationMessage, setValidationMessage] = useState<string>('');

  const assignValue = useCallback(
    (newValue: string) => {
      let isValid = true;

      schema.rules.ornull?.string.ornull?.forEach(
        (element: State<StringRule>) => {
          if (
            element.get().rule === 'min' &&
            newValue.length < +element.get().value
          ) {
            setValidationMessage(`Valor mínimo ${element.get().value}`);
            isValid = false;
          }
          if (
            element.get().rule === 'max' &&
            newValue.length > +element.get().value
          ) {
            setValidationMessage(`Valor máximo ${element.get().value}`);
            isValid = false;
          }
          if (
            element.get().rule === 'equal' &&
            newValue.length !== +element.get().value
          ) {
            setValidationMessage(
              `Valor debe ser igual a ${element.get().value}`,
            );
            isValid = false;
          }
        },
      );

      if (isValid) {
        schema.nested('value').set(newValue);
        setValidationMessage('');
      }
    },
    [schema],
  );

  return (
    <>
      <TextField
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
              border: 'none',
            },
          },
        }}
      />
      {/* {validationMessage !== '' && <FormHelperText>{validationMessage}</FormHelperText>} */}
    </>
  );
};

export default TextInput;
