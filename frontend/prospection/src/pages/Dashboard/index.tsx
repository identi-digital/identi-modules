import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  // Button,
  Avatar,
  TextField,
  MenuItem,
  Tab,
  Tabs,
  // Stack,
} from '@mui/material';
import {
  // FilterAlt as FilterIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { ProspectionService } from '../../services/prospection';
import { showMessage } from '@/ui/utils/Messages';
import MapComponent from '@/ui/components/molecules/MapComponent/Map';

interface ProspectionMetrics {
  prospection_count: number;
  suivis_count: number;
  suivis_pct: number;
  visit_field_count: number;
  visit_pct: number;
}

const DashboardPage = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [metrics, setMetrics] = useState<ProspectionMetrics | null>(null);
  const [featureCollection, setFeatureCollection] = useState<any>(null);
  // --- MOCK DATA ---
  const [forms] = useState<string[]>([
    'Prospecciones',
    'Visitas',
    'Seguimientos',
  ]);
  const [form, setForm] = useState<string>('Prospecciones');
  // const regions = ['San Martín', 'Ucayali', 'Huánuco'];

  //   const prospectRecords = [
  //     {
  //       id: 1,
  //       lat: -8.3435,
  //       lng: -76.3123,
  //       producer: 'Ernesto Perez',
  //       region: 'San Martín',
  //       status: 'Visitado',
  //       date: '2024-05-10',
  //     },
  //     {
  //       id: 2,
  //       lat: -8.4512,
  //       lng: -76.4201,
  //       producer: 'Lucía Méndez',
  //       region: 'Ucayali',
  //       status: 'En Proceso',
  //       date: '2024-05-11',
  //     },
  //     {
  //       id: 3,
  //       lat: -8.3398,
  //       lng: -76.6055,
  //       producer: 'Jorge Rojas',
  //       region: 'San Martín',
  //       status: 'Pendiente',
  //       date: '2024-05-12',
  //     },
  //   ];

  const loadData = useCallback(async () => {
    try {
      const metrics = await ProspectionService.getMetrics();
      console.log('Métricas de Prospección:', metrics);
      setMetrics(metrics);
    } catch (error) {
      showMessage('', 'Error al cargar métricas de prospección', 'error');
    }
  }, []);

  function buildFeatureCollection(data: any[]) {
    const features: any[] = [];

    data.forEach((group: any) => {
      group.forEach((field: any) => {
        if (field.type_value === 'geojson' && field.value) {
          try {
            const parsed =
              typeof field.value === 'string'
                ? JSON.parse(field.value)
                : field.value;

            // Si ya es Feature
            if (parsed.type === 'Feature') {
              features.push(parsed);
            }

            // Si es solo geometry
            if (
              parsed.type === 'Point' ||
              parsed.type === 'Polygon' ||
              parsed.type === 'LineString'
            ) {
              features.push({
                type: 'Feature',
                geometry: parsed,
                properties: {},
              });
            }
          } catch (error) {
            console.warn('GeoJSON inválido:', field.value);
          }
        }
      });
    });

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  const loadPolygons = useCallback(async () => {
    try {
      setFeatureCollection(null);
      if (!form) return;
      let id = 'f0b565fd-ac9a-45c0-b263-e1ee57376d6e';
      if (form === 'Prospecciones') {
        id = '4dfb8bb2-4bab-4462-9f5a-3fdba3e624a6';
      }
      if (form === 'Visitas') {
        id = 'f0b565fd-ac9a-45c0-b263-e1ee57376d6e';
      }
      if (form === 'Seguimientos') {
        id = '7dc4cc1d-4c5c-44c1-a316-84734cb7a65b';
      }
      const polygons = await ProspectionService.getPolygonsByFormId(id);

      const featureCollection = buildFeatureCollection(polygons);
      setFeatureCollection(featureCollection);
      console.log(featureCollection);
    } catch (error) {
      console.log(error);
    }
  }, [form]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadPolygons();
  }, [form]);

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* <Typography variant="h5" fontWeight={800}>
          Prospección
        </Typography> */}
        <Tabs value={currentView} onChange={(_e, v) => setCurrentView(v)}>
          <Tab value="dashboard" label="Resumen" />
          <Tab value="mapa" label="Mapa de Campo" />
        </Tabs>
      </Box>
      {currentView === 'dashboard' ? (
        <Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent
                  sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                >
                  <Avatar sx={{ bgcolor: '#eff6ff', color: '#2563eb' }}>
                    <AssignmentIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="bold"
                    >
                      PROSPECCIONES
                    </Typography>
                    <Typography variant="h4" fontWeight={800}>
                      {metrics ? metrics.prospection_count : '...'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent
                  sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                >
                  <Avatar sx={{ bgcolor: '#fff7ed', color: '#ea580c' }}>
                    <LocationIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="bold"
                    >
                      VISITAS DE PARCELA
                    </Typography>
                    <Typography variant="h4" fontWeight={800}>
                      {metrics ? metrics.visit_field_count : '...'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent
                  sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                >
                  <Avatar sx={{ bgcolor: '#f0fdf4', color: '#16a34a' }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="bold"
                    >
                      SEGUIMIENTO
                    </Typography>
                    <Typography variant="h4" fontWeight={800}>
                      {metrics ? metrics.suivis_count : '...'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card variant="outlined" sx={{ borderRadius: 4, p: 4 }}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}
            >
              <TrendingUpIcon fontSize="small" color="primary" /> Funnel de
              Conversión de Créditos
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: '80%',
                  bgcolor: '#3b82f6',
                  color: 'white',
                  p: 2,
                  borderRadius: 1.5,
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  Prospección Cliente (100%)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ position: 'absolute', right: -100, color: '#666' }}
                >
                  {metrics ? metrics.prospection_count : '...'} leads
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '70%',
                  bgcolor: '#60a5fa',
                  color: 'white',
                  p: 2,
                  borderRadius: 1.5,
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  Visita de Parcela ({metrics ? metrics.visit_pct : '...'}%)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ position: 'absolute', right: -100, color: '#666' }}
                >
                  {metrics ? metrics.visit_field_count : '...'} visitas
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '60%',
                  bgcolor: '#93c5fd',
                  color: 'white',
                  p: 2,
                  borderRadius: 1.5,
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  Seguimiento y Docs ({metrics ? metrics.suivis_pct : '...'}%)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ position: 'absolute', right: -100, color: '#666' }}
                >
                  {metrics ? metrics.suivis_count : '...'} en proceso
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2} sx={{ mt: 6, textAlign: 'center' }}>
              <Grid size={{ xs: 4 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  Meta
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  1,500
                </Typography>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  Actual
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  {metrics ? metrics.prospection_count : '...'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  Pendientes
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  {1500 - (metrics?.prospection_count ?? 0)}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Box>
      ) : (
        <Box>
          <Card variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              {/* <Grid size={{ xs: 3 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Región"
                  defaultValue="all"
                >
                  <MenuItem value="all">Todas</MenuItem>
                  {regions.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid> */}
              <Grid size={{ xs: 3 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Conversiones"
                  value={form}
                  onChange={(e) => setForm(e.target.value)}
                >
                  {/* <MenuItem value="all">Todos</MenuItem> */}
                  {forms.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              {/* <Grid size={{ xs: 4 }}>
                <Stack direction="row" spacing={1}>
                  <TextField
                    type="date"
                    fullWidth
                    size="small"
                    label="Desde"
                    InputLabelProps={{ shrink: true }}
                    defaultValue=""
                  />
                  <TextField
                    type="date"
                    fullWidth
                    size="small"
                    label="Hasta"
                    InputLabelProps={{ shrink: true }}
                    defaultValue=""
                  />
                </Stack>
              </Grid>
              <Grid size={{ xs: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ bgcolor: '#f37021' }}
                  startIcon={<FilterIcon />}
                >
                  Filtrar
                </Button>
              </Grid> */}
            </Grid>
          </Card>
          {featureCollection && (
            <MapComponent
              value={featureCollection}
              zoom={4}
              sx={{ borderRadius: '10px' }}
            />
          )}
          {/* <LeafletMap markers={prospectRecords} /> */}
        </Box>
      )}
    </Box>
  );
};

export default DashboardPage;
