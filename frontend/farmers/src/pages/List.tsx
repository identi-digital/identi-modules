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
import { getDetailRoute } from '../../index';
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
import { FarmerService } from '../services/farmer';
import useDebounce from '@/ui/hooks/use_debounce';
import RegisterFormDialog from '@/modules/forms/src/components/RegisterFormDialog';
import { Module } from '@/modules/forms/src/models/forms';
import { FormService } from '@/modules/forms/src/services/forms';

interface FarmersListProps {
  config?: ModuleConfig;
}

export default function FarmersList({ config }: FarmersListProps) {
  const navigate = useNavigate();

  // ✅ ACCEDER A VARIABLES DEL MÓDULO DESDE CONFIG.YAML
  const moduleVariables = config?.variables || {};
  const idFormFarmers = moduleVariables.idFormFarmers;
  const apiTimeout = moduleVariables.apiTimeout || 3000;
  const enableCache = moduleVariables.enableCache !== false;

  console.log('📦 Variables del módulo farmers:', {
    idFormFarmers,
    apiTimeout,
    enableCache,
  });

  console.log(config);
  const theme = useTheme();
  const isActiveDesktop = useMediaQuery(theme.breakpoints.down('md'));
  const isActiveButtons = useMediaQuery(theme.breakpoints.up('md'));

  const [orderSelected, setOrderSelected] = useState<string>('A - Z');
  const [statusSelected, setStatusSelected] = useState<string>('Todos');
  // const [tecSelected, setTecSelected] = useState<string>('Técnico 1');
  const [search, setSearch] = useState<string>('');
  const [isRefresh, setIsRefresh] = useState<boolean>(true);
  const [headers, setHeaders] = useState<TableHeadColumn[]>([]);
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);
  const textDebounce = useDebounce(search, 500);
  const [isLoadForm, setIsLoadForm] = useState<boolean>(true);
  const [form, setForm] = useState<Module | null>(null);

  const onLoad = useCallback(
    async (
      page: number,
      perPage: number,
      sortBy: string,
      order: string,
      _search: string,
    ): Promise<AxiosResponse<any>> => {
      let orderBy = 'created_at';
      let status = 'todos';
      let sort = orderSelected === 'A - Z' ? 'asc' : 'desc';
      if (statusSelected === 'Activos') {
        status = 'activo';
      }
      if (statusSelected === 'Inactivos') {
        status = 'inactivo';
      }
      const data = await FarmerService.getAll(
        page,
        perPage,
        orderBy,
        sort,
        textDebounce,
        status,
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

  const handleCloseAction = useCallback((isUpdateDataTable?: boolean) => {
    setIsOpenDialog((open: boolean) => !open);
    if (typeof isUpdateDataTable !== 'object' && isUpdateDataTable) {
      setIsRefresh((prevValue: boolean) => !prevValue);
    }
    //  setUser(undefined);
  }, []);

  const handleViewDetail = (farmerId: number): void => {
    navigate(getDetailRoute(farmerId));
  };

  useEffect(() => {
    const _setHeaders: any = [
      {
        sorteable: false,
        align: 'left',
        text: 'Nombres y apellidos',
        value: 'full_name',
        padding: 'none',
        render: (row: any) => (
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
        value: 'status',
        render: (row: any) => {
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
        value: 'last_transaction_date',
        render: (row: any) => {
          return (
            <>
              {row?.last_visit_date ? (
                <DateCell date={row?.last_visit_date} />
              ) : (
                <>-</>
              )}
            </>
          );
        },
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
                    onClick={() => handleViewDetail(row.id)}
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

  useEffect(() => {
    if (idFormFarmers && idFormFarmers !== '') {
      try {
        setIsLoadForm(true);
        FormService.getById(idFormFarmers).then((resp: any) => {
          if (resp) {
            setForm(resp);
          }
          setIsLoadForm(false);
        });
      } finally {
        setIsLoadForm(false);
      }
    }
  }, [idFormFarmers]);

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
                    component: 'Productores',
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
              {/* <FilterComponent
                buttonLabel={'Técnico'}
                options={['Técnico 1', 'Técnico 2', 'Técnico 3']}
                labelSelected={tecSelected}
                color="primary"
                onSelectOption={function(value: string): void {
                  setTecSelected(value);
                }}
              /> */}
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleCloseAction()}
                fullWidth
                sx={{
                  width: '180px',
                }}
                disabled={isLoadForm}
                text="Agregar productor"
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
      {isOpenDialog && form && (
        <RegisterFormDialog handleClose={handleCloseAction} module={form} />
      )}
    </>
  );
}
