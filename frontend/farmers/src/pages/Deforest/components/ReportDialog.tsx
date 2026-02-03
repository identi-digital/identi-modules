import Dialog from '@/ui/components/molecules/Dialog/Dialog';
import React from 'react';

type ReportDialogProps = {
  open: boolean;
  children: React.ReactNode;
  handleClose: () => void;
};

const ReportDialog: React.FC<ReportDialogProps> = ({
  open,
  children,
  handleClose,
}) => {
  return (
    <Dialog onClose={handleClose} open={open} maxWidth="md">
      {children}
    </Dialog>
  );
};

export default ReportDialog;
