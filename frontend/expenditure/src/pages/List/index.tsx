// import React, { useState, useEffect, useRef } from 'react';
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
  Chip,
} from '@mui/material';
import { getCreateRoute } from '../../../index';
import { useNavigate } from 'react-router-dom';

const ListPage = () => {
  const navigate = useNavigate();
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={800}>
          Desembolsos
        </Typography>
        <Button
          variant="contained"
          sx={{ bgcolor: '#f37021' }}
          onClick={() => navigate(getCreateRoute())}
        >
          Nuevo Desembolso
        </Button>
      </Box>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ borderRadius: 3 }}
      >
        <Table>
          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
            <TableRow>
              <TableCell>Productor</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Ernesto Perez</TableCell>
              <TableCell>S/ 2,400.00</TableCell>
              <TableCell>
                <Chip label="Pendiente" size="small" />
              </TableCell>
              <TableCell align="right">
                <Button size="small" onClick={() => navigate(getCreateRoute())}>
                  Ver
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ListPage;
