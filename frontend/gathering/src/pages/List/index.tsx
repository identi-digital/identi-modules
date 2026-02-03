import React, { useCallback, useEffect, useState } from 'react';
import { Box, Grid, Icon, Paper, Tooltip, IconButton } from '@mui/material';
import DataTable from '@ui/components/organisms/DataTable/ServerSide/DataTable';
import { TableHeadColumn } from '@ui/components/molecules/TableHead/TableHead';
import Breadcrumbs from '@ui/components/molecules/Breadcrumbs/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { fCurrency } from '@ui/utils/formatNumber';
import { showMessage, showYesNoQuestion } from '@ui/utils/Messages';
import {
  Add,
  AddCardRounded,
  DeleteRounded,
  DownloadRounded,
  EditRounded,
  PersonAddAlt1Rounded,
  VisibilityRounded,
} from '@mui/icons-material';
import GathererDialog from '../../components/GathererDialog';
import ResumeComponent from '@ui/components/molecules/ResumeComponent';
import { useAuth } from '@/core/auth/AuthContext';
import { AxiosResponse } from 'axios';
import EditNameDialog from '../../components/EditNameDialog';
import AssignBalance from '../../components/AssignBalance';
import Button from '@/ui/components/atoms/Button/Button';
import {
  getDetailRoute,
  MODULE_ACTOR_DISPLAY_NAME,
  MODULE_ACTOR_DISPLAY_NAME_PLURAL,
  MODULE_ENTITY_DISPLAY_NAME,
  MODULE_ENTITY_DISPLAY_NAME_PLURAL,
} from '../../../index';
import { GatheringService } from '../../services/gathering';
import { GatheringCenterList } from '../../models/gathering_center';
import { BalanceService } from '../../services/balances';
import { GatherersService } from '../../services/gatherers';
import { ModuleConfig } from '@/core/moduleLoader';
import { FormService } from '@/modules/forms/src/services/forms';
import { Module } from '@/modules/forms/src/models/forms';
import RegisterFormDialog from '@/modules/forms/src/components/RegisterFormDialog';
import { saveAs } from '@/ui/utils/dowloadExcel';

type DataRow = {
  id?: string;
  idRef: string;
  entity_name: string;
  lot_count: number;
  gathering_count: number;
  balance: number;
  product_sum: number;
  expenses_sum: number;
  date: string;
  relations?: any[];
  name_detail?: any;
};

type GatheringPageProps = {
  config?: ModuleConfig;
};

