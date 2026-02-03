import React, { useCallback, useRef, useState } from 'react';
import Button from '@/ui/components/atoms/Button/Button';
import Dialog from '@/ui/components/molecules/Dialog/Dialog';
import MapComponent from '@/ui/components/molecules/MapComponent/Map';
import { Close } from '@mui/icons-material';
import { Box, Card, Grid, IconButton, Typography } from '@mui/material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import DeforestFarm from './DeforestFarmReport';
import { FarmGet } from '../../../models/farm';
import { FarmerGet } from '../../../models/farmer';
import UploadGeoFile from './UploadGeoFile';
import { showMessage } from '@/ui/utils/Messages';

const DEFAULT_GEOJSON: any = {
  type: 'FeatureCollection',
  features: [],
};

type PolygonDialogProps = {
  handleCloseDialog: () => void;
  farm_name: string;
  farm: FarmGet;
  farmer: FarmerGet;
  open: boolean;
  handleOnUploadFile: (data: any, farm: any) => void;
};

const getTextDeforestValue = (
  coverage_value: number,
  loss_value: number,
  complete?: boolean,
): string | null => {
  let value = 0;
  if (!isNaN(coverage_value) && !isNaN(loss_value) && coverage_value > 0) {
    // porcentaje de bosque natural perdido
    value = (loss_value / coverage_value) * 100;
  }
  const newValue = value.toFixed(2);
  const loss = loss_value.toFixed(2);
  if (complete) {
    return `Riesgo de bosque natural perdido: ${loss} ha (${newValue}%)`;
  }
  return `Riesgo de bosque natural perdido (${newValue}%)`;
};

const renderGFWStatus = (coverage_value: number, loss_value: number) => {
  if (coverage_value === null || loss_value === null) return null;

  const obj = {
    text: <>{getTextDeforestValue(coverage_value, loss_value, true)}</>,
    color: '',
    bgColor: '',
  };
  // const newValue = value.toFixed(2);
  if (loss_value === 0) {
    obj.color = '#15803D';
    obj.bgColor = '#DCFCE7';
  }
  if (loss_value > 0 && loss_value <= 0.2) {
    obj.color = '#B45309';
    obj.bgColor = '#FEF3C7';
  }
  if (loss_value > 0.2) {
    obj.color = '#EF4444';
    obj.bgColor = '#FEE2E2';
  }

  return (
    // <DeforestTooltip coverage_value={coverage_value} loss_value={loss_value}>
    <Card elevation={4} sx={{ padding: '8px', width: '100%' }}>
      <Typography color="GrayText" sx={{ fontSize: '0.8rem' }}>
        Bosque natural cubierto ({(coverage_value || 0).toFixed(2)} ha)
      </Typography>
      <Box
        sx={{
          color: obj.color,
          fontSize: '0.8rem',
          fontWeight: 600,
          // paddingBlock: '6px'
        }}
      >
        {obj.text}
      </Box>
      <Typography
        color="GrayText"
        sx={{ fontSize: '0.7rem', marginTop: '8px' }}
      >
        <em>*Información generada por Global Forest Watch</em>
      </Typography>
    </Card>
    // </DeforestTooltip>
  );
};

