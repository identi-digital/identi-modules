import React, { useCallback, useEffect, useState } from 'react';
import DataTable from '@ui/components/organisms/DataTable/ServerSide/DataTable';
import { TableHeadColumn } from '@ui/components/molecules/TableHead/TableHead';
import { Grid, Paper } from '@mui/material';
// import Translation from '~/ui/components/shared/translation';
import { fCurrency } from '@ui/utils/formatNumber';
// import useMovements from '~/atlas/balance_movements';
import DateCell from '@ui/components/atoms/DateCell/DateCell';
// import { showMessage } from '@ui/utils/Messages';
import { BalanceService } from '../../../services/balances';
import { AxiosResponse } from 'axios';
import { BalanceMovementList } from '../../../models/balance_movements';

type MovementsViewProps = {
  //   gatheringName: string;
  gatheringId: string;
  // handleChangeTab: (event: any, newValue: number) => void;
  // handleChangeData: () => void;
  // handleToDownload: (name: string, headers: string[], newRows: any[]) => void;
};

const MovementsView: React.FC<MovementsViewProps> = ({
  gatheringId,
  // handleToDownload,
  // handleChangeTab,
  // handleChangeData
}) => {
  //   const { getMovementsByGatheringId } = useMovements();
  const [headers, setHeaders] = useState<TableHeadColumn[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const [dataRows, setDataRows] = useState<ExpensesDataRow[]>([]);
  // const [filteredDataRows, setFilteredDataRows] = useState<ExpensesDataRow[]>(
  //   [],
  // );
  // const [isLoading, setIsLoading] = useState<boolean>(false);

  const onLoad = useCallback(
    async (
      page: number,
      perPage: number,
      orderBy: string,
      order: string,
      search: string,
    ): Promise<AxiosResponse<any>> => {
      console.log(page, perPage, orderBy, order, search);
      const data = await BalanceService.getBalances(
        gatheringId,
        '',
        'recharge',
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
    [],
  );

  useEffect(() => {
    const _setHeaders: any = [
      {
        sorteable: true,
        align: 'left',
        text: 'Usuario',
        value: 'identity_id',
        padding: 'none',
        render: (row: BalanceMovementList) => (
          <>
            {row?.identity?.first_name ?? ''} {row?.identity?.last_name ?? ''}
          </>
        ),
      },
      // {
      //   sorteable: true,
      //   align: 'left',
      //   text: 'Usuario DNI',
      //   value: 'user_dni',
      //   padding: 'none'
      // },
      {
        sorteable: true,
        align: 'left',
        text: 'Tipo',
        padding: 'none',
        value: 'type_movement',
        render: (row: BalanceMovementList) => (
          <>{row?.type_movement === 'recharge' ? 'Recarga' : 'Compra'}</>
        ),
      },
      {
        sorteable: true,
        align: 'left',
        text: 'Monto',
        padding: 'none',
        value: 'ammount',
        render: (row: any) => (
          <>
            S/.{' '}
            {fCurrency((!isNaN(+row.ammount) ? +row.ammount : 0).toFixed(2))}
          </>
        ),
      },
      // {
      //   sorteable: true,
      //   align: 'left',
      //   text: 'Lotes registrados',
      //   padding: 'none',
      //   value: 'lots_count'
      // },
      // {
      //   sorteable: true,
      //   align: 'left',
      //   text: 'Último lote',
      //   padding: 'none',
      //   value: 'last_lot'
      // },
      // {
      //   sorteable: true,
      //   align: 'left',
      //   text: 'Usuario',
      //   padding: 'none',
      //   value: 'user_name'
      // },
      {
        sorteable: true,
        align: 'left',
        text: 'Fecha',
        padding: 'none',
        value: 'created_at',
        render: (row: any) => (
          <>
            <DateCell date={new Date(row?.created_at ?? '')} />
          </>
        ),
      },
      // {
      //   sorteable: false,
      //   align: 'center',
      //   text: 'Acción',
      //   value: '',
      //   render: (row: any) => {
      //     return (
      //       <Box display="flex" flexDirection="row" justifyContent="center">
      //         <Tooltip title="Asignar saldo">
      //           <IconButton onClick={() => handleOpenAssignBalance(row?.id ?? '')}>
      //             <AddCardRounded />
      //           </IconButton>
      //         </Tooltip>
      //         <Tooltip title="Quitar del centro de acopio">
      //           <IconButton onClick={() => handleDeleteRelation(row?.id ?? '')}>
      //             <DeleteRounded />
      //           </IconButton>
      //         </Tooltip>
      //       </Box>
      //     );
      //   }
      // }
    ];
    setHeaders(_setHeaders);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const _processingData = useCallback(async (data: any[]) => {
  //   setIsLoading(true);
  //   const newRows: any[] = [];
  //   for (const element of data) {
  //     // console.log(element);
  //     const gatheringsNames = await getGatheringsByGathererId(element.uuid);
  //     const newRow: ExpensesDataRow = {
  //       id: element?.uuid ?? '',
  //       name: `${element?.first_name ?? ''} ${element?.last_name ?? ''}`,
  //       dni: element?.eid ?? '' ?? '',
  //       phone: element?.cell_number ?? '',
  //       balance: element?.balance ?? 0,
  //       lots_count: element?.lots_count ?? 0,
  //       last_lot: element?.last_lot ?? '',
  //       gathering_name: gatheringsNames.join(', ')
  //     };
  //     newRows.push(newRow);
  //   }
  //   setDataRows(newRows);
  //   const headers = ['Acopiador', 'DNI', 'Celular', 'Saldo', 'Centro de acopio'];
  //   const rowsToDownload: any[] = [];
  //   newRows.forEach((element: any) => {
  //     const newRow: string[] = [];
  //     newRow.push(element.name);
  //     newRow.push(element.dni);
  //     newRow.push(element.phone);
  //     newRow.push(element.balance);
  //     newRow.push(element.gathering_name);
  //     rowsToDownload.push(newRow);
  //   });
  //   handleToDownload('Acopiadores', headers, rowsToDownload);
  //   setFilteredDataRows(newRows);
  //   setIsLoading(false);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // useEffect(() => {
  //   const headers = ['Usuario', 'Tipo', 'Monto', 'Fecha'];
  //   // console.log('here');
  //   if (gatheringId) {
  //     setIsLoading(true);
  //     BalanceService.getBalances(gatheringId, '', 'recharge')
  //       .then((resp: any) => {
  //         console.log(resp);
  //         if (resp && Array.isArray(resp) && resp.length > 0) {
  //           const newRows: any[] = [];
  //           for (const element of resp) {
  //             const newRow: ExpensesDataRow = {
  //               id: element?.id ?? '',
  //               gatherer: element?.gatherer_name ?? '',
  //               gatherer_dni: element?.gatherer_dni ?? '',
  //               type: element?.type === 'RECHARGE' ? 'Recarga' : 'Ingreso',
  //               amount: element?.amount ?? 0,
  //               user_name: element?.user_name ?? '',
  //               created_at: element?.created_at ?? '',
  //             };
  //             newRows.push(newRow);
  //           }
  //           setDataRows(newRows);
  //           const rowsToDownload: any[] = [];
  //           newRows.forEach((element: any) => {
  //             const newRow: string[] = [];
  //             // newRow.push(element.gatherer);
  //             // newRow.push(element.gatherer_dni);
  //             newRow.push(element.user_name);
  //             newRow.push(element.type);
  //             newRow.push(element.amount);
  //             newRow.push(element.created_at);
  //             rowsToDownload.push(newRow);
  //           });
  //           handleToDownload('egresos', headers, rowsToDownload);
  //           setFilteredDataRows(newRows);
  //         } else {
  //           handleToDownload('egresos', headers, []);
  //         }
  //       })
  //       .catch(() => {
  //         showMessage(
  //           '',
  //           'No se han podido recuperar los movimientos',
  //           'error',
  //         );
  //       })
  //       .finally(() => {
  //         setIsLoading(false);
  //       });
  //   } else {
  //     handleToDownload('egresos', headers, []);
  //   }

  //   // if (data.length > 0) {
  //   //   _processingData(data);
  //   // } else {
  //   //   // const headers = ['Acopiador', 'DNI', 'Celular', 'Saldo', 'Centro de acopio'];
  //   //   handleToDownload('Acopiadores', headers, []);
  //   // }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [gatheringId]);

  return (
    <Grid size={12}>
      <Paper elevation={2} style={{ padding: '20px', marginTop: '10px' }}>
        <DataTable
          headers={headers}
          onLoad={onLoad}
          //   items={filteredDataRows}
          //   searchSize="small"
          //   loading={isLoading}
          //   searchFullWidth
          // isSelect
          //   checkValidateField={(row: any) => !row.status || (row.status && row.status !== 'SUCCESSFUL')}
          // handleSelects={(items: any[]) => {
          //   setSelectedItems(items);
          // }}
          // refreshSelect={refreshSelect}
        />
      </Paper>
    </Grid>
  );
};

export default MovementsView;
