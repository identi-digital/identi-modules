import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  // Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import { Cancel, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
// import { AxiosResponse } from 'axios';
import { KycService } from '../../services/kyc_service';
import DateCell from '@/ui/components/atoms/DateCell/DateCell';

interface KycResult {
  created_at: string;
  dni: string;
  first_name: string;
  is_approved: boolean;
  last_name: string;
  probability: number;
}

const ListPage = () => {
  const [prospectRecords, setProspectRecords] = useState<KycResult[]>([]);

  const onLoad = useCallback(async () => {
    try {
      const data = await KycService.getAll();
      if (data && data.length > 0) {
        setProspectRecords(data);
      }
      console.log(data);
    } catch (error) {
      console.error('Error fetching KYC results:', error);
    }
  }, []);

  useEffect(() => {
    onLoad();
  }, []);

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
              {/* <TableCell align="right">Acciones</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {prospectRecords.map((r, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {r?.first_name ?? ''} {r?.last_name ?? ''}
                  </Typography>
                  {/* <Typography variant="caption" color="text.secondary">
                    {r.region}
                  </Typography> */}
                </TableCell>
                <TableCell>{r?.dni ?? ''}</TableCell>
                <TableCell>
                  {r.created_at ? (
                    <>
                      <DateCell date={r?.created_at ?? ''} />{' '}
                    </>
                  ) : (
                    <>...</>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold" color="success.main">
                    {r?.probability
                      ? (Math.floor(r.probability * 1000) / 10).toFixed(1) + '%'
                      : '...'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {r?.probability ? (
                    <Tooltip title="Validación Exitosa">
                      <CheckCircleIcon color="success" fontSize="small" />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Sin validación">
                      <Cancel color="error" fontSize="small" />
                    </Tooltip>
                  )}
                </TableCell>
                {/* <TableCell align="right">
                  <Button size="small">Ver Reporte</Button>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ListPage;
