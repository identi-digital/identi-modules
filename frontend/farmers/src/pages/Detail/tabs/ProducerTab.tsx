import { Grid } from '@mui/material';
import React from 'react';
import { CaptionStyled, FieldValueStyled, TitleSectionStyled } from '..';
import Paper from '@/ui/components/atoms/Paper/Paper';
import { FarmerGet } from '../../../models/farmer';

type ProducerTabProps = {
  farmer: FarmerGet;
};

const ProducerTab: React.FC<ProducerTabProps> = (props: ProducerTabProps) => {
  const { farmer } = props;
  return (
    <>
      <Paper>
        <TitleSectionStyled>DATOS PRINCIPALES</TitleSectionStyled>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <CaptionStyled>Nombre</CaptionStyled>
            <FieldValueStyled>
              {farmer.first_name ?? '-'} {farmer.last_name ?? '-'}
            </FieldValueStyled>
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
            <CaptionStyled>Dirección</CaptionStyled>
            <FieldValueStyled>{farmer.address ?? '-'}</FieldValueStyled>
          </Grid>
        </Grid>
      </Paper>
      <Paper>
        <TitleSectionStyled>DATOS SECUNDARIOS</TitleSectionStyled>
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
    </>
  );
};

export default ProducerTab;
