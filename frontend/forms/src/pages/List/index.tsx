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
import {
  getCreateRoute,
  getEditRoute,
  getRecordsRoute,
  getUpdateRoute,
} from '../../../index';
import FilterComponent from '@ui/components/molecules/FilterComponent';
import { useCallback, useEffect, useState } from 'react';
import {
  Add,
  Delete,
  Download,
  Edit,
  PlusOne,
  Upload,
  Visibility,
} from '@mui/icons-material';
import { TableHeadColumn } from '@/ui/components/molecules/TableHead/TableHead';
import DataTable from '@/ui/components/organisms/DataTable/ServerSide/DataTable';
import { AxiosResponse } from 'axios';
import DateCell from '@/ui/components/atoms/DateCell/DateCell';
import Breadcrumbs from '@/ui/components/molecules/Breadcrumbs/Breadcrumbs';
import TextFieldSearch from '@/ui/components/molecules/TextFieldSearch/TextFieldSearch';
import Button from '@/ui/components/atoms/Button/Button';
import { ApiClient } from '@/core/apiClient';
import RegisterFormDialog from '../../components/RegisterFormDialog';
import { Module } from '../../models/forms';
import { FormService } from '../../services/forms';

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
// const DAYS_ACTIVE = 15;
// Datos dummy de agricultores
const dummyForms: Form[] = [
  {
    id: '1',
    channel_name: 'form1',
    flow_type: 'form',
    name: 'Formulario 1',
    image_path:
      'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
    description: 'Descripción del formulario 1',
    schema_id: '1',
    viewer: 'viewer1',
    entity_name: 'forms',
    created_at: '2023-03-01T00:00:00.000Z',
  },
  {
    id: '2',
    channel_name: 'form2',
    flow_type: 'form',
    name: 'Formulario 2',
    image_path:
      'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
    description: 'Descripción del formulario 2',
    schema_id: '2',
    viewer: 'viewer2',
    entity_name: 'forms',

    created_at: '2023-03-01T00:00:00.000Z',
  },
  {
    id: '3',
    channel_name: 'form3',
    flow_type: 'form',
    name: 'Formulario 3',
    image_path:
      'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
    description: 'Descripción del formulario 3',
    schema_id: '3',
    viewer: 'viewer3',
    entity_name: 'forms',

    created_at: '2023-03-01T00:00:00.000Z',
  },
  {
    id: '4',
    channel_name: 'form4',
    flow_type: 'form',
    name: 'Formulario 4',
    image_path:
      'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
    description: 'Descripción del formulario 4',
    schema_id: '4',
    viewer: 'viewer4',
    entity_name: 'forms',
    created_at: '2023-03-01T00:00:00.000Z',
  },
  {
    id: '5',
    channel_name: 'form5',
    flow_type: 'form',
    name: 'Formulario 5',
    image_path:
      'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
    description: 'Descripción del formulario 5',
    schema_id: '5',
    viewer: 'viewer5',
    entity_name: 'forms',

    created_at: '2023-03-01T00:00:00.000Z',
  },
  {
    id: '6',
    channel_name: 'form6',
    flow_type: 'form',
    name: 'Formulario 6',
    image_path:
      'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',

    description: 'Descripción del formulario 6',
    schema_id: '6',
    viewer: 'viewer6',
    entity_name: 'forms',
    created_at: '2023-03-01T00:00:00.000Z',
  },
];

export default function FormsList({ config }: FormsListProps) {
  const navigate = useNavigate();
  // const [api] = useState(
  //   () =>
  //     new ApiClient(
  //       config?.apiUrl || 'http://127.0.0.1:8000',
  //       config?.backendModule || 'forms',
  //     ),
  // );
  // console.log(config);
  const theme = useTheme();
  const isActiveDesktop = useMediaQuery(theme.breakpoints.down('md'));
  const isActiveButtons = useMediaQuery(theme.breakpoints.up('md'));
  const [form, setForm] = useState<Module | null>(null);
  // const [orderSelected, setOrderSelected] = useState<string>('A - Z');
  // const [statusSelected, setStatusSelected] = useState<string>('Todos');
  // const [tecSelected, setTecSelected] = useState<string>('Técnico 1');
  const [isRefresh, setIsRefresh] = useState<boolean>(true);
  const [headers, setHeaders] = useState<TableHeadColumn[]>([]);
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);

  const onLoad = useCallback(
    async (
      page: number,
      perPage: number,
      orderBy: string,
      order: string,
      search: string,
    ): Promise<AxiosResponse<any>> => {
      console.log(page, perPage, orderBy, order, search);
      const data = await FormService.getAll();

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

  const handleCreateForm = (): void => {
    navigate(getCreateRoute());
  };

  const handleOpenDialog = (): void => {
    setIsOpenDialog(true);
  };

  const handleUpdateForm = (id: string): void => {
    navigate(getUpdateRoute(id));
  };
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
        sorteable: true,
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
                    onClick={() => navigate(getRecordsRoute(row.id))}
                    size="small"
                  >
                    <Visibility />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Editar formulario">
                  <IconButton
                    onClick={() => navigate(getEditRoute(row.id))}
                    size="small"
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Crear registro">
                  <IconButton
                    onClick={() => {
                      setForm(row);
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
                  throw new Error('Function not implemented.');
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
        // onLoad={function (
        //   page: number,
        //   perPage: number,
        //   orderBy: string,
        //   order: string,
        //   search: string
        // ): Promise<AxiosResponse<any>> {
        //   console.log(page, perPage, orderBy, order, search);
        //   return new Promise((resolve) => {
        //     const obj: AxiosResponse<any> = {
        //       data: {
        //         data: {
        //           items: dummyForms,
        //           total: dummyForms.length,
        //         },
        //       },
        //       status: 200,
        //       statusText: 'OK',
        //       headers: {},
        //       config: {} as any,
        //     };
        //     console.log(obj);
        //     resolve(obj);
        //   });
        // }}
      />
      {isOpenDialog && form && (
        <RegisterFormDialog handleClose={handleCloseAction} module={form} />
      )}
    </>
  );
}
