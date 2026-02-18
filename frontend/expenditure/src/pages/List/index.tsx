// import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { getCreateRoute } from '../../../index';
import { useNavigate } from 'react-router-dom';
import DataTable from '@/ui/components/organisms/DataTable/ServerSide/DataTable';
import { useCallback, useEffect, useState } from 'react';
import { AxiosResponse } from 'axios';
import { ExpenditureService } from '../../services/expenditure';
import { ModuleConfig } from '@/core/moduleLoader';
import { TableHeadColumn } from '@/ui/components/molecules/TableHead/TableHead';
import { Transfer } from '../../models/transfer';
import { fCurrency } from '@/ui/utils/formatNumber';
import DateCell from '@/ui/components/atoms/DateCell/DateCell';
// import { Visibility } from '@mui/icons-material';

interface ExpenditureListProps {
  config?: ModuleConfig;
}

const statusNames: any = {
  TO_DO: {
    display_name: 'En proceso',
    color: 'default',
  },
  PENDING: {
    display_name: 'Pendiente',
    color: 'warning',
  },
  COMPLETED: {
    display_name: 'Completado',
    color: 'success',
  },
  FAILED: {
    display_name: 'Fallido',
    color: 'error',
  },
};

const ListPage: React.FC<ExpenditureListProps> = ({ config }) => {
  const navigate = useNavigate();
  // const [isRefresh, setIsRefresh] = useState<boolean>(true);
  const [headers, setHeaders] = useState<TableHeadColumn[]>([]);
  const [isRefresh, setIsRefresh] = useState<boolean>(false);
  const onLoad = useCallback(
    async (
      page: number,
      perPage: number,
      orderBy: string,
      order: string,
      search: string,
    ): Promise<AxiosResponse<any>> => {
      // console.log(page, perPage, orderBy, order, search);
      const data = await ExpenditureService.getTransfers(
        page,
        perPage,
        orderBy || 'created_at',
        order || 'asc',
        search,
      );

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
    [], // 👈 sin dependencias → no se recrea
  );

  useEffect(() => {
    const _setHeaders: any = [
      {
        sorteable: false,
        align: 'left',
        text: 'Productor',
        value: 'first_name',
        padding: 'none',
        render: (row: Transfer) => (
          <>
            {row.first_name ?? ''} {row.last_name ?? ''}
          </>
        ),
      },
      {
        sorteable: false,
        align: 'left',
        text: 'Monto',
        value: 'amount',
        padding: 'none',
        render: (row: Transfer) => (
          <Typography>
            S/.
            {fCurrency((!isNaN(+row.amount) ? +row.amount : 0).toFixed(2))}
          </Typography>
        ),
      },
      {
        sorteable: false,
        align: 'left',
        text: 'Fecha',
        value: 'created_at',
        padding: 'none',
        render: (row: Transfer) => (
          <Typography>
            {row.created_at ? <DateCell date={row.created_at} /> : '...'}
          </Typography>
        ),
      },
      {
        sorteable: false,
        align: 'left',
        text: 'Estado',
        value: 'status',
        padding: 'none',
        render: (row: Transfer) => (
          <>
            <Chip
              label={statusNames[row.status].display_name ?? 'Sin estado'}
              color={statusNames[row.status].color}
              variant="outlined"
            />
          </>
        ),
      },
    ];
    setHeaders(_setHeaders);
  }, []);
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        {/* <Typography variant="h5" fontWeight={800}>
          Desembolsos
        </Typography> */}
        <Box></Box>
        <Box>
          <Button
            variant="outlined"
            sx={{ mr: 2 }}
            color="primary"
            onClick={() => setIsRefresh((prev: boolean) => !prev)}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: '#f37021' }}
            onClick={() => navigate(getCreateRoute())}
          >
            Nuevo Desembolso
          </Button>
        </Box>
      </Box>
      <DataTable
        headers={headers}
        hideSearch={true}
        refresh={isRefresh}
        onLoad={onLoad}
      />
      {/* <TableContainer
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
      </TableContainer> */}
    </Box>
  );
};

export default ListPage;
