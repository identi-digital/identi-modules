// Ruta principal: Lista de agricultores
// import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  useMediaQuery,
  useTheme,
  Chip,
  Tooltip,
  IconButton,
  Icon,
} from '@mui/material';
import { ModuleConfig } from '@core/moduleLoader';
// import { getDetailRoute } from '../../../index';
import FilterComponent from '@/ui/components/molecules/FilterComponent';
import { useCallback, useEffect, useState } from 'react';
import { Add, Delete } from '@mui/icons-material';
import { TableHeadColumn } from '@/ui/components/molecules/TableHead/TableHead';
import DataTable from '@/ui/components/organisms/DataTable/ServerSide/DataTable';
import { AxiosResponse } from 'axios';
import DateCell from '@/ui/components/atoms/DateCell/DateCell';
import Breadcrumbs from '@/ui/components/molecules/Breadcrumbs/Breadcrumbs';
import TextFieldSearch from '@/ui/components/molecules/TextFieldSearch/TextFieldSearch';
import Button from '@/ui/components/atoms/Button/Button';
import { GathererCreate, GathererList } from '../../models/gatherer';
import {
  MODULE_ACTOR_DISPLAY_NAME,
  MODULE_ACTOR_DISPLAY_NAME_PLURAL,
} from '../../../index';
import ResumeComponent from '@/ui/components/molecules/ResumeComponent';
import { GatherersService } from '../../services/gatherers';
import CreateGatherer from '../../components/dialogs/CreateGatherer';
import { showMessage, showYesNoQuestion } from '@/ui/utils/Messages';
import useDebounce from '@/ui/hooks/use_debounce';

interface GatherersListProps {
  config?: ModuleConfig;
}

