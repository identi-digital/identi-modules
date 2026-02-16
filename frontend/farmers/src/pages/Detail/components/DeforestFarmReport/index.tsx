import React from 'react';
import IdentiLogo from '@ui/assets/img/identi_logo.png';
import { Box, Divider, styled, Typography } from '@mui/material';
import MapComponent from '@/ui/components/molecules/MapComponent/Map';
import './styles.css';
import {
  LOW_DEFORESTATION_RATE,
  MEDIUM_DEFORESTATION_RATE,
} from '@/core/config/environment';
import LegendDeforest from './LeyendDeforest';

const HeaderStyle = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: '8px',
  minHeight: '80px',
}));
const TableHeaderBox = styled(Box)(() => ({
  width: '33.33%',
  fontWeight: 500,
  color: '#595857',
}));
const TableItemBox = styled(Box)(() => ({
  width: '33.33%',
}));
// const IndicatorBox = styled(Box)(() => ({
//   width: '15px',
//   height: '15px',
//   borderRadius: '4px',
// }));

type FarmProps = {
  farm_id: string;
  farm_name: string;
  farm_ha: number;
  producer_id: string;
  producer_name: string;
  producer_dni: string;
  country: string;
  province: string;
  departamento: string;
  district: string;
  polygon: any;
  natural_forest_coverage: number;
  natural_forest_lost: number;
  date: string;
};

type DeforestFarmProps = {
  farm: FarmProps;
};

