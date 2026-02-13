// import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  //   Paper,
  Card,
  //   CardContent,
  Button,
  Avatar,
  Chip,
  TextField,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getModuleRoute } from '../../../index';

const CreatePage = () => {
  const navigate = useNavigate();
  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(getModuleRoute(''))}
        sx={{ mb: 2 }}
      >
        Volver al listado
      </Button>
      <Card variant="outlined" sx={{ borderRadius: 4, p: 4 }}>
        <Typography variant="h5" fontWeight={800} gutterBottom>
          Nueva Transferencia Individual
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color="text.secondary"
                >
                  BUSCAR PRODUCTOR
                </Typography>
                <TextField
                  fullWidth
                  sx={{ mt: 1 }}
                  defaultValue="Ernesto Jaime Perez Rios"
                />
              </Box>
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#fdf7f4',
                  borderRadius: 3,
                  display: 'flex',
                  gap: 2,
                  alignItems: 'center',
                }}
              >
                <Avatar sx={{ bgcolor: 'white' }}>
                  <PersonIcon color="action" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Ernesto Jaime Perez Rios
                  </Typography>
                  <Typography variant="caption" display="block">
                    DNI: 45****** | Tocache
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    <Chip
                      label="VERIFICADO"
                      size="small"
                      color="success"
                      sx={{ fontSize: '0.6rem' }}
                    />
                    <Chip
                      label="Deforestación Baja"
                      size="small"
                      variant="outlined"
                      color="success"
                      sx={{ fontSize: '0.6rem' }}
                    />
                  </Stack>
                </Box>
              </Box>
              <TextField
                fullWidth
                label="MONTO A TRANSFERIR (PEN)"
                defaultValue="S/ 0.00"
              />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ bgcolor: '#f9fafb', borderRadius: 4, p: 3 }}>
              <Typography variant="caption" fontWeight="bold">
                INFORMACIÓN DE CUENTA
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Banco</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    BCP
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Cuenta</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    191-98745632-0-88
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: 'white',
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid #eee',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    CCI
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="#f37021"
                  >
                    002-191-0098745632088-54
                  </Typography>
                </Box>
              </Stack>
              <Button fullWidth variant="contained" disabled sx={{ mt: 4 }}>
                Ejecutar Transferencia
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default CreatePage;
