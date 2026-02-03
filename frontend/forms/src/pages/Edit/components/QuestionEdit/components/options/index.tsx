import React, { useCallback, useEffect, useState } from 'react';
import {
  Divider,
  FormControl,
  MenuItem,
  Select,
  styled,
  Typography,
} from '@mui/material';
import { OptionRule, SchemaInput } from '../../../../../../models/forms';
import { State } from '@hookstate/core';
// import apiWithoutUrl from '~/service/api_without_url';
import { FormService } from '@/modules/forms/src/services/forms';

const RootStyled = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

type Option = {
  id?: string;
  display_name?: string;
  description?: string;
};

type OptionsComponentProps = {
  schema: State<SchemaInput>;
  disabled?: boolean;
};

const OptionsComponent: React.FC<OptionsComponentProps> = (
  props: OptionsComponentProps,
) => {
  const { schema, disabled } = props;
  const [optionsArray, setOptionsArray] = useState<Option[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState<boolean>(false);
  const [isMultiple, setIsMultiple] = useState(false);

  const onChange = useCallback(
    (newValue: any) => {
      schema.nested('value').set(newValue);
    },
    [schema],
  );

  useEffect(() => {
    const options = schema.get().rules?.options;
    const localValue = schema.get().value;
    if (typeof localValue === 'string') {
      onChange([`${localValue}`]);
    }
    if (options && options.length > 0) {
      options.forEach((element: OptionRule) => {
        if (element.value === 'multiple') {
          setIsMultiple(true);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (schema.get().api_options && schema.get().api_options !== '') {
      setIsLoadingOptions(true);
      FormService.getListEntities(
        schema.get().api_options ?? '',
        1,
        100,
        'name',
        'asc',
        '',
      )
        .then((resp: any) => {
          const { items } = resp;
          if (Array.isArray(items) && items.length > 0) {
            setOptionsArray(items);
            schema.options.set(items);
          }
          setIsLoadingOptions(false);
        })
        .catch((_err: any) => {
          setIsLoadingOptions(false);
        });
    } else if (schema.get().options && schema.options?.get) {
      // const options = schema.options.get();
      const options = schema.options.get({ noproxy: true });
      // const rawOptions = schema.options.get({ noproxy: true });
      // console.log(rawOptions);

      // console.log(schema.options.get());
      // console.log('Options from schema:', options);
      if (Array.isArray(options) && options.length > 0) {
        setOptionsArray(options);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RootStyled>
      {!isLoadingOptions ? (
        <FormControl
          variant="outlined"
          fullWidth
          sx={{ marginBlock: 2 }}
          disabled={disabled}
        >
          <Typography sx={{ color: '#B2B6B9' }}>
            {schema.get().place_holder ?? ''}
          </Typography>
          <Select
            id={`option_component_${schema.get().id}`}
            size="small"
            multiple={isMultiple}
            value={schema.get().value ?? []}
            onChange={(e: any) => onChange(e.target.value)}
            sx={{ mt: 1 }}
          >
            {optionsArray.map((element: any, index: number) => {
              return (
                <MenuItem
                  key={`option_${element.display_name}_${index}`}
                  value={`${element?.id || element?.name}`}
                >
                  {element.display_name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      ) : (
        <Typography sx={{ marginBlock: 2 }}>Cargando opciones ...</Typography>
      )}
      <Divider
        style={{ marginBlock: '8px', color: 'rgba(149, 149, 149, 1)' }}
      />
    </RootStyled>
  );
};

export default OptionsComponent;