const DeforestFarm: React.FC<DeforestFarmProps> = (
  props: DeforestFarmProps,
) => {
  const { farm } = props;
  // let value = 0;
  // if (
  //   !isNaN(farm.natural_forest_coverage) &&
  //   !isNaN(farm.natural_forest_lost) &&
  //   farm.natural_forest_coverage > 0
  // ) {
  //   value = (farm.natural_forest_lost / farm.natural_forest_coverage) * 100;
  // }
  let name = '';
  if (farm.natural_forest_lost === LOW_DEFORESTATION_RATE) {
    name = 'Baja';
  }
  if (
    farm.natural_forest_lost > LOW_DEFORESTATION_RATE &&
    farm.natural_forest_lost <= MEDIUM_DEFORESTATION_RATE
  ) {
    name = 'Media';
  }
  if (farm.natural_forest_lost > MEDIUM_DEFORESTATION_RATE) {
    name = 'Alta';
  }
  const indicators = [
    {
      name: 'Alta',
      reportLabel: 'Riesgo de deforestación Alto',
      color: '#EF4444',
      bgColor: '#FEE2E2',
      percent: 'N/A',
    },
    {
      name: 'Media',
      reportLabel: 'Riesgo de deforestación Medio',
      color: '#B45309',
      bgColor: '#FEF3C7',
      percent: 'N/A',
    },
    {
      name: 'Baja',
      reportLabel: 'Riesgo de deforestación Bajo',
      color: '#15803D',
      bgColor: '#DCFCE7',
      percent: 'N/A',
    },
  ];

  return (
    <Box mb={4}>
      {/* header */}
      <HeaderStyle>
        <Box>
          <Typography variant="h5">
            Informe de evaluación de deforestación
          </Typography>
        </Box>
        <Box>
          <img src={IdentiLogo} alt="logo" style={{ width: '100px' }} />
        </Box>
      </HeaderStyle>
      <Box mt={2}>
        <Typography
          variant="body1"
          sx={{ color: 'primary.main', fontWeight: 600 }}
        >
          Datos de origen
        </Typography>
        <Divider sx={{ borderWidth: '1px', borderColor: 'primary.main' }} />
      </Box>
      <Box display="flex" flexWrap="wrap">
        {[
          {
            label: 'Agricultor',
            value: farm.producer_name || '-',
            fontSize: '14px',
          },
          { label: 'DNI', value: farm.producer_dni || '-', fontSize: '14px' },
        ].map((item, index) => (
          <Box
            key={index}
            width={{ xs: '100%', sm: '33.33%' }}
            p={1}
            boxSizing="border-box"
          >
            <Typography variant="caption">{item.label}</Typography>
            <Typography
              fontSize={item.fontSize}
              fontWeight={600}
              color={'primary'}
            >
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box mt={2}>
        <Typography
          variant="body1"
          sx={{ color: 'primary.main', fontWeight: 600 }}
        >
          Detalle de parcela
        </Typography>
        <Divider sx={{ borderWidth: '1px', borderColor: 'primary.main' }} />
      </Box>
      <Box display="flex" flexWrap="wrap">
        {[
          { label: 'Parcela', value: farm.farm_name || '-', fontSize: '16px' },

          {
            label: 'Hectáreas totales',
            value: farm.farm_ha || 0,
            fontSize: '14px',
          },
          { label: 'Distrito', value: farm.district || '-', fontSize: '14px' },
          { label: 'Provincia', value: farm.province || '-', fontSize: '14px' },
          {
            label: 'Departamento',
            value: farm.departamento || '-',
            fontSize: '14px',
          },
          { label: 'País', value: farm.country || '-' },
          {
            label: 'Fecha de registro',
            value: farm.date || '-',
            fontSize: '14px',
          },
        ].map((item, index) => (
          <Box
            key={index}
            width={{ xs: '100%', sm: '33.33%' }}
            p={1}
            boxSizing="border-box"
          >
            <Typography variant="caption">{item.label}</Typography>
            <Typography
              fontSize={item.fontSize}
              fontWeight={600}
              color={'primary'}
            >
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box mt={2}>
        {/* aquí el mapa */}
        <MapComponent value={farm.polygon} zoom={16} />
      </Box>
      <Box
        mt={2}
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'space-between'}
      >
        <Box
          display={'flex'}
          flexDirection={'row'}
          p={1}
          sx={{
            backgroundColor: '#E4E4E4',
            borderRadius: '4px',
          }}
        >
          <TableHeaderBox>Riesgo de deforestación</TableHeaderBox>
          {/* <TableHeaderBox>Riesgo de perdida de bosque natural</TableHeaderBox> */}
          <TableHeaderBox>Área de bosque natural (Ha)</TableHeaderBox>
          <TableHeaderBox>Área deforestada (Ha)</TableHeaderBox>
        </Box>
        {indicators.map((item, index) => {
          if (name === item.name) {
            return (
              <Box
                key={index}
                display={'flex'}
                flexDirection={'row'}
                justifyContent={'center'}
                p={1}
              >
                <TableItemBox display={'flex'} alignItems={'flex-end'}>
                  <Box width={'55%'}>
                    {item.name}
                    {/* {`(${farm.natural_forest_lost.toFixed(2)} HA)`} */}
                  </Box>
                  {/* <IndicatorBox sx={{ backgroundColor: item.color }} /> */}
                </TableItemBox>
                <TableItemBox>
                  {farm.natural_forest_coverage.toFixed(2)}
                </TableItemBox>
                <TableItemBox>
                  {farm.natural_forest_lost.toFixed(2)}
                </TableItemBox>
                {/* <TableItemBox>{value.toFixed(2)} %</TableItemBox> */}
              </Box>
            );
          }
        })}
        <Typography
          color="GrayText"
          sx={{ fontSize: '0.7rem', marginTop: '8px' }}
          textAlign={'end'}
        >
          <em>*Información generada por Global Forest Watch</em>
        </Typography>
        <LegendDeforest showTitle={true} />

        <Box mt={2}>
          <Typography
            variant="body1"
            sx={{ color: 'primary.main', fontWeight: 600 }}
          >
            Conclusión del informe
          </Typography>
          <Divider sx={{ borderWidth: '1px', borderColor: 'primary.main' }} />
        </Box>
        <Box sx={{ marginTop: '8px', width: '100%' }}>
          {indicators.map((item, index) => {
            if (name === item.name) {
              return (
                <Box
                  key={index}
                  sx={{
                    padding: '8px',
                    width: '100%',
                    backgroundColor: item.bgColor,
                    borderRadius: '4px',
                  }}
                >
                  <Typography sx={{ fontSize: '0.9rem', color: '#595857' }}>
                    Según la ultima evaluación realizada el{' '}
                    <strong>2026</strong>, el productor{' '}
                    <strong>{farm.producer_name || '-'}</strong> (Parcela{' '}
                    <strong>{farm.farm_name || '-'}</strong>) registra{' '}
                    <strong>{farm.natural_forest_lost.toFixed(2)} ha</strong> de
                    área deforestada de un área total de{' '}
                    <strong>
                      {farm.natural_forest_coverage.toFixed(2)} ha
                    </strong>
                    . El predio se clasifica con{' '}
                    <strong>{item.reportLabel}</strong>, según los estándares de
                    evaluación vigentes.
                  </Typography>
                </Box>
              );
            }
            return null;
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default DeforestFarm;
