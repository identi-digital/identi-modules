import React from 'react';
import IdentiLogo from '@ui/assets/img/identi_logo.png';
import { Box, styled, Typography } from '@mui/material';
import MapComponent from '@/ui/components/molecules/MapComponent/Map';
import './styles.css';

const HeaderStyle = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: '8px',
  minHeight: '100px',
}));
const TableHeaderBox = styled(Box)(() => ({
  width: '33.33%',
  fontWeight: 600,
}));
const TableItemBox = styled(Box)(() => ({
  width: '33.33%',
}));
const IndicatorBox = styled(Box)(() => ({
  width: '15px',
  height: '15px',
  borderRadius: '4px',
}));

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
  let value = 0;
  if (
    !isNaN(farm.natural_forest_coverage) &&
    !isNaN(farm.natural_forest_lost) &&
    farm.natural_forest_coverage > 0
  ) {
    value = (farm.natural_forest_lost / farm.natural_forest_coverage) * 100;
  }
  let name = '';
  if (farm.natural_forest_lost === 0) {
    name = 'Baja';
  }
  if (farm.natural_forest_lost > 0 && farm.natural_forest_lost <= 0.2) {
    name = 'Media';
  }
  if (farm.natural_forest_lost > 0.2) {
    name = 'Alta';
  }
  const indicators = [
    {
      name: 'Alta',
      color: '#EF4444',
      percent: 'N/A',
    },
    {
      name: 'Media',
      color: '#B45309',
      percent: 'N/A',
    },
    {
      name: 'Baja',
      color: '#15803D',
      percent: 'N/A',
    },
  ];

  return (
    <Box mb={4}>
      {/* header */}
      <HeaderStyle>
        <Box>
          <Typography variant="h4">
            Informe de evaluación de deforestación
          </Typography>
        </Box>
        <Box>
          <img src={IdentiLogo} alt="logo" style={{ width: '100px' }} />
        </Box>
      </HeaderStyle>
      <Box display="flex" flexWrap="wrap">
        {[
          { label: 'Parcela', value: farm.farm_name || '-', fontSize: '16px' },
          {
            label: 'Agricultor',
            value: farm.producer_name || '-',
            fontSize: '14px',
          },
          { label: 'DNI', value: farm.producer_dni || '-', fontSize: '14px' },
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
            backgroundColor: '#E68C38',
            borderRadius: '4px',
          }}
        >
          <TableHeaderBox>Riesgo de perdida de bosque natural</TableHeaderBox>
          <TableHeaderBox>Área de bosque natural cubierto</TableHeaderBox>
          <TableHeaderBox>% Area de bosque natural perdido</TableHeaderBox>
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
                    {item.name} {`(${farm.natural_forest_lost.toFixed(2)} HA)`}
                  </Box>
                  <IndicatorBox sx={{ backgroundColor: item.color }} />
                </TableItemBox>
                <TableItemBox>
                  {farm.natural_forest_coverage.toFixed(2)} HA
                </TableItemBox>
                <TableItemBox>{value.toFixed(2)} %</TableItemBox>
              </Box>
            );
          }
          return (
            <Box key={index} display={'flex'} flexDirection={'row'} p={1}>
              <TableItemBox display={'flex'} alignItems={'flex-end'}>
                <Box width={'55%'}>{item.name}</Box>
                <IndicatorBox sx={{ backgroundColor: item.color }} />
              </TableItemBox>
              <TableItemBox>0 HA</TableItemBox>
              <TableItemBox>{item.percent}</TableItemBox>
            </Box>
          );
        })}
        <Typography
          color="GrayText"
          sx={{ fontSize: '0.7rem', marginTop: '8px' }}
          textAlign={'end'}
        >
          <em>*Información generada por Global Forest Watch</em>
        </Typography>
        <Box sx={{ padding: '8px', width: '100%', marginTop: '16px' }}>
          <Typography color="GrayText" sx={{ fontSize: '0.7rem' }}>
            <strong>Cobertura y pérdida de bosque natural</strong>
          </Typography>
          <Typography color="GrayText" sx={{ fontSize: '0.7rem' }}>
            Bosque natural cubierto: superficie actual de bosque natural
            presente en la parcela.
          </Typography>
          <Typography color="GrayText" sx={{ fontSize: '0.7rem' }}>
            Riesgo de bosque natural perdido: superficie que ha sido deforestada
            respecto al total original.
          </Typography>
          <Typography color="GrayText" sx={{ fontSize: '0.7rem' }}>
            Riesgo de bosque natural perdido (%): proporción del bosque original
            que ha sido perdido, expresada como porcentaje.
          </Typography>

          <Typography
            color="GrayText"
            sx={{ fontSize: '0.7rem', marginTop: '16px' }}
          >
            <strong>Estado de deforestación:</strong>
          </Typography>
          <Typography color="GrayText" sx={{ fontSize: '0.7rem' }}>
            🟩 Sin riesgo de pérdida de bosque natural (0 ha)
          </Typography>
          <Typography color="GrayText" sx={{ fontSize: '0.7rem' }}>
            🟨 Riesgo de pérdida leve de bosque natural (entre 0.01 ha y 0.2 ha)
          </Typography>
          <Typography color="GrayText" sx={{ fontSize: '0.7rem' }}>
            🟥 Riesgo de pérdida significativa de bosque natural (más de 0.2 ha)
          </Typography>
        </Box>
        {/* <Box display={'flex'} flexDirection={'row'} p={1}>
          <TableHeaderBox>Alta </TableHeaderBox>
          <TableItemBox>0 HA</TableItemBox>
          <TableItemBox>N/A</TableItemBox>
        </Box>
        <Box display={'flex'} flexDirection={'row'} p={1}>
          <TableHeaderBox>Media </TableHeaderBox>
          <TableItemBox>0 HA</TableItemBox>
          <TableItemBox>N/A</TableItemBox>
        </Box>
        <Box display={'flex'} flexDirection={'row'} p={1}>
          <TableHeaderBox>Baja </TableHeaderBox>
          <TableItemBox>{farm.farm_ha} HA</TableItemBox>
          <TableItemBox>100 %</TableItemBox>
        </Box> */}
      </Box>
    </Box>
  );
};

export default DeforestFarm;
