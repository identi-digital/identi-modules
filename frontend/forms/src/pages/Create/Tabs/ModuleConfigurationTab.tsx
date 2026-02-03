import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import RadioGroupCustomize from '@ui/components/molecules/RadioGroup/RadioGroup';
import TextField from '@ui/components/atoms/TextField/TextField';

const canSeeArray: any[] = [
  {
    value: 'ALL',
    label: 'Todos',
  },
  {
    value: 'PANEL',
    label: 'Panel web',
  },
];

const datesArray: any[] = [
  {
    value: 'always',
    label: 'Siempre activo',
  },
];

type ModuleConfigurationTabProps = {
  formik: any;
};

const ModuleConfigurationTab: React.FC<ModuleConfigurationTabProps> = (
  props: ModuleConfigurationTabProps,
) => {
  const { formik } = props;
  const [active, setActive] = useState<string>('always');
  const gps_tracking = formik.values.gps_tracking || null;
  const [activeTracking, setActiveTracking] = useState<boolean>(
    gps_tracking !== null ? true : false,
  );

  const handleOnChangeOption = (value: string, field_name: string) => {
    formik.setFieldValue(field_name, value);
  };

  useEffect(() => {
    const { active_init_at, active_end_at } = formik.values;
    if (active_init_at !== '' || active_end_at !== '') {
      setActive('date');
    }
  }, [formik]);

  return (
    <>
      <RadioGroupCustomize
        text={'¿Quien puede ver el formulario?'}
        options={canSeeArray}
        value={formik.values.type_view ?? ''}
        field_text={'label'}
        field_value={'value'}
        handleOnSelect={handleOnChangeOption}
        field_name={'type_view'}
      />
      <Divider />
      <RadioGroupCustomize
        text={'¿En qué fecha deseas que este activo el formulario?'}
        options={datesArray}
        value={active}
        field_text={'label'}
        field_value={'value'}
        handleOnSelect={handleOnChangeOption}
        field_name={'date_active'}
      />
      <Divider />
      <Box p={2}>
        <FormControlLabel
          control={
            <Checkbox
              checked={activeTracking}
              onChange={(e: any) => {
                setActiveTracking((prevValue: boolean) => !prevValue);
                if (e.target.checked) {
                  formik.setFieldValue('gps_tracking', { frequency: 0 });
                } else {
                  formik.setFieldValue('gps_tracking', null);
                }
              }}
            />
          }
          label="Activar GPS Tracking para este módulo"
        />

        {activeTracking && (
          <Box mt={1}>
            <Typography>
              Frecuencia{' '}
              <Typography component={'span'} variant="caption">
                (intervalo de tiempo en segundos)
              </Typography>
            </Typography>
            <TextField
              id={'frequency'}
              label={''}
              name={'frequency'}
              size="small"
              type="number"
              variant="outlined"
              value={formik.values.gps_tracking?.frequency ?? 0}
              onKeyPress={(e) => {
                if (e.key === '-' || e.key === '+') {
                  e.preventDefault();
                }
              }}
              onChange={(e: any) => {
                if (!isNaN(+e.target.value)) {
                  formik.setFieldValue(
                    'gps_tracking.frequency',
                    +e.target.value,
                  );
                }
              }}
              inputProps={{
                min: 0,
                inputMode: 'numeric',
                pattern: '[0-9]*', // solo dígitos
              }}
              disabled={formik.isSubmitting}
              errors={formik.errors}
              touched={formik.touched}
            />
          </Box>
        )}
      </Box>
    </>
  );
};

export default ModuleConfigurationTab;
