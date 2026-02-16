import { Box, Grid, Tooltip } from '@mui/material';
import React, { useCallback, useState } from 'react';
import {
  CaptionStyled,
  FieldValueStyled,
  TitleSectionStyled,
  BoxIconButton,
} from '..';
import Paper from '@/ui/components/atoms/Paper/Paper';
import { FarmerGet } from '../../../models/farmer';
import { BorderColorOutlined } from '@mui/icons-material';
import ProducerInfoDialog from '../components/ProducerInfoDialog';
import ProducerLocationDialog from '../components/ProducerLocationDialog';
import { FarmerService } from '../../../services/farmer';
import { showMessage } from '@/ui/utils/Messages';

type ProducerTabProps = {
  farmer: FarmerGet;
  handleRefresh: () => void;
};

const ProducerTab: React.FC<ProducerTabProps> = (props: ProducerTabProps) => {
  const { farmer, handleRefresh } = props;

  const [isOpenInfoDialog, setIsOpenInfoDialog] = useState<boolean>(false);
  const [
    isOpenProducerLocationDialog,
    setIsOpenProducerLocationDialog,
  ] = useState<boolean>(false);

  const handleInfoDialog = () => {
    setIsOpenInfoDialog((prev: boolean) => !prev);
  };

  // const handleSaveProducerLocation = (value: any) => {
  //   console.log(value);
  // };
  // const handleSaveProducerInfo = (value: any) => {
  //   console.log(value);
  // };

  const handlePatchProducer = useCallback((id: string, data: any): Promise<
    boolean
  > => {
    return new Promise((resolve) => {
      FarmerService.patchFarmer(id, data)
        .then(() => {
          showMessage('', 'Información guardada correctamente.', 'success');
          handleRefresh();
          setIsOpenInfoDialog(false);
          setIsOpenProducerLocationDialog(false);
          resolve(true);
        })
        .catch(() => {
          showMessage(
            '',
            'Problemas al guardar información, inténtelo nuevamente.',
            'error',
          );
        });
    });
  }, []);

  const handleProducerLocationDialog = () => {
    setIsOpenProducerLocationDialog((prev: boolean) => !prev);
  };

  return (
    <>
      <Paper>
        <Box display={'flex'} alignItems={'flex-start'}>
          <TitleSectionStyled>DATOS PRINCIPALES</TitleSectionStyled>
          &nbsp;
          <Tooltip title="Editar">
            <BoxIconButton onClick={() => setIsOpenInfoDialog(true)}>
              <BorderColorOutlined color="primary" />
            </BoxIconButton>
          </Tooltip>
        </Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <CaptionStyled>Nombres</CaptionStyled>
            <FieldValueStyled>{farmer.first_name ?? '-'}</FieldValueStyled>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CaptionStyled>Apellidos</CaptionStyled>
            <FieldValueStyled>{farmer.last_name ?? '-'}</FieldValueStyled>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CaptionStyled>DNI</CaptionStyled>
            <FieldValueStyled>{farmer.dni ?? '-'}</FieldValueStyled>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CaptionStyled>Email</CaptionStyled>
            <FieldValueStyled>{farmer.email ?? '-'}</FieldValueStyled>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CaptionStyled>SMS</CaptionStyled>
            <FieldValueStyled>{farmer.sms_number ?? '-'}</FieldValueStyled>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CaptionStyled>WhatsApp</CaptionStyled>
            <FieldValueStyled>{farmer.wsp_number ?? '-'}</FieldValueStyled>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CaptionStyled>Llamadas</CaptionStyled>
            <FieldValueStyled>{farmer.call_number ?? '-'}</FieldValueStyled>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CaptionStyled>Dirección</CaptionStyled>
            <FieldValueStyled>{farmer.address ?? '-'}</FieldValueStyled>
          </Grid>
        </Grid>
      </Paper>
      <Paper>
        <Box display={'flex'} alignItems={'flex-start'}>
          <TitleSectionStyled>DATOS GEOGRÁFICOS</TitleSectionStyled>
          &nbsp;
          <Tooltip title="Editar">
            <BoxIconButton
              onClick={() => setIsOpenProducerLocationDialog(true)}
            >
              <BorderColorOutlined color="primary" />
            </BoxIconButton>
          </Tooltip>
        </Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <CaptionStyled>País</CaptionStyled>
            <FieldValueStyled>{farmer.country?.name ?? '-'}</FieldValueStyled>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CaptionStyled>Departamento</CaptionStyled>
            <FieldValueStyled>
              {farmer.department?.name ?? '-'}
            </FieldValueStyled>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CaptionStyled>Provincia</CaptionStyled>
            <FieldValueStyled>{farmer.province?.name ?? '-'}</FieldValueStyled>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CaptionStyled>Distrito</CaptionStyled>
            <FieldValueStyled>{farmer.district?.name ?? '-'}</FieldValueStyled>
          </Grid>
        </Grid>
      </Paper>

      <ProducerInfoDialog
        farmer={farmer}
        open={isOpenInfoDialog}
        handleSave={handlePatchProducer}
        handleClose={handleInfoDialog}
      />
      <ProducerLocationDialog
        farmerLocation={{
          id: farmer.id,
          country_id: farmer.country.id ?? '',
          department_id: farmer.department.id ?? '',
          province_id: farmer.province.id ?? '',
          district_id: farmer.district.id ?? '',
        }}
        open={isOpenProducerLocationDialog}
        handleSave={handlePatchProducer}
        handleClose={handleProducerLocationDialog}
      />
    </>
  );
};

export default React.memo(ProducerTab);
