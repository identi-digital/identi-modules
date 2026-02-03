// Ruta principal: Lista de agricultores
import { useNavigate } from 'react-router-dom';
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
import { Add, Delete, Visibility } from '@mui/icons-material';
import { TableHeadColumn } from '@/ui/components/molecules/TableHead/TableHead';
import DataTable from '@/ui/components/organisms/DataTable/ServerSide/DataTable';
import { AxiosResponse } from 'axios';
import DateCell from '@/ui/components/atoms/DateCell/DateCell';
import Breadcrumbs from '@/ui/components/molecules/Breadcrumbs/Breadcrumbs';
import TextFieldSearch from '@/ui/components/molecules/TextFieldSearch/TextFieldSearch';
import Button from '@/ui/components/atoms/Button/Button';
import { AgentCreate, AgentList } from '../../models/agent';
import useDebounce from '@/ui/hooks/use_debounce';
import { AgentsService } from '../../services/agents';
import CreateAgentModal from '../../components/dialogs/CreateAgent';
import { showMessage } from '@/ui/utils/Messages';
import {
  MODULE_ACTOR_DISPLAY_NAME,
  MODULE_ACTOR_DISPLAY_NAME_PLURAL,
} from '../../../';

interface AgentsListProps {
  config?: ModuleConfig;
}

// Datos dummy de agente

export default function AgentsList({ config }: AgentsListProps) {
  const navigate = useNavigate();
  // console.log(config);
  const theme = useTheme();
  const isActiveDesktop = useMediaQuery(theme.breakpoints.down('md'));
  const isActiveButtons = useMediaQuery(theme.breakpoints.up('md'));

  const [orderSelected, setOrderSelected] = useState<string>('A - Z');
  const [statusSelected, setStatusSelected] = useState<string>('Todos');
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);
  //   const [isRefresh, setIsRefresh] = useState<boolean>(true);
  const [agent, setAgent] = useState<AgentCreate | undefined>(undefined);
  const [isRefresh, setIsRefresh] = useState<boolean>(true);
  const [headers, setHeaders] = useState<TableHeadColumn[]>([]);
  const [search, setSearch] = useState<string>('');
  const [clearFields, setClearFields] = useState<boolean>(false);
  const textDebounce = useDebounce(search, 500);

  const onLoad = useCallback(
    async (
      page: number,
      perPage: number,
      orderBy: string,
      order: string,
      _search: string,
    ): Promise<AxiosResponse<any>> => {
      console.log(page, perPage, orderBy, order, textDebounce);
      let orderField = 'first_name';
      let sort = orderSelected === 'A - Z' ? 'asc' : 'desc';
      if (statusSelected !== 'Todos') {
        orderField = 'status';
        sort = statusSelected === 'Activos' ? 'asc' : 'desc';
      } else {
        orderField = 'first_name';
      }
      const data = await AgentsService.getAgentsPaginate(
        page,
        perPage,
        orderField,
        sort,
        textDebounce,
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
    setAgent(undefined);
    handleClearFields();
  }, []);

  const handleSaveAction = useCallback((agent: AgentCreate): void => {
    console.log('handleSaveAction', agent);
    if (agent.id === '') {
      delete agent.identity_id;
      delete agent.id;
      AgentsService.postCreateAgent(agent)
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
          handleClearFields();
        });
    } else {
      console.log('actualizar', agent);
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
        render: (row: AgentList) => (
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
        render: (row: AgentList) => {
          // console.log(row);
          // si la fecha de la ultima transacción tiene al menos 15 días de antigüedad, entonces es activo
          if (row?.status === 'active') {
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
        value: 'last_transaction_date',
        render: (row: AgentList) => {
          return (
            <>
              {row?.last_recorded_at ? (
                <DateCell date={row?.last_recorded_at} />
              ) : (
                <>-</>
              )}
            </>
          );
        },
      },
      {
        sorteable: false,
        align: 'left',
        text: 'Productores asignados',
        value: 'farmers_assigned',
        padding: 'none',
        render: (row: AgentList) => <>{row.farmers_assigned}/100</>,
      },
      {
        sorteable: false,
        align: 'center',
        text: 'Acción',
        value: '',
        render: (row: any) => {
          return (
            <>
              <Box display="flex" flexDirection="row" justifyContent="center">
                <Tooltip title="Ver productor">
                  <IconButton
                    onClick={() => navigate('/farmers/detail/' + row.id)}
                    size="small"
                  >
                    <Visibility />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton
                    onClick={() => console.log(row)}
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
                    component: `${MODULE_ACTOR_DISPLAY_NAME_PLURAL}`,
                  },
                ]}
              />
            </Box>
          </Box>
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
                onChange={(value: string) => {
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
                options={['Todos', 'Activos', 'Inactivos', 'Retirados']}
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
                  width: '180px',
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
        refresh={isRefresh}
        hideSearch={true}
        onLoad={onLoad}
      />
      {isOpenDialog && (
        <CreateAgentModal
          closeAction={handleCloseAction}
          saveAction={handleSaveAction}
          agent={agent}
          clearFields={clearFields}
        />
      )}
    </>
  );
}
