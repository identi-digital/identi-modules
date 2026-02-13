import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const ListPage = () => {
  const [prospectRecords, setProspectRecords] = useState([
    {
      id: 1,
      lat: -8.3435,
      lng: -76.3123,
      producer: 'Ernesto Perez',
      region: 'San Martín',
      status: 'Visitado',
      date: '2024-05-10',
    },
    {
      id: 2,
      lat: -8.4512,
      lng: -76.4201,
      producer: 'Lucía Méndez',
      region: 'Ucayali',
      status: 'En Proceso',
      date: '2024-05-11',
    },
    {
      id: 3,
      lat: -8.3398,
      lng: -76.6055,
      producer: 'Jorge Rojas',
      region: 'San Martín',
      status: 'Pendiente',
      date: '2024-05-12',
    },
  ]);
  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Validación KYC & Compliance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Verificación de identidad y listas de control
          </Typography>
        </Box>
        {/* <Button variant="outlined" startIcon={<VerifiedIcon />}>
          Nueva Validación
        </Button> */}
      </Box>

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ borderRadius: 4 }}
      >
        <Table>
          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
            <TableRow>
              <TableCell>Productor</TableCell>
              <TableCell>DNI / Documento</TableCell>
              <TableCell>Fecha Validación</TableCell>
              <TableCell align="right">% Coincidencia</TableCell>
              <TableCell align="center">Estado Biométrico</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prospectRecords.map((r, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {r.producer}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {r.region}
                  </Typography>
                </TableCell>
                <TableCell>4587****</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold" color="success.main">
                    98.2%
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Validación Facial Exitosa">
                    <CheckCircleIcon color="success" fontSize="small" />
                  </Tooltip>
                </TableCell>
                <TableCell align="right">
                  <Button size="small">Ver Reporte</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ListPage;