const PolygonDialog: React.FC<PolygonDialogProps> = (
  props: PolygonDialogProps,
) => {
  const {
    farm_name,
    handleCloseDialog,
    farm,
    open,
    farmer,
    handleOnUploadFile,
  } = props;
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const componentRef = useRef<HTMLDivElement>(null);
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const _downloadGeoJson = useCallback(() => {
    const polygon = farm?.geometry;
    if (!polygon) return;
    setIsDownloading(true);
    const blob = new Blob([JSON.stringify(polygon, null, 2)], {
      type: 'application/geo+json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'polygon.geojson';
    a.click();
    URL.revokeObjectURL(url);
    setIsDownloading(false);
  }, [farm]);

  const handleDownloadPDF = useCallback(async () => {
    if (!componentRef.current) return;
    try {
      setIsLoadingReport(true);
      const canvas = await html2canvas(componentRef.current, {
        useCORS: true,
        scale: 2,
      });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm

      // Convert canvas dimensions from px to mm (1 px = 0.264583 mm)
      const imgProps = {
        width: canvas.width * 0.264583,
        height: canvas.height * 0.264583,
      };

      // Auto scale image to fit in A4
      const ratio = Math.min(
        pageWidth / imgProps.width,
        pageHeight / imgProps.height,
      );
      const width = imgProps.width * ratio;
      const height = imgProps.height * ratio;

      const x = (pageWidth - width) / 2;
      const y = 10; // top margin

      pdf.addImage(imgData, 'PNG', x, y, width, height);
      const name = farm?.name ?? '';
      pdf.save(`informe_deforestación_${name ?? ''}.pdf`);
    } catch (error) {
      showMessage('', 'No se ha podido generar el informe', 'error');
    } finally {
      setIsLoadingReport(false);
    }
  }, [farm]);

  return (
    <Dialog
      open={open}
      title={
        <>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
            }}
          >
            <Box display={'flex'} justifyContent={'space-between'}>
              <Typography variant="h6" color="primary.main">
                Polígono
              </Typography>
              <IconButton size="small" onClick={() => handleCloseDialog()}>
                <Close />
              </IconButton>
            </Box>
            <Box>
              <Typography variant="body1" color="primary.main">
                {farm_name ?? 'Parcela'}
              </Typography>
            </Box>
          </Box>
        </>
      }
      onClose={() => handleCloseDialog()}
      maxWidth="md"
      //   sx={{
      //     '& .MuiDialog-container': {
      //       '& .MuiPaper-root': {
      //         width: '100%',
      //         maxWidth: '600px', // Set your width here
      //       },
      //     },
      //   }}
      hideActions
    >
      <Grid container={true} spacing={1}>
        <Grid size={4}>
          <Box sx={{ height: 380 }}>
            <MapComponent
              value={
                farm.geometry ?? {
                  type: 'FeatureCollection',
                  features: [],
                }
              }
            />
          </Box>
          <Box>
            <Box mt={2}>{renderGFWStatus(0.55, 0.1)}</Box>
          </Box>
        </Grid>
        <Grid size={8}>
          <Box sx={{ padding: '16px', width: '100%', marginTop: '16px' }}>
            <Typography color="GrayText" sx={{ fontSize: '0.7rem' }}>
              <strong>Cobertura y pérdida de bosque natural</strong>
            </Typography>
            <Typography color="GrayText" sx={{ fontSize: '0.7rem' }}>
              Bosque natural cubierto: superficie actual de bosque natural
              presente en la parcela.
            </Typography>
            <Typography color="GrayText" sx={{ fontSize: '0.7rem' }}>
              Riesgo de bosque natural perdido: superficie que ha sido
              deforestada respecto al total original.
            </Typography>
            <Typography color="GrayText" sx={{ fontSize: '0.7rem' }}>
              Riesgo de bosque natural perdido (%): proporción del bosque
              original que ha sido perdido, expresada como porcentaje.
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
              🟨 Riesgo de pérdida leve de bosque natural (entre 0.01 ha y 0.2
              ha)
            </Typography>
            <Typography color="GrayText" sx={{ fontSize: '0.7rem' }}>
              🟥 Riesgo de pérdida significativa de bosque natural (más de 0.2
              ha)
            </Typography>
          </Box>
          <Box display={'flex'} flexDirection={'column'}>
            <Box display={'flex'}>
              <Button
                text="Descargar polígono"
                variant="outlined"
                onClick={_downloadGeoJson}
                color="primary"
                isLoading={isDownloading}
                disabled={isDownloading}
                margin
              />
              <Button
                text="Reporte de deforestación"
                variant="outlined"
                onClick={handleDownloadPDF}
                color="primary"
                isLoading={isLoadingReport}
                disabled={isLoadingReport}
                margin
              />
            </Box>
            <Box ml={1}>
              <UploadGeoFile
                text="Subir polígono"
                handleOnUploadFile={handleOnUploadFile}
                farm={farm}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Box
        ref={componentRef}
        sx={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
        }}
      >
        <Grid size={12} px={2}>
          <DeforestFarm
            farm={{
              farm_id: farm?.id ?? '',
              farm_name: farm?.name ?? '',
              farm_ha: farm?.total_area || 0,
              producer_id: farmer?.id ?? '',
              producer_name: `${farmer?.first_name ?? ''} ${farmer?.last_name ??
                ''}`,
              producer_dni: farmer?.dni ?? '',
              country: farm?.country?.name ?? '',
              province: farm?.province?.name ?? '',
              departamento: farm?.department?.name ?? '',
              district: farm?.district?.name ?? '',
              polygon: farm?.geometry ?? DEFAULT_GEOJSON,
              natural_forest_coverage: 0,
              natural_forest_lost: 0,
              date: new Date(farm?.created_at ?? '').toLocaleDateString(
                'es-ES',
              ),
            }}
          />
        </Grid>
      </Box>
    </Dialog>
  );
};

export default PolygonDialog;
