import { Box, Divider, Typography } from '@mui/material';
import React from 'react';

type LegendDeforestProps = {
  showTitle?: boolean;
};

const LegendDeforest: React.FC<LegendDeforestProps> = (
  props: LegendDeforestProps,
) => {
  const { showTitle = true } = props;
  return (
    <>
      {showTitle && (
        <Box mt={2}>
          <Typography
            variant="body2"
            sx={{ color: 'primary.main', fontWeight: 600 }}
          >
            Leyenda estado de deforestación
          </Typography>
          <Divider sx={{ borderWidth: '1px', borderColor: 'primary.main' }} />
        </Box>
      )}

      <Box mt={1} sx={{ padding: '8px', width: '100%' }}>
        <Typography sx={{ fontSize: '0.7rem' }}>
          <strong>Riesgo bajo: </strong>Baja probabilidad de ser observado según
          el cumplimiento de la normativa de la UE.
        </Typography>
        <Typography sx={{ fontSize: '0.7rem' }}>
          <strong>Riesgo medio: </strong>Se recomiendan acciones complementarias
          de análisis de deforestación para contrastar resultados.
        </Typography>
        <Typography sx={{ fontSize: '0.7rem' }}>
          <strong>Riesgo alto: </strong>Alta probabilidad de ser observado por
          la UE durante el proceso de exportación.
        </Typography>
      </Box>
    </>
  );
};

export default LegendDeforest;
