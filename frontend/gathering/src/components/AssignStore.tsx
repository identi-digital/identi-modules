import { Box, Grid } from '@mui/material';
import React, { useCallback, useState } from 'react';
import Dialog from '@ui/components/molecules/Dialog/Dialog';
import Button from '@ui/components/atoms/Button/Button';
import SelectField from '@ui/components/atoms/SelectField/SelectField';
import { showMessage } from '@ui/utils/Messages';

// const arrCurrencies = [
//     {
//         id: '1',
//         display_name: 'Soles'
//     }
// ];

type AssignStoreProps = {
  handleCloseDialog: (isRefresh?: boolean) => void;
  handleAssignStore: (obj: any) => void;
  stores: any[];
  isLoading?: boolean;
};

const AssignStore: React.FC<AssignStoreProps> = ({
  handleCloseDialog,
  handleAssignStore,
  stores,
  isLoading,
  //   handleAssignBalance
}) => {
  //   const newAmount: any = {
  //     id: '',
  //     gatherer_id: gathererIdSelected,
  //     gathering_id: gatheringId,
  //     type: 'RECHARGE',
  //     amount: 0,
  //     created_at: '',
  //     reference: null,
  //     user_id: userId
  //   };

  //   const validationSchema = yup.object().shape({
  //     amount: yup.number().min(1, 'Valor mínimo es 1.').required('Campo requerido.')
  //     // currency_id: yup.string().required('Campo requerido')
  //   });

  //   const formik = useFormik({
  //     initialValues: newAmount,
  //     onSubmit: (value: any) => {
  //       const prevStorage = Object.assign({}, value);
  //       prevStorage.id = uuidv4();
  //       prevStorage.created_at = new Date();
  //       //   console.log(prevStorage);
  //       handleAssignBalance(prevStorage);
  //     },
  //     validationSchema
  //   });
  const [storeSelected, setStoreSelected] = useState<any>(null);

  const handleAssign = useCallback(() => {
    if (storeSelected) {
      //   console.log(storeSelected);
      handleAssignStore(storeSelected);
    } else {
      showMessage('', 'Selecciona algún almacén', 'warning');
    }
  }, [handleAssignStore, storeSelected]);

  const handleOnChangeSelectInput = useCallback(
    (_name: string, value: string) => {
      //   console.log(value);
      // obtengo el almacen y lo guardo en el state
      const store = stores.find((element: any) => element.id === value);
      if (store) {
        setStoreSelected(store);
      }
      // formik.setFieldValue(value, name);
    },
    [stores],
  );

  return (
    <Dialog
      open={true}
      title="Despacho de lotes"
      subtitle="Selecciona el almacén donde quieres despachar"
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
            // disabled={formik.isSubmitting}
            text="Cancelar"
          />
          <Button
            onClick={() => handleAssign()}
            color="primary"
            variant="contained"
            // disabled={formik.isSubmitting}
            isLoading={isLoading}
            text="Asignar"
          />
        </Box>
      }
    >
      <Grid container spacing={1}>
        {/* <Grid item={true} xs={12} sm={12} md={12} lg={12} xl={12}>
          <TextField
            id="amount"
            name="amount"
            type="number"
            label="Monto"
            value={formik.values.amount}
            onChange={(e: any) => OnlyNumbers(e) && formik.handleChange(e)}
            disabled={formik.isSubmitting}
            errors={formik.errors}
            touched={formik.touched}
          />
        </Grid> */}
        <Grid size={12}>
          <SelectField
            id="store_id"
            name="store_id"
            label=""
            fullWidth
            items={stores}
            itemText="name"
            itemValue="id"
            value={undefined}
            onChange={handleOnChangeSelectInput}
            // errors={formik.errors}
            // touched={formik.touched}
            // disabled={formik.isSubmitting}
          />
        </Grid>
      </Grid>
    </Dialog>
  );
};

export default AssignStore;
