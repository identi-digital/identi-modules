import { Box, Grid } from '@mui/material';
import React, { useCallback } from 'react';
import Dialog from '@ui/components/molecules/Dialog/Dialog';
import Button from '@ui/components/atoms/Button/Button';
import TextField from '@ui/components/atoms/TextField/TextField';
// import SelectField from '~/ui/atoms/SelectField/SelectField';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { OnlyNumbers } from '@ui/utils/inputs';
// import { v4 as uuidv4 } from 'uuid';
import { BalanceMovement, MovementType } from '../models/balance_movements';

// const arrCurrencies = [
//     {
//         id: '1',
//         display_name: 'Soles'
//     }
// ];

type AssignBalanceProps = {
  // gathererIdSelected: string;
  gatheringId: string;
  userId: string;
  handleCloseDialog: (isRefresh?: boolean) => void;
  handleAssignBalance: (obj: any) => void;
};

const AssignBalance: React.FC<AssignBalanceProps> = ({
  // gathererIdSelected,
  userId,
  gatheringId,
  handleCloseDialog,
  handleAssignBalance,
}) => {
  const newBalance: BalanceMovement = {
    // idRef: '',
    // gatherer_id: '',
    id: '',
    gathering_center_id: gatheringId,
    type_movement: MovementType.RECHARGE,
    ammount: 0,
    created_at: '',
    identity_id: userId,
  };

  const validationSchema = yup.object().shape({
    ammount: yup
      .number()
      .min(1, 'Valor mínimo es 1.')
      .max(99999, 'Valor máximo es 99999.')
      .required('Campo requerido.'),
    // currency_id: yup.string().required('Campo requerido')
  });

  const formik = useFormik({
    initialValues: newBalance,
    onSubmit: (value: any) => {
      const prevStorage = Object.assign({}, value);
      // prevStorage.idRef = uuidv4();
      prevStorage.created_at = new Date();
      //   console.log(prevStorage);
      handleAssignBalance(prevStorage);
    },
    validationSchema,
  });

  const onSubmit = useCallback(async () => {
    await formik.setErrors({});
    formik.handleSubmit();
  }, [formik]);

  //   const handleOnChangeSelectInput = useCallback(
  //     (value: string, name: string) => {
  //       formik.setFieldValue(value, name);
  //     },
  //     [formik]
  //   );

  return (
    <Dialog
      open={true}
      title="Asignar Saldo al centro de acopio"
      subtitle="Ingresa los campos solicitados"
      onClose={() => handleCloseDialog()}
      sx={{
        '& .MuiDialog-container': {
          '& .MuiPaper-root': {
            width: '100%',
            maxWidth: '360px', // Set your width here
          },
        },
      }}
      actions={
        <Box display="flex" justifyContent={'space-between'} width={'100%'}>
          <Button
            onClick={() => handleCloseDialog()}
            variant="outlined"
            disabled={formik.isSubmitting}
            text="Cancelar"
          />
          <Button
            onClick={() => onSubmit()}
            color="primary"
            variant="contained"
            disabled={formik.isSubmitting}
            isLoading={formik.isSubmitting}
            text="Asignar"
          />
        </Box>
      }
    >
      <Grid container spacing={1}>
        <Grid size={12}>
          <TextField
            id="ammount"
            name="ammount"
            type="number"
            label="Monto"
            fullWidth
            variant="outlined"
            value={formik.values.ammount}
            onChange={(e: any) => OnlyNumbers(e) && formik.handleChange(e)}
            disabled={formik.isSubmitting}
            errors={formik.errors}
            touched={formik.touched}
          />
        </Grid>
        {/* <Grid item={true} xs={12} sm={12} md={12} lg={12} xl={12}>
          <SelectField
            id="currency_id"
            name="currency_id"
            label="Moneda"
            items={arrCurrencies}
            itemText="display_name"
            itemValue="id"
            value={formik.values.type}
            onChange={handleOnChangeSelectInput}
            errors={formik.errors}
            touched={formik.touched}
            disabled={formik.isSubmitting}
          />
        </Grid> */}
      </Grid>
    </Dialog>
  );
};

export default AssignBalance;