const GatheringPage: React.FC<GatheringPageProps> = ({
  config,
}: GatheringPageProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const moduleVariables = config?.variables || {};
  const idFormGatheringCenter = moduleVariables.idFormGatheringCenter;
  // console.log(config);
  // const [moduleGatheringId, setModuleGatheringId] = useState<string>('');
  const [headers, setHeaders] = useState<TableHeadColumn[]>([]);
  const [dataRows, setDataRows] = useState<DataRow[]>([]);
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadData, setIsLoadData] = useState<boolean>(false);
  const [rowSelected, setRowSelected] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [agentsArray, setAgentsArray] = useState<any[]>([]);

  const [dailyExpense, setDailyExpense] = useState<number>(0);
  const [monthlyExpense, setMonthlyExpense] = useState<number>(0);
  const [lastTransactionAmount, setLastTransactionAmount] = useState<number>(0);

  const [openChangeDetail, setOpenChangeDetail] = useState<boolean>(false);
  const [entityIdToChange, setEntityIdToChange] = useState<string>('');
  const [nameDetail, setNameDetail] = useState<any | null>(null);

  // asignar saldo al centro de acopio
  const [gatheringIdSelected, setGatheringIdSelected] = useState<string>('');
  const [openAssignDialog, setOpenAssignDialog] = useState<boolean>(false);

  const [isLoadForm, setIsLoadForm] = useState<boolean>(true);
  const [form, setForm] = useState<Module | null>(null);
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);

  const handleCloseAction = useCallback((isUpdateDataTable?: boolean) => {
    setIsOpenDialog((open: boolean) => !open);
    if (typeof isUpdateDataTable !== 'object' && isUpdateDataTable) {
      setIsLoadData((prevValue: boolean) => !prevValue);
    }
    //  setUser(undefined);
  }, []);

  const onLoad = useCallback(
    async (
      page: number,
      perPage: number,
      orderBy: string,
      order: string,
      search: string,
    ): Promise<AxiosResponse<any>> => {
      // console.log(page, perPage, orderBy, order, search);
      const data = await GatheringService.getGatheringCentersPaginate(
        page,
        perPage,
        orderBy,
        order,
        search,
      );
      // const data = await api.get('/forms');
      // console.log(data);
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

  const handleOpenAssignBalance = useCallback((id: string) => {
    setOpenAssignDialog(true);
    setGatheringIdSelected(id);
  }, []);

  const handleAssignBalance = useCallback((obj: any) => {
    console.log('createMovement', obj);
    BalanceService.create(obj)
      .then((res: any) => {
        if (res) {
          showMessage('', 'Se ha asignado el saldo correctamente.', 'success');
          setOpenAssignDialog(false);
          setIsLoadData((prev: boolean) => !prev);
          // handleChangeData();
        }
      })
      .catch((_err: any) => {
        showMessage(
          '',
          'No se ha podido asignar el saldo, intente nuevamente.',
          'error',
        );
      })
      .finally(() => {
        setOpenAssignDialog(false);
      });
    // createMovement(obj)
    //   .then((res: any) => {
    //     if (res.success) {
    //       showMessage('', 'Se ha asignado el saldo correctamente.', 'success');
    //       setOpenAssignDialog(false);
    //       setIsLoadData((prev: boolean) => !prev);
    //       // handleChangeData();
    //     } else {
    //       showMessage('', 'No se ha podido asignar el saldo, intente nuevamente.', 'error');
    //     }
    //   })
    //   .finally(() => {
    //     setOpenDialog(false);
    //   });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadData = useCallback(async () => {
    GatheringService.getGatheringCentersExport()
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
          const blob = new Blob([resp.data], {
            type:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          // console.log(blob);
          saveAs(blob, filename);
        }
      })
      .catch(() => {
        showMessage('', 'Problemas al exportar los registros', 'error', true);
      });
  }, []);

  const handleDeleteRow = useCallback((id: string) => {
    // console.log(row);
    showYesNoQuestion(
      `¿Seguro de querer eliminar este ${MODULE_ENTITY_DISPLAY_NAME}?`,
      'Una vez eliminado no se podrá recuperar.',
      'warning',
    ).then((val: any) => {
      if (val) {
        console.log('disabledEntity', `${id}`);
        // disabledEntity(`${row?.id}`)
        //   .then(() => {
        //     showMessage('', 'El centro de acopio fue eliminado correctamente.', 'success');
        //     setIsLoadData((prev: boolean) => !prev);
        //   })
        //   .catch(() => {
        //     showMessage('', 'Problemas al eliminar el centro de acopio, inténtelo nuevamente.', 'error');
        //   });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeName = useCallback(
    (idEntity: string, idEntityDetail: string, newEntityDetail: any) => {
      if (idEntity === '') return;
      if (idEntityDetail === '') return;
      showYesNoQuestion(
        `¿Seguro de querer cambiar el nombre del ${MODULE_ENTITY_DISPLAY_NAME}?`,
        '',
        'warning',
      ).then((val: any) => {
        if (val) {
          console.log(
            'saveOneDetail',
            idEntity,
            idEntityDetail,
            newEntityDetail,
          );
        }
      });
    },
    [],
  );

  // headers
  useEffect(() => {
    const _setHeaders: any = [
      {
        sorteable: true,
        align: 'left',
        text: MODULE_ENTITY_DISPLAY_NAME,
        value: 'name',
        padding: 'none',
      },
      {
        sorteable: true,
        align: 'left',
        text: 'Lotes',
        padding: 'none',
        value: 'lots_count',
      },
      {
        sorteable: true,
        align: 'left',
        text: MODULE_ACTOR_DISPLAY_NAME_PLURAL,
        padding: 'none',
        value: 'gatherers_count',
      },
      {
        sorteable: true,
        align: 'left',
        text: 'Saldo',
        padding: 'none',
        value: 'balance',
        render: (row: any) => (
          <>
            S/.{' '}
            {fCurrency((!isNaN(+row.balance) ? +row.balance : 0).toFixed(2))}
            {/* <Translation text={'S/.'} /> {fCurrency((!isNaN(+row.balance) ? +row.balance : 0).toFixed(2))} */}
            {/* 0.00 */}
          </>
        ),
      },
      {
        sorteable: false,
        align: 'center',
        text: 'Acciones',
        value: '',
        render: (row: GatheringCenterList) => {
          // console.log(row);
          return (
            <Box display="flex" flexDirection="row" justifyContent="center">
              {row.lot_count === 0 && row.gatherer_count === 0 && (
                <Tooltip title="Editar nombre">
                  <IconButton
                    onClick={() => {
                      setEntityIdToChange(row.id ?? '');
                      setNameDetail(row.name);
                      setOpenChangeDetail(true);
                    }}
                  >
                    <EditRounded />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Asignar saldo">
                <IconButton
                  onClick={() => handleOpenAssignBalance(row?.id ?? '')}
                >
                  <AddCardRounded />
                </IconButton>
              </Tooltip>

              <Tooltip title={`Añadir ${MODULE_ACTOR_DISPLAY_NAME}`}>
                <IconButton
                  onClick={() => {
                    setRowSelected(row);
                    setOpenDialog(true);
                  }}
                >
                  <PersonAddAlt1Rounded />
                </IconButton>
              </Tooltip>

              <Tooltip title={`Ver ${MODULE_ENTITY_DISPLAY_NAME}`}>
                <IconButton
                  onClick={() => {
                    navigate(getDetailRoute(row.id));
                    // console.log('navigate');
                  }}
                >
                  <VisibilityRounded />
                </IconButton>
              </Tooltip>

              <Tooltip title="Eliminar">
                <IconButton onClick={() => handleDeleteRow(row.id)}>
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

  useEffect(() => {
    GatherersService.getGatherersPaginate(
      1,
      100,
      'first_name',
      'asc',
      '',
      'active',
      false,
    ).then((resp: any) => {
      console.log(resp);
      if (
        resp &&
        resp.items &&
        Array.isArray(resp.items) &&
        resp.items.length > 0
      ) {
        setAgentsArray(resp.items);
      }
    });
  }, []);

  // obtengo el resumen del mes y del día
  useEffect(() => {
    GatheringService.getGatheringSummary().then((resp: any) => {
      console.log(resp);
      const { last_purchase_amount, today_expense, month_expense } = resp;
      setLastTransactionAmount(+last_purchase_amount || 0);
      setDailyExpense(+today_expense || 0);
      setMonthlyExpense(+month_expense || 0);
    });
  }, []);

  useEffect(() => {
    if (idFormGatheringCenter && idFormGatheringCenter !== '') {
      try {
        setIsLoadForm(true);
        FormService.getById(idFormGatheringCenter).then((resp: any) => {
          if (resp) {
            setForm(resp);
          }
          setIsLoadForm(false);
        });
      } finally {
        setIsLoadForm(false);
      }
    }
  }, [idFormGatheringCenter]);

  return (
    <>
      <Grid container={true} spacing={1}>
        {/* <Grid
          style={{
            display: 'flex',
            flexDirection: isActiveDesktop ? 'column' : 'row',
            justifyContent: 'space-between',
          }}
        >
          <Box my={2}>
            <Box>
              <Breadcrumbs
                breadcrumbs={[
                  {
                    component: <Icon fontSize="small">home</Icon>,
                  },
                  {
                    component: 'Centros de acopio',
                  },
                ]}
              />
            </Box>
          </Box>
        </Grid> */}
        <Grid size={12}>
          <Box my={2}>
            <Box>
              <Breadcrumbs
                breadcrumbs={[
                  {
                    component: <Icon fontSize="small">home</Icon>,
                  },
                  {
                    component: MODULE_ENTITY_DISPLAY_NAME_PLURAL,
                  },
                ]}
              />
            </Box>
          </Box>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              text={`Agregar ${MODULE_ENTITY_DISPLAY_NAME}`}
              startIcon={<Add />}
              sx={{ width: 'max-content' }}
              variant="contained"
              color="inherit"
              disabled={isLoadForm}
              onClick={handleCloseAction}
            />
          </Box>
        </Grid>
        {/* Resumen de centro de acopio */}
        <Grid size={12}>
          <ResumeComponent
            textHeader={'Resumen de saldo'}
            resumeKeys={[
              {
                text: 'Ultima transacción',
                value: `${lastTransactionAmount}`,
                color: 'rgb(255, 91, 0)',
                reverse: true,
                money: true,
              },
              {
                text: 'Gasto diario',
                value: `${dailyExpense}`,

                money: true,
              },
              {
                text: 'Gasto mensual',
                value: `${monthlyExpense}`,

                money: true,
              },
            ]}
          />
        </Grid>

        {/* Botones de descarga */}
        <Grid size={12}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              text={'Descargar Información'}
              startIcon={<DownloadRounded />}
              sx={{ width: 'max-content' }}
              variant="contained"
              color="secondary"
              onClick={() => handleDownloadData()}
            />
          </Box>
        </Grid>
        {/* Tabla de centros de acopio */}

        <Grid size={12}>
          <Paper elevation={2} style={{ padding: '20px', marginTop: '10px' }}>
            <DataTable
              headers={headers}
              onLoad={onLoad}
              refresh={isLoadData}
              // items={filteredDataRows}
              // searchSize="small"
              // loading={isLoading}
              // searchFullWidth
              // isSelect
              // checkValidateField={(row: any) => !row.status || (row.status && row.status !== 'SUCCESSFUL')}
              // handleSelects={(items: any[]) => {
              //   setSelectedItems(items);
              // }}
              // refreshSelect={refreshSelect}
            />
          </Paper>
        </Grid>
      </Grid>
      <GathererDialog
        openDialog={openDialog}
        rowSelected={rowSelected}
        agents={agentsArray}
        handleCloseDialog={(isRefresh?: boolean) => {
          setOpenDialog(false);
          if (isRefresh) {
            setIsLoadData((prev: boolean) => !prev);
          }
        }}
      />
      {openChangeDetail && nameDetail && (
        <EditNameDialog
          element={nameDetail}
          idEntity={entityIdToChange}
          // entityDetail={headers}
          handleChangeName={handleChangeName}
          userId={user?.id ?? ''}
          handleCloseDialog={(isRefresh?: boolean) => {
            if (isRefresh) {
              setIsLoadData((prev: boolean) => !prev);
            }
            setOpenChangeDetail(false);
          }}
        />
      )}

      {openAssignDialog && (
        <AssignBalance
          gatheringId={gatheringIdSelected}
          // gathererIdSelected={gathererIdSelected}
          userId={user?.id ?? ''}
          handleCloseDialog={() => {
            setOpenAssignDialog(false);
            setGatheringIdSelected('');
          }}
          handleAssignBalance={handleAssignBalance}
        />
      )}
      {isOpenDialog && form && (
        <RegisterFormDialog handleClose={handleCloseAction} module={form} />
      )}
    </>
  );
};

export default GatheringPage;
