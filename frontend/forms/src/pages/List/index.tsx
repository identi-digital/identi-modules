// Ruta principal: Lista de agricultores
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  useMediaQuery,
  useTheme,
  // Chip,
  Tooltip,
  IconButton,
  Icon,
} from '@mui/material';
import { ModuleConfig } from '@core/moduleLoader';
import {
  getCreateRoute,
  getEditRoute,
  getRecordsRoute,
  // getUpdateRoute,
} from '../../../index';
// import FilterComponent from '@ui/components/molecules/FilterComponent';
import { useCallback, useEffect, useState } from 'react';
import {
  Add,
  // Delete,
  // Download,
  Edit,
  // PlusOne,
  // Upload,
  Visibility,
} from '@mui/icons-material';
import { TableHeadColumn } from '@/ui/components/molecules/TableHead/TableHead';
import DataTable from '@/ui/components/organisms/DataTable/ServerSide/DataTable';
import { AxiosResponse } from 'axios';
import DateCell from '@/ui/components/atoms/DateCell/DateCell';
import Breadcrumbs from '@/ui/components/molecules/Breadcrumbs/Breadcrumbs';
import TextFieldSearch from '@/ui/components/molecules/TextFieldSearch/TextFieldSearch';
import Button from '@/ui/components/atoms/Button/Button';
// import { ApiClient } from '@/core/apiClient';
import RegisterFormDialog from '../../components/RegisterFormDialog';
import { Module } from '../../models/forms';
import { FormService } from '../../services/forms';
import useDebounce from '@/ui/hooks/use_debounce';
import {
  trackAddRecord,
  trackCreateForm,
  trackEditForm,
  trackSearchForms,
  trackViewForm,
} from '../../analytics/forms/track';

interface FormsListProps {
  config?: ModuleConfig;
}

interface Form {
  id: string;
  channel_name: string;
  flow_type: string;
  name: string;
  image_path: string;
  description: string;
  schema_id: string;
  viewer: string;
  entity_name: string;
  form_purpose?: string;
  created_at: string;
  updated_at?: string;
  disabled_at?: string;
}

export default function FormsList({ config }: FormsListProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isActiveDesktop = useMediaQuery(theme.breakpoints.down('md'));
  const isActiveButtons = useMediaQuery(theme.breakpoints.up('md'));
  const [form, setForm] = useState<Module | null>(null);
  // const [orderSelected, setOrderSelected] = useState<string>('A - Z');
  // const [statusSelected, setStatusSelected] = useState<string>('Todos');
  // const [tecSelected, setTecSelected] = useState<string>('Técnico 1');
  const [searchText, setSearchText] = useState<string>('');
  const [isRefresh, setIsRefresh] = useState<boolean>(true);
  const [headers, setHeaders] = useState<TableHeadColumn[]>([]);
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);
  const textDebounce = useDebounce(searchText, 500);

  const onLoad = useCallback(
    async (
      page: number,
      perPage: number,
      orderBy: string,
      order: string,
      _search: string,
    ): Promise<AxiosResponse<any>> => {
      if (textDebounce !== '') {
        trackSearchForms({});
      }
      // console.log(page, perPage, orderBy, order, search);
      const data = await FormService.getAll(
        page,
        perPage,
        orderBy,
        order,
        textDebounce,
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
    [textDebounce], // 👈 sin dependencias → no se recrea
  );

  const handleCreateForm = (): void => {
    trackCreateForm({});
    navigate(getCreateRoute());
  };

  const handleOpenDialog = (): void => {
    setIsOpenDialog(true);
  };

  // const handleUpdateForm = (id: string): void => {
  //   navigate(getUpdateRoute(id));
  // };
  const handleCloseAction = useCallback((isUpdateDataTable?: boolean) => {
    setIsOpenDialog((open: boolean) => !open);
    if (typeof isUpdateDataTable !== 'object' && isUpdateDataTable) {
      setIsRefresh((prevValue: boolean) => !prevValue);
    }
    //  setUser(undefined);
  }, []);

  useEffect(() => {
    const _setHeaders: any = [
      {
        sorteable: false,
        align: 'left',
        text: 'Nombre del formulario',
        value: 'full_name',
        padding: 'none',
        render: (row: Form) => <>{row.name}</>,
      },
      {
        sorteable: false,
        align: 'left',
        text: 'Detalle',
        value: 'full_name',
        padding: 'none',
        render: (row: Form) => <>{row.description}</>,
      },
      {
        sorteable: false,
        align: 'left',
        text: 'Último registro',
        padding: 'none',
        value: 'last_transaction_date',
        render: (row: Form) => {
          return (
            <>
              {row?.created_at ? <DateCell date={row?.created_at} /> : <>-</>}
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
                <Tooltip title="Ver formulario">
                  <IconButton
                    onClick={() => {
                      trackViewForm({
                        form_id: row.id,
                      });
                      navigate(getRecordsRoute(row.id));
                    }}
                    size="small"
                  >
                    <Visibility />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Editar formulario">
                  <IconButton
                    onClick={() => {
                      trackEditForm({
                        form_id: row.id,
                      });
                      navigate(getEditRoute(row.id));
                    }}
                    size="small"
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Crear registro">
                  <IconButton
                    onClick={() => {
                      setForm(row);
                      trackAddRecord({
                        form_id: row.id,
                      });
                      handleOpenDialog();
                    }}
                    size="small"
                  >
                    <Add />
                  </IconButton>
                </Tooltip>
                {/* <Tooltip title="Carga masiva">
                  <IconButton
                    onClick={() => console.log(row)}
                    size="small"
                    //   variant="contained"
                    // color="error"
                    //   style={{ width: '140px', height: '30px' }}
                    //   startIcon={<Delete />}
                  >
                    <Upload />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Descargar datos">
                  <IconButton
                    onClick={() => console.log(row)}
                    size="small"
                    //   variant="contained"
                    // color="error"
                    //   style={{ width: '140px', height: '30px' }}
                    //   startIcon={<Delete />}
                  >
                    <Download />
                  </IconButton>
                </Tooltip> */}
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
                    component: 'Formularios',
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
                  setSearchText(value);
                  // throw new Error('Function not implemented.');
                }}
              />
              {/* </Box> */}

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleCreateForm()}
                fullWidth
                sx={{
                  width: '180px',
                }}
                text="Crear formulario"
                color="secondary"
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
      <DataTable
        headers={headers}
        hideSearch={true}
        onLoad={onLoad}
        refresh={isRefresh}
      />
      {isOpenDialog && form && (
        <RegisterFormDialog handleClose={handleCloseAction} module={form} />
      )}
    </>
  );
}
