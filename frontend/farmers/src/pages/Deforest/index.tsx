import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ModuleConfig } from '@/core/moduleLoader';
import Button from '@/ui/components/atoms/Button/Button';
import FilterComponent from '@/ui/components/molecules/FilterComponent';
import DataTable from '@/ui/components/organisms/DataTable/ServerSide/DataTable';
import {
  Box,
  Divider,
  Grid,
  IconButton,
  styled,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { TableHeadColumn } from '@/ui/components/molecules/TableHead/TableHead';
import { AxiosResponse } from 'axios';
import useDebounce from '@/ui/hooks/use_debounce';
// import { FarmerService } from '../../services/farmer';
import {
  // CheckCircle,
  CheckCircleOutline,
  Download,
  InfoOutline,
  NotInterestedOutlined,
  Refresh,
  Visibility,
} from '@mui/icons-material';
import Paper from '@/ui/components/atoms/Paper/Paper';
import { DeforestService } from '../../services/deforest';
import {
  DeforestMetrics,
  DeforestMetricsFarm,
  DeforestMetricsFarmer,
} from '../../models/deforest';
import { saveAs } from '@/ui/utils/dowloadExcel';
import { showMessage } from '@/ui/utils/Messages';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import DeforestFarm from '../Detail/components/DeforestFarmReport';
import ReportDialog from './components/ReportDialog';

const DEFAULT_GEOJSON: any = {
  type: 'FeatureCollection',
  features: [],
};

const TitleStyle = styled(Typography)(({ theme }) => ({
  fontWeight: 400,
  fontSize: '16px',
  color: theme.palette.secondary.main,
  marginBottom: '8px',
}));
const SubTitleStyle = styled(Typography)(() => ({
  fontWeight: 400,
  fontSize: '16px',
  color: '#595857',
  display: 'flex',
}));
const NumberStyle = styled(Typography)(() => ({
  fontWeight: 400,
  fontSize: '20px',
  color: '#060403',
  marginRight: '16px',
}));
interface FarmersListProps {
  config?: ModuleConfig;
}

function DeforestPage({ config }: FarmersListProps) {
  const theme = useTheme();
  const isActiveDesktop = useMediaQuery(theme.breakpoints.down('md'));
  const [statusSelected, setStatusSelected] = useState<any>('baja/nula');
  const [isRefresh, setIsRefresh] = useState<boolean>(true);
  const [headers, setHeaders] = useState<TableHeadColumn[]>([]);
  const [search, setSearch] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const textDebounce = useDebounce(search, 500);
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);
  const [deforestMetrics, setDeforestMetrics] = useState<DeforestMetrics>({
    farm_georefrence_count: 0,
    farm_georefrence_coverage: 0,
    farm_wh_georefeence_count: 0,
    farm_wh_georefeence_coverage: 0,
  });
  const [deforestMetricsFarmer, setDeforestMetricsFarmer] = useState<
    DeforestMetricsFarmer
  >({
    baja_nula: {
      count: 0,
      percentage: 0,
    },
    critica: {
      count: 0,
      percentage: 0,
    },
    parcial: {
      count: 0,
      percentage: 0,
    },
    total_farmers_evaluated: 0,
  });
  const [deforestMetricsFarm, setDeforestMetricsFarm] = useState<
    DeforestMetricsFarm
  >({
    baja_nula: {
      count: 0,
      percentage: 0,
    },
    critica: {
      count: 0,
      percentage: 0,
    },
    parcial: {
      count: 0,
      percentage: 0,
    },
    total_farms_evaluated: 0,
    total_hectares_evaluated: 0,
  });

  const componentRef = useRef<HTMLDivElement>(null);
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [dataSelected, setDataSelected] = useState<any>(null);

  const handleCloseDialog = () => {
    setIsOpenDialog((prev: boolean) => !prev);
  };

  const onLoad = useCallback(
    async (
      page: number,
      perPage: number,
      _sortBy: string,
      _order: string,
      _search: string,
    ): Promise<AxiosResponse<any>> => {
      let orderBy = 'created_at';
      let sort = 'desc';
      const data = await DeforestService.paginateFarmsDeforest(
        page,
        perPage,
        statusSelected,
        sort,
        orderBy,
        textDebounce,
      );
      // const data = await api.get('/forms');
      console.log(data);
      return {
        data: {
          data: {
            items: data.items || [],
            total: data.total,
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
    },
    [textDebounce, statusSelected],
  );

  const _handleGetDeforestMetrics = useCallback(async () => {
    try {
      const resp = await DeforestService.getGeoreferenceMetrics();
      if (resp) {
        setDeforestMetrics(resp);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const _handleGetDeforestMetricsFarmer = useCallback(async () => {
    try {
      const resp = await DeforestService.getFarmerMetrics();
      if (resp) {
        setDeforestMetricsFarmer(resp);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const _handleGetDeforestMetricsFarm = useCallback(async () => {
    try {
      const resp = await DeforestService.getFarmsMetrics();
      if (resp) {
        setDeforestMetricsFarm(resp);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleDownloadData = useCallback(async () => {
    setIsDownloading(true);
    await DeforestService.getFarmsDeforestExport()
      .then((resp: any) => {
        if (resp) {
          const disposition = resp.headers['content-disposition'];
          let filename = 'export.xlsx';
          if (disposition) {
            const match = disposition.match(/filename="?(.+)"?/);
            if (match?.[1]) {
              filename = match[1];
            }
          }
          saveAs(resp.data, filename);
        }
      })
      .catch(() => {
        showMessage('', 'Problemas al exportar los registros', 'error', true);
      })
      .finally(() => {
        setIsDownloading(false);
      });
  }, []);

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
      const name = dataSelected?.code ?? '';
      pdf.save(`informe_deforestación_${name ?? ''}.pdf`);
    } catch (error) {
      showMessage('', 'No se ha podido generar el informe', 'error');
    } finally {
      setIsLoadingReport(false);
    }
  }, [dataSelected]);

  useEffect(() => {
    const _setHeaders: any = [
      {
        sorteable: false,
        align: 'left',
        text: 'Código de parcela',
        value: 'code',
        padding: 'none',
        render: (row: any) => <>{row?.code ?? ''}</>,
      },
      {
        sorteable: false,
        align: 'left',
        text: 'Productor',
        value: 'farmer',
        padding: 'none',
        render: (row: any) => (
          <>{`${row?.farmer?.first_name ?? ''} ${row?.farmer?.last_name ??
            ''}`}</>
        ),
      },
      {
        sorteable: false,
        align: 'left',
        text: 'Distrito',
        value: 'district_description',
        padding: 'none',
        render: (row: any) => <>{row?.district_description ?? ''}</>,
      },
      {
        sorteable: false,
        align: 'left',
        text: 'Estado de deforestación',
        value: 'state_deforesting',
        padding: 'none',
        render: (row: any) => <>{row?.state_deforesting ?? ''}</>,
      },

      {
        sorteable: false,
        align: 'center',
        text: 'Acción',
        value: '',
        render: (row: any) => {
          return (
            <>
              <Box display="flex" flexDirection="row" justifyContent="center">
                <Tooltip title="Ver reporte">
                  <IconButton
                    onClick={() => {
                      setDataSelected(row);
                      handleCloseDialog();
                    }}
                    size="small"
                  >
                    <Visibility />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Descargar">
                  <IconButton
                    onClick={() => {
                      setDataSelected(row);
                      handleDownloadPDF();
                    }}
                    size="small"
                    //   variant="contained"
                    // color="error"
                    //   style={{ width: '140px', height: '30px' }}
                    //   startIcon={<Delete />}
                  >
                    <Download />
                  </IconButton>
                </Tooltip>
              </Box>
            </>
          );
        },
      },
    ];
    setHeaders(_setHeaders);
  }, []);

  useEffect(() => {
    _handleGetDeforestMetrics();
    _handleGetDeforestMetricsFarmer();
    _handleGetDeforestMetricsFarm();
  }, []);

  return (
    <>
      {/* <Grid
        size={12}
        sx={{
          display: 'flex',
          flexDirection: isActiveDesktop ? 'column' : 'row',
          justifyContent: 'flex-end',
        }}
      >
      </Grid> */}
      <Grid container={true} spacing={2}>
        <Grid size={12}>
          <Paper elevation={2} sx={{ padding: '16px', marginTop: '10px' }}>
            <TitleStyle>Estado de georreferencia</TitleStyle>
            <Divider />
            <Grid container spacing={2} mt={2}>
              <Grid size={4}>
                <SubTitleStyle>
                  Parcelas con georreferencia{' '}
                  <CheckCircleOutline color="success" />
                </SubTitleStyle>
                <Box display={'flex'}>
                  <NumberStyle>
                    {deforestMetrics.farm_georefrence_count}
                  </NumberStyle>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ marginRight: '8px' }}
                  />
                  <NumberStyle>
                    {deforestMetrics.farm_georefrence_coverage.toFixed(0)}%
                  </NumberStyle>
                </Box>
              </Grid>
              <Grid size={2}>{/* <Divider orientation="vertical" /> */}</Grid>
              <Grid size={6}>
                <SubTitleStyle>
                  Parcelas sin georreferencia <InfoOutline color="warning" />
                </SubTitleStyle>
                <Box display={'flex'}>
                  <NumberStyle>
                    {deforestMetrics.farm_wh_georefeence_count}
                  </NumberStyle>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ marginRight: '8px' }}
                  />
                  <NumberStyle>
                    {deforestMetrics.farm_wh_georefeence_coverage.toFixed(0)}%
                  </NumberStyle>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ padding: '16px', marginTop: '10px' }}>
            <TitleStyle>Deforestación por hectáreas</TitleStyle>
            <Divider />
            <Grid size={12} marginY={2}>
              <NumberStyle>
                {deforestMetricsFarm.total_hectares_evaluated}
              </NumberStyle>
              <SubTitleStyle>Total de hectáreas evaluadas</SubTitleStyle>
            </Grid>
            <Divider />
            <Grid size={12} marginY={2}>
              <SubTitleStyle>
                Deforestación baja/nula <CheckCircleOutline color="success" />
              </SubTitleStyle>
              <Box display={'flex'}>
                <NumberStyle>{deforestMetricsFarm.baja_nula.count}</NumberStyle>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ marginRight: '8px' }}
                />
                <NumberStyle>
                  {deforestMetricsFarm.baja_nula.percentage.toFixed(0)}%
                </NumberStyle>
              </Box>
            </Grid>
            <Divider />
            <Grid container spacing={2} mt={2}>
              <Grid size={4}>
                <SubTitleStyle>
                  Deforestación parcial <InfoOutline color="warning" />
                </SubTitleStyle>
                <Box display={'flex'}>
                  <NumberStyle>{deforestMetricsFarm.parcial.count}</NumberStyle>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ marginRight: '8px' }}
                  />
                  <NumberStyle>
                    {deforestMetricsFarm.parcial.percentage.toFixed(0)}%
                  </NumberStyle>
                </Box>
              </Grid>
              <Grid size={2}>
                <Divider orientation="vertical" />
              </Grid>
              <Grid size={6}>
                <SubTitleStyle>
                  Deforestación crítica <NotInterestedOutlined color="error" />
                </SubTitleStyle>
                <Box display={'flex'}>
                  <NumberStyle>{deforestMetricsFarm.critica.count}</NumberStyle>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ marginRight: '8px' }}
                  />
                  <NumberStyle>
                    {deforestMetricsFarm.critica.percentage.toFixed(0)}%
                  </NumberStyle>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ padding: '16px', marginTop: '10px' }}>
            <TitleStyle>Deforestación por productores</TitleStyle>
            <Divider />
            <Grid size={12} marginY={2}>
              <NumberStyle>
                {deforestMetricsFarmer.total_farmers_evaluated}
              </NumberStyle>
              <SubTitleStyle>Total de productores evaluados</SubTitleStyle>
            </Grid>
            <Divider />
            <Grid size={12} marginY={2}>
              <SubTitleStyle>
                Deforestación baja/nula <CheckCircleOutline color="success" />
              </SubTitleStyle>
              <Box display={'flex'}>
                <NumberStyle>
                  {deforestMetricsFarmer.baja_nula.count}
                </NumberStyle>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ marginRight: '8px' }}
                />
                <NumberStyle>
                  {deforestMetricsFarmer.baja_nula.percentage.toFixed(0)}%
                </NumberStyle>
              </Box>
            </Grid>
            <Divider />
            <Grid container spacing={2} mt={2}>
              <Grid size={4}>
                <SubTitleStyle>
                  Deforestación parcial <InfoOutline color="warning" />
                </SubTitleStyle>
                <Box display={'flex'}>
                  <NumberStyle>
                    {deforestMetricsFarmer.parcial.count}
                  </NumberStyle>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ marginRight: '8px' }}
                  />
                  <NumberStyle>
                    {deforestMetricsFarmer.parcial.percentage.toFixed(0)}%
                  </NumberStyle>
                </Box>
              </Grid>
              <Grid size={2}>
                <Divider orientation="vertical" />
              </Grid>
              <Grid size={6}>
                <SubTitleStyle>
                  Deforestación crítica <NotInterestedOutlined color="error" />
                </SubTitleStyle>
                <Box display={'flex'}>
                  <NumberStyle>
                    {deforestMetricsFarmer.critica.count}
                  </NumberStyle>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ marginRight: '8px' }}
                  />
                  <NumberStyle>
                    {deforestMetricsFarmer.critica.percentage.toFixed(0)}%
                  </NumberStyle>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <Grid
        size={12}
        sx={{
          display: 'flex',
          flexDirection: isActiveDesktop ? 'column' : 'row',
          justifyContent: 'flex-end',
        }}
      >
        <Box width={'100%'}>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            style={
              isActiveDesktop ? { padding: '6px' } : { marginRight: '10px' }
            }
            sx={{ flexDirection: { xs: 'column', sm: 'row' } }}
          >
            <FilterComponent
              buttonLabel={'Estado de deforestación'}
              options={['baja/nula', 'parcial', 'crítica']}
              labelSelected={statusSelected}
              color="primary"
              onSelectOption={function(value: string): void {
                setStatusSelected(value);
              }}
            />
            <Box display={'flex'}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => setIsRefresh((prev: boolean) => !prev)}
                fullWidth
                // sx={{
                //   width: '180px',
                // }}
                text="Actualizar estado"
                color="primary"
              />
              <Button
                variant="contained"
                onClick={() => handleDownloadData()}
                fullWidth
                isLoading={isDownloading}
                disabled={isDownloading}
                sx={{
                  //   width: '180px',
                  marginLeft: '16px',
                }}
                text="Descargar información"
                color="secondary"
              />
            </Box>
          </Box>
        </Box>
      </Grid>

      <DataTable
        headers={headers}
        refresh={isRefresh}
        hideSearch={true}
        onLoad={onLoad}
      />

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
              farm_id: dataSelected?.id ?? '',
              farm_name: dataSelected?.code ?? '',
              farm_ha: dataSelected?.total_area || 0,
              producer_id: dataSelected?.farmer?.id ?? '',
              producer_name: `${dataSelected?.farmer?.first_name ??
                ''} ${dataSelected?.farmer?.last_name ?? ''}`,
              producer_dni: dataSelected?.farmer?.dni ?? '',
              country: dataSelected?.country?.description ?? '',
              province: dataSelected?.province?.description ?? '',
              departamento: dataSelected?.department?.description ?? '',
              district: dataSelected?.district?.description ?? '',
              polygon: dataSelected?.geometry ?? DEFAULT_GEOJSON,
              natural_forest_coverage: 0,
              natural_forest_lost: dataSelected?.natural_forest_loss_ha ?? 0,
              date: new Date(dataSelected?.created_at ?? '').toLocaleDateString(
                'es-ES',
              ),
            }}
          />
        </Grid>
      </Box>

      <ReportDialog open={isOpenDialog} handleClose={handleCloseDialog}>
        <DeforestFarm
          farm={{
            farm_id: dataSelected?.id ?? '',
            farm_name: dataSelected?.code ?? '',
            farm_ha: dataSelected?.total_area || 0,
            producer_id: dataSelected?.farmer?.id ?? '',
            producer_name: `${dataSelected?.farmer?.first_name ??
              ''} ${dataSelected?.farmer?.last_name ?? ''}`,
            producer_dni: dataSelected?.farmer?.dni ?? '',
            country: dataSelected?.country?.description ?? '',
            province: dataSelected?.province?.description ?? '',
            departamento: dataSelected?.department?.description ?? '',
            district: dataSelected?.district?.description ?? '',
            polygon: dataSelected?.geometry ?? DEFAULT_GEOJSON,
            natural_forest_coverage: 0,
            natural_forest_lost: dataSelected?.natural_forest_loss_ha ?? 0,
            date: new Date(dataSelected?.created_at ?? '').toLocaleDateString(
              'es-ES',
            ),
          }}
        />
      </ReportDialog>
    </>
  );
}

export default DeforestPage;
