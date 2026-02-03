import React, { useCallback, useEffect, useState } from 'react';
import { Box, Grid, Icon, Paper, Tooltip, IconButton } from '@mui/material';
import DataTable from '@ui/components/organisms/DataTable/ServerSide/DataTable';
import { TableHeadColumn } from '@ui/components/molecules/TableHead/TableHead';
import Breadcrumbs from '@ui/components/molecules/Breadcrumbs/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { showMessage, showYesNoQuestion } from '@ui/utils/Messages';
import {
  Add,
  DeleteRounded,
  DownloadRounded,
  VisibilityRounded,
} from '@mui/icons-material';

import ResumeComponent from '@ui/components/molecules/ResumeComponent';
import { AxiosResponse } from 'axios';
import Button from '@/ui/components/atoms/Button/Button';
import {
  getDetailRoute,
  MODULE_ENTITY_DISPLAY_NAME,
  MODULE_ENTITY_DISPLAY_NAME_PLURAL,
} from '../../../index';
import { WarehouseService } from '../../services/warehouse';
import { StoreCenterList } from '../../models/warehouse';
import { ModuleConfig } from '@/core/moduleLoader';
import { FormService } from '@/modules/forms/src/services/forms';
import { Module } from '@/modules/forms/src/models/forms';
import RegisterFormDialog from '@/modules/forms/src/components/RegisterFormDialog';
import { saveAs } from '@/ui/utils/dowloadExcel';
import DateCell from '@/ui/components/atoms/DateCell/DateCell';

type GatheringPageProps = {
  config?: ModuleConfig;
};

const GatheringPage: React.FC<GatheringPageProps> = ({
  config,
}: GatheringPageProps) => {
  const navigate = useNavigate();
  //   const { user } = useAuth();

  const moduleVariables = config?.variables || {};
  const idFormStoreCenter = moduleVariables.idFormStoreCenter;
  // console.log(config);
  // const [moduleGatheringId, setModuleGatheringId] = useState<string>('');
  const [headers, setHeaders] = useState<TableHeadColumn[]>([]);
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadData, setIsLoadData] = useState<boolean>(false);
  const [resume, setResume] = useState({
    active_lots: 0,
    last_lot: {
      id: '',
      name: '',
    },
    stock_lots: 0,
    total_lots: 0,
    kg_total: 0,
    total: 0,
  });

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
      const data = await WarehouseService.getWarehousesPaginate(
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

  const handleDownloadData = useCallback(async () => {
    WarehouseService.getWarehousesExport()
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
    console.log(id);
    showYesNoQuestion(
      `¿Seguro de querer eliminar este ${MODULE_ENTITY_DISPLAY_NAME}?`,
      'Una vez eliminado no se podrá recuperar.',
      'warning',
    ).then((val: any) => {
      if (val) {
        console.log('disabledEntity', `${id}`);
        WarehouseService.disableStoreCenter(`${id}`)
          .then(() => {
            showMessage(
              '',
              'El centro de acopio fue eliminado correctamente.',
              'success',
            );
            setIsLoadData((prev: boolean) => !prev);
          })
          .catch(() => {
            showMessage(
              '',
              'Problemas al eliminar el centro de acopio, inténtelo nuevamente.',
              'error',
            );
          });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // headers
  useEffect(() => {
    const _setHeaders: any = [
      {
        sorteable: false,
        align: 'left',
        text: MODULE_ENTITY_DISPLAY_NAME,
        value: 'name',
        padding: 'none',
      },
      {
        sorteable: false,
        align: 'left',
        text: 'Código',
        value: 'code',
        padding: 'none',
      },
      {
        sorteable: false,
        align: 'left',
        text: 'Lotes',
        padding: 'none',
        value: 'lots_count',
      },
      {
        sorteable: false,
        align: 'left',
        text: 'Fecha de registro',
        padding: 'none',
        value: 'created_at',
        render: (row: any) => (
          <>
            {row?.created_at ? (
              <DateCell date={new Date(row?.created_at)} />
            ) : (
              <>-</>
            )}
          </>
        ),
      },
      {
        sorteable: false,
        align: 'center',
        text: 'Acciones',
        value: '',
        render: (row: StoreCenterList) => {
          // console.log(row);
          return (
            <Box display="flex" flexDirection="row" justifyContent="center">
              <Tooltip title={`Ver ${MODULE_ENTITY_DISPLAY_NAME}`}>
                <IconButton
                  onClick={() => {
                    navigate(getDetailRoute(row?.id));
                    // console.log('navigate');
                  }}
                >
                  <VisibilityRounded />
                </IconButton>
              </Tooltip>

              <Tooltip title="Eliminar">
                <IconButton onClick={() => handleDeleteRow(row?.id)}>
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

  // obtengo el resumen del mes y del día
  useEffect(() => {
    WarehouseService.getWarehouseSummary().then((resp: any) => {
      console.log(resp);
      if (resp) {
        setResume(resp);
      }
    });
  }, []);

  useEffect(() => {
    if (idFormStoreCenter && idFormStoreCenter !== '') {
      try {
        setIsLoadForm(true);
        FormService.getById(idFormStoreCenter).then((resp: any) => {
          if (resp) {
            setForm(resp);
          }
          setIsLoadForm(false);
        });
      } finally {
        setIsLoadForm(false);
      }
    }
  }, [idFormStoreCenter]);

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
                text: 'Ultimo lote',
                value: `${resume?.last_lot?.name ?? '-'}`,
              },
              {
                text: 'Lotes totales',
                value: `${resume?.total_lots ?? 0}`,
              },
              {
                text: 'Lotes activos',
                value: `${resume?.active_lots ?? 0}`,
              },
              {
                text: 'Lotes en stock',
                value: `${resume?.stock_lots ?? 0}`,
              },
              {
                text: 'Total de kilos',
                value: `${resume?.kg_total ?? 0}`,
              },
              {
                text: 'Monto total',
                value: `${resume?.total ?? 0}`,
                color: 'rgb(255, 91, 0)',
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
      {isOpenDialog && form && (
        <RegisterFormDialog handleClose={handleCloseAction} module={form} />
      )}
    </>
  );
};

export default GatheringPage;
