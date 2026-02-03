import Dialog from '@ui/components/molecules/Dialog/Dialog';
import React from 'react';
import { Module } from '../../models/forms';
import RegisterModuleComponent from '../FormRegister';
type RegisterFormDialogProps = {
  module: Module;
  handleClose: (isRefresh?: boolean) => void;
};

const RegisterFormDialog: React.FC<RegisterFormDialogProps> = (
  props: RegisterFormDialogProps,
) => {
  const { module, handleClose } = props;
  console.log(module);
  return (
    <Dialog
      open={true}
      //   title="Nuevo registro"
      //   subtitle="Información"
      maxWidth="md"
      hideActions={true}
      scroll="body"
      onClose={() => handleClose()}
      //  actions={
      //    <>
      //      <Button onClick={() => closeAction()}
      //  variant="outlined" disabled={formik.isSubmitting} text="Cancelar" />

      //      <Button
      //        onClick={() => onSubmit()}
      //        color="primary"
      //        variant="contained"
      //        disabled={formik.isSubmitting}
      //        isLoading={formik.isSubmitting}
      //        text="Registrar"
      //      />
      //    </>
      //  }
    >
      <RegisterModuleComponent
        isModal={true}
        module={module}
        beforeRegister={() => handleClose(true)}
        handleCancelRegisterView={() => handleClose()}
      />
    </Dialog>
  );
};

export default RegisterFormDialog;
