import React, { useCallback } from 'react';
import { Farmer, FarmerGet } from '../../../models/farmer';
import Dialog from '@/ui/components/molecules/Dialog/Dialog';
import { Box, Grid, InputLabel } from '@mui/material';
import Button from '@/ui/components/atoms/Button/Button';
import { useFormik } from 'formik';
import * as yup from 'yup';
import TextField from '@/ui/components/atoms/TextField/TextField';
// import PhoneTextField from '@/ui/components/atoms/PhoneTextField/PhoneTextField';

type ProducerInfoDialogProps = {
  farmer: FarmerGet;
  open: boolean;
  handleClose: () => void;
  handleSave: (id: string, farmer: Farmer) => Promise<boolean>;
};

const ProducerInfoDialog: React.FC<ProducerInfoDialogProps> = (
  props: ProducerInfoDialogProps,
) => {
  const { farmer, open, handleClose, handleSave } = props;

  const newFarmer: any = {
    id: farmer.id,
    first_name: farmer.first_name,
    last_name: farmer.last_name,
    dni: farmer.dni,
    email: farmer.email,
    wsp_number: farmer.wsp_number,
    sms_number: farmer.sms_number,
    call_number: farmer.call_number,
    address: farmer.address,
  };

  const validationSchema = yup.object().shape({
    first_name: yup.string().required('Requerido'),
    last_name: yup.string().required('Requerido'),
    dni: yup.string().required('Requerido'),
    sms_number: yup
      .string()
      .required('Campo requerido.')
      .min(6, 'Ingrese un número válido'),
  });

  const formik = useFormik({
    initialValues: newFarmer,
    onSubmit: async (value: Farmer) => {
      console.log(value);
      const prevFarmer = Object.assign({}, value);
      const id = prevFarmer.id;
      const success = await handleSave(id, prevFarmer);
      if (success) {
        formik.setSubmitting(false);
      }
    },
    validationSchema,
  });

  const onSubmit = useCallback(async () => {
    await formik.setErrors({});
    formik.handleSubmit();
  }, [formik]);

  //   const handleOnChangePhoneInput = useCallback(
  //     (value: string, name: string) => {
  //       formik.setFieldValue(name, value);
  //     },
  //     [formik],
  //   );

  return (
    <Dialog
      onClose={handleClose}
      title={'Información principal'}
      subtitle={'Datos principales'}
      open={open}
      actions={
        <Box
          display="flex"
          justifyContent={'space-between'}
          width={'100%'}
          p={2}
        >
          <Button onClick={handleClose} variant="outlined" text="Cancelar" />
          <Button
            onClick={onSubmit}
            variant="contained"
            text="Guardar cambios"
          />
        </Box>
      }
    >
      <Grid container spacing={1}>
        <Grid size={12}>
          <InputLabel id={'dni'} shrink={true}>
            DNI
          </InputLabel>
          <TextField
            id="dni"
            name="dni"
            type="text"
            variant="outlined"
            size="small"
            label=""
            value={formik.values.dni}
            disabled={true}
            errors={formik.errors}
            touched={formik.touched}
            onChange={(e: any) => {
              formik.handleChange(e);
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InputLabel id={'first_name'} shrink={true}>
            Nombres
          </InputLabel>
          <TextField
            id="first_name"
            name="first_name"
            type="text"
            variant="outlined"
            size="small"
            label=""
            value={formik.values.first_name}
            onChange={formik.handleChange}
            disabled={true}
            errors={formik.errors}
            touched={formik.touched}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InputLabel id={'last_name'} shrink={true}>
            Apellidos
          </InputLabel>
          <TextField
            id="last_name"
            name="last_name"
            type="text"
            variant="outlined"
            size="small"
            label=""
            value={formik.values.last_name}
            onChange={formik.handleChange}
            disabled={true}
            errors={formik.errors}
            touched={formik.touched}
          />
        </Grid>
        <Grid size={12}>
          <InputLabel id={'email'} shrink={true}>
            Email
          </InputLabel>
          <TextField
            id="email"
            name="email"
            type="text"
            label=""
            size="small"
            variant="outlined"
            value={formik.values.email}
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            errors={formik.errors}
            touched={formik.touched}
          />
        </Grid>
        <Grid size={12}>
          <InputLabel id={'sms_number'} shrink={true}>
            SMS
          </InputLabel>
          <TextField
            id="sms_number"
            name="sms_number"
            type="text"
            label=""
            size="small"
            variant="outlined"
            value={formik.values.sms_number}
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            errors={formik.errors}
            touched={formik.touched}
          />
        </Grid>
        <Grid size={12}>
          <InputLabel id={'wsp_number'} shrink={true}>
            WhatsApp
          </InputLabel>
          <TextField
            id="wsp_number"
            name="wsp_number"
            type="text"
            label=""
            size="small"
            variant="outlined"
            value={formik.values.wsp_number}
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            errors={formik.errors}
            touched={formik.touched}
          />
        </Grid>
        <Grid size={12}>
          <InputLabel id={'call_number'} shrink={true}>
            Llamadas
          </InputLabel>
          <TextField
            id="call_number"
            name="call_number"
            type="text"
            label=""
            size="small"
            variant="outlined"
            value={formik.values.call_number}
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            errors={formik.errors}
            touched={formik.touched}
          />
        </Grid>
        <Grid size={12}>
          <InputLabel id={'address'} shrink={true}>
            Dirección
          </InputLabel>
          <TextField
            id="address"
            name="address"
            type="text"
            label=""
            size="small"
            variant="outlined"
            value={formik.values.address}
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            errors={formik.errors}
            touched={formik.touched}
          />
        </Grid>
      </Grid>
    </Dialog>
  );
};

export default React.memo(ProducerInfoDialog);
