import React, { useCallback, useEffect, useState } from 'react';
import { Grid, InputLabel, Typography } from '@mui/material';
import Dialog from '@ui/components/molecules/Dialog/Dialog';
import { useFormik } from 'formik';
import * as yup from 'yup';
import TextField from '@ui/components/atoms/TextField/TextField';
import Button from '@ui/components/atoms/Button/Button';
import PhoneTextField from '@ui/components/atoms/PhoneTextField/PhoneTextField';
import { inputRemoveAllASCII } from '@ui/utils/inputs';
import { AgentCreate } from '../../models/agent';
import { MODULE_ACTOR_DISPLAY_NAME } from '../../../';
import { AuthService } from '@/modules/auth/src/services/auth';

type GathererDialogProps = {
  agent?: AgentCreate;
  closeAction(isUpdateDataTable?: boolean): void;
  saveAction(gatherer: AgentCreate): void;
  clearFields: boolean;
};
type usernameStatus = {
  detail: string;
  type: 'success' | 'warning' | 'error';
};
const GathererDialog: React.FC<GathererDialogProps> = (
  props: GathererDialogProps,
) => {
  const { agent, closeAction, saveAction, clearFields } = props;

  const [needUsername, setNeedUsername] = useState<boolean>(false);
  const [usernameStatus, setUsernameStatus] = useState<usernameStatus | null>(
    null,
  );

  const newAgent: AgentCreate = {
    id: agent?.id ?? '',
    first_name: agent?.first_name ?? '',
    last_name: agent?.last_name ?? '',
    dni: agent?.dni ?? '',
    email: agent?.email ?? '',
    sms_number: agent?.sms_number ?? '',
    wsp_number: agent?.wsp_number ?? '',
    cell_number: agent?.cell_number ?? '',
    identity_id: agent?.identity_id ?? '',
    username: agent?.username ?? '',
    status: agent?.status ?? 'active',
    tenant_id: localStorage.getItem('tenant_id') ?? '',
  };

  // validation
  const validationSchema = yup.object().shape({
    last_name: yup.string().required('Campo requerido.'),
    first_name: yup.string().required('Campo requerido.'),
    username: yup.string().required('Campo requerido.'),
    cell_number: yup.string().required('Campo requerido.'),
    sms_number: yup
      .string()
      .required('Campo requerido.')
      .min(6, 'Ingrese un número válido'),
    dni: yup.string().required('Campo requerido.'),
    // group: yup.string().required('Campo requerido.')
  });

  const formik = useFormik({
    initialValues: newAgent,
    onSubmit: (value: AgentCreate) => {
      //Verifica Phone
      try {
        const errors: any = {};
        if (
          formik?.values?.cell_number?.slice(0, 2) === '51' &&
          formik?.values?.cell_number?.length > 2 &&
          formik?.values?.cell_number?.length !== 11
        ) {
          errors['cell_number'] =
            'El número de celular debe tener 9 caracteres.';
        }
        if (
          formik?.values?.sms_number?.slice(0, 2) === '51' &&
          formik?.values?.sms_number?.length > 2 &&
          formik?.values?.sms_number?.length !== 11
        ) {
          errors['sms_number'] =
            'El número de celular debe tener 9 caracteres.';
        }
        if (
          formik?.values?.wsp_number?.slice(0, 2) === '51' &&
          formik?.values?.wsp_number?.length > 2 &&
          formik?.values?.wsp_number?.length !== 11
        ) {
          errors['wsp_number'] =
            'El número de celular debe tener 9 caracteres.';
        }

        const prevUser = Object.assign({}, value);
        const phone = prevUser.cell_number ? prevUser.cell_number : '';
        if (!phone.includes('+')) {
          prevUser['cell_number'] = phone.length > 5 ? '+' + phone : '';
        }
        const sms_phone = prevUser.sms_number ? prevUser.sms_number : '';
        if (!sms_phone.includes('+')) {
          prevUser['sms_number'] = sms_phone.length > 5 ? '+' + sms_phone : '';
        }
        const wsp_phone = prevUser.wsp_number ? prevUser.wsp_number : '';
        if (!wsp_phone.includes('+')) {
          prevUser['wsp_number'] = wsp_phone.length > 5 ? '+' + wsp_phone : '';
        }

        saveAction(prevUser);
      } catch (error) {
        closeAction();
      } finally {
        formik.setSubmitting(false);
      }
    },
    validationSchema,
  });

  const onSubmit = useCallback(async () => {
    await formik.setErrors({});
    formik.handleSubmit();
  }, [formik]);

  const handleOnChangePhoneInput = useCallback(
    (value: string, name: string) => {
      formik.setFieldValue(name, value);
    },
    [formik],
  );

  const handleVerifyEid = useCallback(
    async (eid: string) => {
      try {
        const resp = await AuthService.getIdentityByEid(eid);
        if (resp) {
          formik.setFieldValue('username', resp.username);
          // indico que el dni ya existe en el sistema y que se va a registrar el mismo username y que puede usar ese username para utilizar las capacidades de acopiador
          setUsernameStatus({
            detail: `El DNI ya existe en el sistema su usuario es " ${resp.username} ", podrá ingresar con ese nombre de usuario para utilizar las capacidades de ${MODULE_ACTOR_DISPLAY_NAME}, puede continuar con el registro.`,
            type: 'success',
          });
        }
      } catch (error) {
        // console.error(error);
        setNeedUsername(true);
        setUsernameStatus({
          detail: 'Se requiere ingresar un username para el usuario.',
          type: 'warning',
        });
      }
    },
    [formik],
  );

  const handleOnChangeUsernameInput = useCallback(
    (event: any) => {
      const { name, value } = event.target;
      formik.setFieldValue(name, inputRemoveAllASCII(value)?.toLowerCase());
    },
    [formik],
  );

  useEffect(() => {
    formik.setFieldValue('username', '');
    formik.setFieldValue('dni', '');
    formik.setSubmitting(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearFields]);

  useEffect(() => {
    console.log(formik.errors);
    // return () => {

    // };
  }, [formik.errors]);

  return (
    <Dialog
      open={true}
      title={`Nuevo ${MODULE_ACTOR_DISPLAY_NAME}`}
      subtitle={`Información del ${MODULE_ACTOR_DISPLAY_NAME}`}
      onClose={() => closeAction()}
      actions={
        <>
          <Button
            onClick={() => closeAction()}
            variant="outlined"
            disabled={formik.isSubmitting}
            text="Cancelar"
            sx={{ marginInline: 1 }}
          />

          {formik.values.id === '' && (
            <Button
              onClick={() => {
                if (formik.values.username !== '') {
                  onSubmit();
                } else {
                  handleVerifyEid(formik.values.dni);
                }
              }}
              color="primary"
              variant="contained"
              disabled={formik.isSubmitting}
              isLoading={formik.isSubmitting}
              text={formik.values.username === '' ? 'Validar DNI' : 'Registrar'}
            />
          )}
        </>
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
            disabled={formik.isSubmitting}
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
            disabled={formik.isSubmitting}
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
            disabled={formik.isSubmitting}
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
          <PhoneTextField
            id="cell_number"
            name="cell_number"
            label="Número celular"
            value={formik.values?.cell_number}
            onChange={handleOnChangePhoneInput}
            errors={formik.errors}
            touched={formik.touched}
            disabled={formik.isSubmitting}
          />
        </Grid>
        <Grid size={12}>
          <PhoneTextField
            id="sms_number"
            name="sms_number"
            label="Número celular sms"
            value={formik.values?.sms_number}
            onChange={handleOnChangePhoneInput}
            errors={formik.errors}
            touched={formik.touched}
            disabled={formik.isSubmitting}
          />
        </Grid>
        <Grid size={12}>
          <PhoneTextField
            id="wsp_number"
            name="wsp_number"
            label="Número celular wsp"
            value={formik.values?.wsp_number}
            onChange={handleOnChangePhoneInput}
            errors={formik.errors}
            touched={formik.touched}
            disabled={formik.isSubmitting}
          />
        </Grid>

        {needUsername && (
          <Grid size={12}>
            <InputLabel id={'username'} shrink={true}>
              Nombre de usuario
            </InputLabel>
            <TextField
              id="username"
              name="username"
              type="text"
              variant="outlined"
              size="small"
              label=""
              value={formik.values.username}
              onChange={handleOnChangeUsernameInput}
              disabled={formik.isSubmitting}
              errors={formik.errors}
              touched={formik.touched}
            />
          </Grid>
        )}
        {usernameStatus && (
          <Grid size={12}>
            <Typography color={usernameStatus.type}>
              {usernameStatus.detail}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Dialog>
  );
};

export default React.memo(GathererDialog);
