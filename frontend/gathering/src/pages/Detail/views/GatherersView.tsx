import React, { useCallback, useEffect, useState } from 'react';
import DataTable from '@ui/components/organisms/DataTable/ServerSide/DataTable';
import { TableHeadColumn } from '@ui/components/molecules/TableHead/TableHead';
import { Box, Grid, IconButton, Paper, Tooltip } from '@mui/material';
// import Translation from '~/ui/components/shared/translation';
// import { fCurrency } from '~/utils/formatNumber';
import {
  // AddCardRounded,
  DeleteRounded,
} from '@mui/icons-material';

// import useGathering from '~/atlas/gathering';
import { showMessage, showYesNoQuestion } from '@ui/utils/Messages';
import { GatheringService } from '../../../services/gathering';
import { AxiosResponse } from 'axios';
import {
  MODULE_ACTOR_DISPLAY_NAME,
  MODULE_ENTITY_DISPLAY_NAME,
  MODULE_ENTITY_DISPLAY_NAME_PLURAL,
} from '@/modules/gathering';
// import AssignBalance from '../../components/AssignBalance';
// import useMovements from '~/atlas/balance_movements';

type GatherersViewProps = {
  // gatheringName: string;
  gatheringId: string;
  // data: any[];
  entityIdGathering: string;
  handleChangeTab: (event: any, newValue: number) => void;
  // handleChangeData: () => void;
  // handleToDownload: (name: string, headers: string[], newRows: any[]) => void;
};

