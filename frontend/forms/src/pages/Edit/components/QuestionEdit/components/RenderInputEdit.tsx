import React, { useCallback, useEffect, useState } from 'react';
import { SchemaInput } from '../../../../../models/forms';
import TextOptionsComponent from './OptionsComponent';
import TextInput from './Input/TextInput';
import { State, useHookstateCallback } from '@hookstate/core';
import { v4 as uuidv4 } from 'uuid';
import NumberInput from './Input/NumberInput';
import OptionsComponent from './options';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import VarsDialog from './dialogs/VarsDialog';
import { Add } from '@mui/icons-material';
// import { ContextLayout } from '~/ui/templates/Layouts/Layout';
// import { useParams } from 'react-router-dom';

type RenderInputEditProps = {
  schema: State<SchemaInput>;
  updateGatherOptions: (values: any[]) => void;
  varsArray: string[];
  isDefault: boolean;
};

export type OptionTypes = {
  id: string;
  value: string;
};

const RenderInputEdit: React.FC<RenderInputEditProps> = ({
  schema,
  varsArray,
  updateGatherOptions,
  isDefault,
}) => {
  console.log(schema);
  const [isOenVarsDialog, setIsOpenVarsDialog] = useState<boolean>(false);
  // eslint-disable-next-line
  // @ts-ignore
  // const { id_module = '' } = useParams();
  // const { validateIfQuestionIsDefault } = useContext(ContextLayout);
  const handleChangeValuesOptionsInput = useHookstateCallback(
    (values: any[]) => {
      //validate rules
      schema.nested('value').set(values);
      if (schema.is_gather_value) {
        //actualizar el esquema gather
        updateGatherOptions(values);
      }
    },
    [schema],
  );

  const getUuid = useCallback((id?: string) => {
    if (id === undefined || id === '') {
      return uuidv4();
    }
    return id;
  }, []);

  useEffect(() => {
    schema.id.set(getUuid(schema.get().id));
  }, [getUuid, schema]);

  return (
    <>
      {schema ? (
        <Box width={'100%'}>
          {/* {schema.type_input === 'text' && <TextComponent size="medium" text="Escribe tu respuesta aquí" />} */}
          {schema.get().description !== '' && (
            <Typography color="#B2B6B9" fontWeight={400} mt={1}>
              {schema.get().description}
            </Typography>
          )}
          {schema.get().type_input === 'text' && !schema.get().is_increasing && (
            <Box display={'flex'} flexDirection={'row'} width={'100%'}>
              <TextInput
                fontSize={schema.get().font_size ?? 4}
                schema={schema}
              />
              <IconButton
                onClick={() => setIsOpenVarsDialog(true)}
                size="small"
              >
                <Add />
              </IconButton>
            </Box>
          )}
          {schema.get().type_input === 'text' && schema.get().is_increasing && (
            <>
              <TextOptionsComponent
                options={
                  typeof schema.get().value === 'string'
                    ? []
                    : Object.assign(
                        [],
                        JSON.parse(JSON.stringify(schema.get().value ?? [])),
                      ) ?? []
                }
                is_increasing={schema.get().is_increasing ?? false}
                label_increasing={
                  schema.get().label_increasing ?? 'Agregar opción'
                }
                is_multiple={false}
                handleChangeValues={handleChangeValuesOptionsInput}
                rules={schema.get().rules}
              />

              <Box mt={2}>
                <Tooltip title="Usar variable que contiene una lista de opciones">
                  <IconButton
                    onClick={() => {
                      schema.nested('value').set('');
                      setIsOpenVarsDialog(true);
                    }}
                    size="small"
                  >
                    <Add />
                  </IconButton>
                </Tooltip>
                {typeof schema.get().value === 'string' && (
                  <TextInput fontSize={4} schema={schema} />
                )}
              </Box>
            </>
          )}
          {schema.get().type_input === 'number' && (
            <NumberInput
              fontSize={schema.get().font_size ?? 4}
              schema={schema}
            />
          )}
          {schema.get().type_input === 'options' && (
            <OptionsComponent schema={schema} disabled={isDefault} />
          )}
        </Box>
      ) : (
        <></>
      )}
      <VarsDialog
        open={isOenVarsDialog}
        handleClose={() => setIsOpenVarsDialog(false)}
        value=""
        handleSave={(value: string) =>
          schema.nested('value').merge(` {{ ${value} }}`)
        }
        arrVars={varsArray}
      />
    </>
  );
};

export default RenderInputEdit;
