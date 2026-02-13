import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  TextField,
  MenuItem,
  Tab,
  Tabs,
  Stack,
} from '@mui/material';
import {
  FilterAlt as FilterIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

const DashboardPage = () => {
  const [currentView, setCurrentView] = useState('dashboard');

  // --- MOCK DATA ---
  const technicians = ['Juan Pérez', 'María García', 'Carlos Rodríguez'];
  const regions = ['San Martín', 'Ucayali', 'Huánuco'];

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
        <Tabs value={currentView} onChange={(e, v) => setCurrentView(v)}>
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
                      1,240
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
                      850
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
                      TASA DE CONVERSIÓN
                    </Typography>
                    <Typography variant="h4" fontWeight={800}>
                      68%
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
                  1,240 leads
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
                  Visita de Parcela (70%)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ position: 'absolute', right: -100, color: '#666' }}
                >
                  868 visitas
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
                  Seguimiento y Docs (30%)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ position: 'absolute', right: -100, color: '#666' }}
                >
                  372 en proceso
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2} sx={{ mt: 6, textAlign: 'center' }}>
              <Grid size={{ xs: 4 }}>
                <Typography
                  variant="caption"
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
                  variant="caption"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  Actual
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  1,240
                </Typography>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  Pendientes
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  260
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Box>
      ) : (
        <Box>
          <Card variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 3 }}>
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
              </Grid>
              <Grid size={{ xs: 3 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Técnico"
                  defaultValue="all"
                >
                  <MenuItem value="all">Todos</MenuItem>
                  {technicians.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 4 }}>
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
              </Grid>
            </Grid>
          </Card>
          <p>Mapa</p>
          {/* <LeafletMap markers={prospectRecords} /> */}
        </Box>
      )}
    </Box>
  );
};

export default DashboardPage;