const GatherersView: React.FC<GatherersViewProps> = ({
  gatheringId,
  // data,
  // entityIdGathering,
  // handleToDownload,
  // handleChangeTab,
  // handleChangeData,
}) => {
  // const { getGatheringsByGathererId, deleteRelation } = useGathering();
  // const { createMovement } = useMovements(atlasApp.app);
  const [headers, setHeaders] = useState<TableHeadColumn[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const [dataRows, setDataRows] = useState<DataRow[]>([]);
  // const [filteredDataRows, setFilteredDataRows] = useState<DataRow[]>([]);
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [isLoadData, setIsLoadData] = useState<boolean>(false);
  // const [openDialog, setOpenDialog] = useState<boolean>(false);
  // const [gathererIdSelected, setGatheringIdSelected] = useState<string>('');

  const onLoad = useCallback(
    async (
      page: number,
      perPage: number,
      orderBy: string,
      order: string,
      search: string,
    ): Promise<AxiosResponse<any>> => {
      console.log(page, perPage, orderBy, order, search);
      const data = await GatheringService.getGatherersOfGatheringCenter(
        gatheringId,
        page,
        perPage,
        orderBy,
        order,
        search,
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

  // const handleOpenAssignBalance = useCallback((id: string) => {
  //   setOpenDialog(true);
  //   setGatheringIdSelected(id);
  // }, []);

  // const handleAssignBalance = useCallback((obj: any) => {
  //   // console.log(obj);
  //   createMovement(obj)
  //     .then((res: any) => {
  //       if (res.success) {
  //         showMessage('', 'Se ha asignado el saldo correctamente.', 'success');
  //         handleChangeData();
  //       } else {
  //         showMessage('', 'No se ha podido asignar el saldo, intente nuevamente.', 'error');
  //       }
  //     })
  //     .finally(() => {
  //       setOpenDialog(false);
  //     });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const handleDeleteRelation = useCallback(
    (id: string) => {
      console.log('deleteRelation', id);
      showYesNoQuestion(
        '',
        '¿Seguro de querer eliminar al acopiador de este centro de acopio?',
        'warning',
        true,
      ).then((val: any) => {
        if (val) {
          GatheringService.disableGathererOfGatheringCenter(`${id}`)
            .then(() => {
              showMessage(
                '',
                'El acopiador fue eliminado correctamente.',
                'success',
              );
              // setIsLoadData((prev: boolean) => !prev);
              setRefresh((prev: boolean) => !prev);
              // handleChangeTab(null, 3);
            })
            .catch(() => {
              showMessage(
                '',
                'Problemas al eliminar el acopiador, inténtelo nuevamente.',
                'error',
              );
            });
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    const _setHeaders: any = [
      {
        sorteable: true,
        align: 'left',
        text: `${MODULE_ACTOR_DISPLAY_NAME}`,
        value: 'name',
        padding: 'none',
        render: (row: any) => (
          <>
            {row.first_name} {row.last_name}
          </>
        ),
      },
      {
        sorteable: true,
        align: 'left',
        text: 'DNI',
        padding: 'none',
        value: 'dni',
      },
      {
        sorteable: true,
        align: 'left',
        text: 'Celular',
        padding: 'none',
        value: 'call_number',
      },
      // {
      //   sorteable: true,
      //   align: 'left',
      //   text: 'Saldo',
      //   padding: 'none',
      //   value: 'balance',
      //   render: (row: any) => (
      //     <>
      //       <Translation text={'S/.'} /> {fCurrency((!isNaN(+row.balance) ? +row.balance : 0).toFixed(2))}
      //     </>
      //   )
      // },
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
      {
        sorteable: true,
        align: 'left',
        text: `${MODULE_ENTITY_DISPLAY_NAME_PLURAL}`,
        padding: 'none',
        value: 'other_gathering_centers',
        render: (row: any) => {
          if (
            row?.other_gathering_centers &&
            row?.other_gathering_centers?.length > 0
          ) {
            return <>{row?.other_gathering_centers.join(', ')}</>;
          }
          return <>-</>;
        },
      },
      // {
      //   sorteable: true,
      //   align: 'left',
      //   text: 'Fecha',
      //   padding: 'none',
      //   value: 'date',
      //   render: (row: any) => (
      //     <>
      //       <DateCell date={new Date(row?.date ?? '')} showTime={false} />
      //     </>
      //   )
      // },
      {
        sorteable: false,
        align: 'center',
        text: 'Acción',
        value: '',
        render: (row: any) => {
          // console.log(row);
          return (
            <Box display="flex" flexDirection="row" justifyContent="center">
              {/* <Tooltip title="Asignar saldo">
                <IconButton onClick={() => handleOpenAssignBalance(row?.id ?? '')}>
                  <AddCardRounded />
                </IconButton>
              </Tooltip> */}
              <Tooltip title={`Quitar del ${MODULE_ENTITY_DISPLAY_NAME}`}>
                <IconButton
                  onClick={() =>
                    handleDeleteRelation(
                      row?.gatherer_gathering_center_id ?? '',
                    )
                  }
                >
                  <DeleteRounded />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
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
  //     const newRow: DataRow = {
  //       id: element?.uuid ?? '',
  //       name: `${element?.first_name ?? ''} ${element?.last_name ?? ''}`,
  //       dni: element?.eid ?? '',
  //       phone: element?.cell_number ?? '',
  //       balance: element?.balance ?? 0,
  //       lots_count: element?.lots_count ?? 0,
  //       last_lot: element?.last_lot ?? '',
  //       gathering_name: gatheringsNames.join(', ')
  //     };
  //     newRows.push(newRow);
  //   }
  //   setDataRows(newRows);
  //   const headers = ['Acopiador', 'DNI', 'Celular', 'Centro de acopio'];
  //   const rowsToDownload: any[] = [];
  //   newRows.forEach((element: any) => {
  //     const newRow: string[] = [];
  //     newRow.push(element.name);
  //     newRow.push(element.dni);
  //     newRow.push(element.phone);
  //     // newRow.push(element.balance);
  //     newRow.push(element.gathering_name);
  //     rowsToDownload.push(newRow);
  //   });
  //   handleToDownload('Acopiadores', headers, rowsToDownload);
  //   setFilteredDataRows(newRows);
  //   setIsLoading(false);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // useEffect(() => {
  //   if (data.length > 0) {
  //     // console.log(data);
  //     _processingData(data);
  //   } else {
  //     const headers = ['Acopiador', 'DNI', 'Celular', 'Centro de acopio'];
  //     handleToDownload('Acopiadores', headers, []);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [data]);

  return (
    <Grid size={12}>
      <Paper elevation={2} style={{ padding: '20px', marginTop: '10px' }}>
        <DataTable
          headers={headers}
          onLoad={onLoad}
          refresh={refresh}
          // handleSelects={(items: any[]) => {
          //   setSelectedItems(items);
          // }}
          // refreshSelect={refreshSelect}
        />
      </Paper>
      {/* {openDialog && (
        <AssignBalance
          gatheringId={gatheringId}
          gathererIdSelected={gathererIdSelected}
          userId={user?.user?.uuid ?? ''}
          handleCloseDialog={() => {
            setOpenDialog(false);
            setGatheringIdSelected('');
          }}
          handleAssignBalance={handleAssignBalance}
        />
      )} */}
    </Grid>
  );
};

export default GatherersView;