export default function GatherersList({ config }: GatherersListProps) {
  // const navigate = useNavigate();
  // console.log(config);
  const theme = useTheme();
  const isActiveDesktop = useMediaQuery(theme.breakpoints.down('md'));
  const isActiveButtons = useMediaQuery(theme.breakpoints.up('md'));
  const [gatherer, setGatherer] = useState<GathererCreate | undefined>(
    undefined,
  );
  const [orderSelected, setOrderSelected] = useState<string>('A - Z');
  const [statusSelected, setStatusSelected] = useState<string>('Todos');
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);
  const [isRefresh, setIsRefresh] = useState<boolean>(true);
  const [headers, setHeaders] = useState<TableHeadColumn[]>([]);
  const [search, setSearch] = useState<string>('');
  const textDebounce = useDebounce(search, 500);

  const [resume, setResume] = useState({
    total_balance: 0,
    average_balance: 0,
    daily_amount: 0,
    monthly_amount: 0,
  });
  const [clearFields, setClearFields] = useState<boolean>(false);
  const onLoad = useCallback(
    async (
      page: number,
      perPage: number,
      orderBy: string,
      order: string,
      _search: string,
    ): Promise<AxiosResponse<any>> => {
      console.log(page, perPage, orderBy, order, textDebounce);
      let orderField = 'created_at';
      let statusFilter = 'todos';
      let sort = orderSelected === 'A - Z' ? 'asc' : 'desc';
      if (statusSelected === 'Activos') {
        statusFilter = 'activo';
      }
      if (statusSelected === 'Inactivos') {
        statusFilter = 'inactivo';
      }
      const data = await GatherersService.getGatherersPaginate(
        page,
        perPage,
        orderField,
        sort,
        textDebounce,
        statusFilter,
        false,
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
    [orderSelected, textDebounce, statusSelected],
  );

  const handleClearFields = () => {
    setClearFields((prevValue: boolean) => !prevValue);
  };
  const handleCloseAction = useCallback((isUpdateDataTable?: boolean): void => {
    setIsOpenDialog((open: boolean) => !open);
    if (typeof isUpdateDataTable !== 'object' && isUpdateDataTable) {
      setIsRefresh((prevValue: boolean) => !prevValue);
    }
    setGatherer(undefined);
    handleClearFields();
  }, []);

  const handleDisableGatherer = useCallback((gathererId: string): void => {
    showYesNoQuestion(
      `¿Seguro de querer eliminar el ${MODULE_ACTOR_DISPLAY_NAME}?`,
      '',
      'warning',
    ).then((val: any) => {
      if (val) {
        GatherersService.disableGatherer(gathererId)
          .then((resp: any) => {
            if (resp) {
              setIsRefresh((prevValue: boolean) => !prevValue);
              showMessage(
                '',
                `Se deshabilitó el ${MODULE_ACTOR_DISPLAY_NAME} exitosamente`,
                'success',
              );
            }
          })
          .catch(() => {
            showMessage(
              '',
              `No se ha podido deshabilitar el ${MODULE_ACTOR_DISPLAY_NAME}, intente nuevamente.`,
              'error',
            );
          });
      }
    });
  }, []);

  const handleSaveAction = useCallback((gatherer: GathererCreate): void => {
    GatherersService.createGatherer(gatherer)
      .then((resp: any) => {
        if (resp) {
          handleCloseAction(true);
          showMessage(
            '',
            `Se creó el ${MODULE_ACTOR_DISPLAY_NAME} exitosamente`,
            'success',
          );
        }
      })
      .catch(() => {
        showMessage(
          '',
          `Problemas al crear el ${MODULE_ACTOR_DISPLAY_NAME}`,
          'error',
        );
      });
    // console.log(gatherer);
  }, []);

  const handleGetResume = useCallback(async () => {
    try {
      const res = await GatherersService.getGatherersResume();
      if (res) {
        setResume(res);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const _setHeaders: any = [
      {
        sorteable: false,
        align: 'left',
        text: 'Nombres y apellidos',
        value: 'full_name',
        padding: 'none',
        render: (row: GathererList) => (
          <>
            {row.first_name} {row.last_name}
          </>
        ),
      },
      {
        sorteable: true,
        align: 'center',
        text: 'Estado',
        padding: 'none',
        value: 'active',
        render: (row: GathererList) => {
          // console.log(row);
          // si la fecha de la ultima transacción tiene al menos 15 días de antigüedad, entonces es activo

          if (row?.status === 'activo') {
            return <Chip label="Activo" color="success" variant="outlined" />;
          }
          return <Chip label="Inactivo" color="error" variant="outlined" />;
        },
      },
      {
        sorteable: true,
        align: 'left',
        text: 'Última visita',
        padding: 'none',
        value: 'last_purchase_date',
        render: (row: GathererList) => {
          return (
            <>
              {row?.last_purchase_date ? (
                <DateCell date={row?.last_purchase_date} />
              ) : (
                <>-</>
              )}
            </>
          );
        },
      },
      // {
      //   sorteable: false,
      //   align: 'left',
      //   text: 'Productores asignados',
      //   value: 'farmers_assigned',
      //   padding: 'none',
      //   render: (row: GathererList) => <>{row.farmers_assigned}/100</>,
      // },
      {
        sorteable: false,
        align: 'center',
        text: 'Acción',
        value: '',
        render: (row: any) => {
          return (
            <>
              <Box display="flex" flexDirection="row" justifyContent="center">
                {/* <Tooltip title={`Ver ${MODULE_ACTOR_DISPLAY_NAME}`}>
                  <IconButton
                    onClick={() => navigate('/farmers/detail/' + row.id)}
                    size="small"
                  >
                    <Visibility />
                  </IconButton>
                </Tooltip> */}
                <Tooltip title="Eliminar">
                  <IconButton
                    onClick={() => handleDisableGatherer(row.id)}
                    size="small"
                    //   variant="contained"
                    // color="error"
                    //   style={{ width: '140px', height: '30px' }}
                    //   startIcon={<Delete />}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            </>
          );
        },
      },
    ];
    setHeaders(_setHeaders);
  }, [isActiveButtons]);
  useEffect(() => {
    handleGetResume();
  }, []);
  return (
    <>
      <Grid container={true} spacing={1}>
        <Grid
          size={12}
          sx={{
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
                    // path: routes.dashboard,
                    component: <Icon fontSize="small">home</Icon>,
                  },
                  {
                    component: MODULE_ACTOR_DISPLAY_NAME_PLURAL,
                  },
                ]}
              />
            </Box>
          </Box>
        </Grid>
        <Grid size={12}>
          <ResumeComponent
            textHeader={'Resumen de saldo'}
            resumeKeys={[
              {
                text: 'Monto total de transacciones',
                value: `${resume.total_balance}`,
                //   value: `${lastTransactionAmount}`,
                color: '#FF5B00',
                money: true,
                reverse: true,
              },
              {
                text: 'Promedio por transacción',
                value: `${resume.average_balance}`,
                //   value: `${dailyExpense}`,
                //   color: '#EF4444',
                money: true,
              },
              {
                text: 'Transacciones diarias (PEN)',
                value: `${resume.daily_amount}`,
                //   color: '#EF4444',
                money: true,
              },
              {
                text: 'Transacciones mensuales (PEN)',
                value: `${resume.monthly_amount}`,
                //   color: '#EF4444',
                money: true,
              },
            ]}
          />
        </Grid>
        <Grid
          size={12}
          sx={{
            display: 'flex',
            flexDirection: isActiveDesktop ? 'column' : 'row',
            justifyContent: 'flex-end',
          }}
        >
          {/* <Box
            sx={{
              width: isActiveDesktop ? '33%' : '100%',
            }}
          >
            
          </Box> */}
          <Box width={'100%'}>
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              style={
                isActiveDesktop ? { padding: '6px' } : { marginRight: '10px' }
              }
              sx={{ flexDirection: { xs: 'column', sm: 'row' } }}
            >
              {/* <Box> */}
              <TextFieldSearch
                size="small"
                fullWidth
                onChange={function(value: string): void {
                  setSearch(value);
                }}
              />
              {/* </Box> */}
              <FilterComponent
                buttonLabel={'Ordenar'}
                options={['A - Z', 'Z - A']}
                labelSelected={orderSelected}
                color="primary"
                onSelectOption={function(value: string): void {
                  setOrderSelected(value);
                }}
              />
              <FilterComponent
                buttonLabel={'Estado'}
                options={['Todos', 'Activos', 'Inactivos']}
                labelSelected={statusSelected}
                color="primary"
                onSelectOption={function(value: string): void {
                  setStatusSelected(value);
                }}
              />
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleCloseAction()}
                fullWidth
                sx={{
                  width: '250px',
                }}
                text={`Agregar ${MODULE_ACTOR_DISPLAY_NAME}`}
                color="secondary"
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
      <DataTable
        headers={headers}
        hideSearch={true}
        refresh={isRefresh}
        onLoad={onLoad}
      />

      {isOpenDialog && (
        <CreateGatherer
          closeAction={handleCloseAction}
          saveAction={handleSaveAction}
          gatherer={gatherer}
          clearFields={clearFields}
        />
      )}
    </>
  );
}
