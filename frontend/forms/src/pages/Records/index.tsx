import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Link,
  Paper,
  Tab,
  Tabs,
  Typography,
  // Typography,
  // TypographyProps,
  // styled,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';
// import Breadcrumbs from '@ui/components/molecules/Breadcrumbs/Breadcrumbs';
// import routes from '~/routes/routes';
import DataTable from '@ui/components/organisms/DataTable/ServerSide/DataTable';
import { TableHeadColumn } from '@ui/components/molecules/TableHead/TableHead';
// import { schemaNamesEntities } from '~/atlas';
import { useNavigate, useParams } from 'react-router-dom';

// import useEntity from '~/atlas/entities';
// import DateCell from '~/ui/atoms/DateCell/DateCell';
// import { fCurrency } from '~/utils/formatNumber';
// import { downloadExcel } from '~/utils/downloadExcel';
// import { showMessage } from '~/utils/Messages';
// import Translation from '~/ui/components/shared/translation';
import {
  // DeleteOutlineOutlined,
  RefreshOutlined,
  // RestoreOutlined,
} from '@mui/icons-material';
// import DateRangeSelect from '~/ui/atoms/Date/DateRangeSelect';
// import { useContextAuth } from '~/ui/contexts/AuthContext';
// import { BSON } from 'realm-web';
import { EntityDetail } from '../../models/entities';
// import { sortEntityDetailByOrder } from '@ui/utils/EntityUtils';
import DateRange from '@ui/components/atoms/DateField/DateRange';
import { showMessage } from '@ui/utils/Messages';
import { saveAs } from '@ui/utils/dowloadExcel';
// import useModules from '~/atlas/modules';
import IButton from '@ui/components/atoms/Button/Button';
import MediaViewer from '@ui/components/molecules/MediaComponent/MediaViewer';
// import useMedias from '~/atlas/medias';
// import { getPresignedFile } from '~/service/collection';
import MapComponent from '@ui/components/molecules/MapComponent';
import { getListRoute } from '@/modules/forms';
import { FormService } from '../../services/forms';
import { ModuleConfig } from '@/core/moduleLoader';
// import { StorageService } from '@/services/storage';

// const ChipSelectedStyled = styled(Box)<TypographyProps>(({ theme }) => ({
//   display: 'flex',
//   marginRight: '16px',
//   alignItems: 'center',
//   justifyContent: 'center',
//   padding: '6px 12px  6px  12px',
//   color: theme.palette.primary.main,
//   backgroundColor: '#ECF5FD',
//   borderRadius: '6px',
//   fontSize: '16px',
//   fontWeight: 600
// }));

// type DataRow = {
//   id?: string;
//   entity_name: string;
//   quantity: number;
//   presentation?: string;
//   lot: string;
//   price: number;
//   total_price: number;
//   date: string;
//   status?: string;
//   entity_id_producer?: string;
//   entity_type_producer?: string;
// };

type HeaderType = {
  name: string;
  header_type: string;
  display_name: string;
  header_type_media?: string;
  header_type_map?: string;
  options?: any[];
  order: number;
};

type MediaViewerProps = {
  value: string;
  type_media: string;
};

interface RecordsPageProps {
  config?: ModuleConfig;
}

export default function RecordsPage({ config }: RecordsPageProps) {
  const navigate = useNavigate();
  // eslint-disable-next-line
  // @ts-ignore
  const { form_id } = useParams();
  // schema_name // 'OBJECT' | 'PERSON' | 'ORGANIZATION' | 'COMPLEMENTARY'
  if (!form_id) navigate(getListRoute());
  // if (!id_module) navigate(routes.collection);
  const themes = useTheme();
  // const { organization } = useContextAuth();
  const isActiveDesktop = useMediaQuery(themes.breakpoints.down('md'));
  // const [selectedItems, setSelectedItems] = useState<any[]>([]);
  // const { atlasApp } = useRealmApp();
  // const { getEntitiesPaginate, disabledEntity, restoreEntity } = useEntity(
  //   schemaNamesEntities[schema_name ?? 'COMPLEMENTARY'],
  // );
  // const { getModuleById } = useModules();
  // const { getMediaById } = useMedias();
  const [headers, setHeaders] = useState<TableHeadColumn[]>([]);
  const [headerNames, setHeaderNames] = useState<HeaderType[]>([]);
  const [isLoadData, setIsLoadData] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date(),
  });
  const [search, setSearch] = useState<string>('');
  const [isLoadingDownload, setIsLoadingDownload] = useState<boolean>(false);
  const handleRefresh = useCallback(() => {
    setIsLoadData((prev: boolean) => !prev);
  }, []);
  const [module, setModule] = useState<any>(null);
  const [mediaToShow, setMediaToShow] = useState<MediaViewerProps | null>(null);
  const [isOpenViewer, setIsOpenViewer] = useState<boolean>(false);

  const [mapToShow, setMapToShow] = useState<any>(null);
  const [isOpenMapViewer, setIsOpenMapViewer] = useState<boolean>(false);
  const [tab, setTab] = useState(0);

  const handleCloseMapViewer = useCallback((value: boolean) => {
    setIsOpenMapViewer(value);
  }, []);

  const handleCloseViewer = useCallback((value: boolean) => {
    setIsOpenViewer(value);
  }, []);

  const _processingData = useCallback(async (data: any[]) => {
    try {
      console.log(data);
      // const headers: HeaderType[] = [];
      const newArrElements: any[] = data.map((entity: any) => {
        // const entityDetail: EntityDetail[] = sortEntityDetailByOrder(
        //   entity.detail ?? [],
        // );
        // console.log(entity.detail);
        // console.log(entity);
        const newDataRow: any = {
          id: entity._id,
          disabled_at: entity.disabled_at ?? null,
        };
        entity.detail.forEach((detail: EntityDetail) => {
          if (detail.type_value !== 'geojson') {
            // si esta en la lista de headers no lo agrego
            // if (headers.findIndex((item) => item.name === detail.name) === -1) {
            //   headers.push({
            //     name: detail.name,
            //     display_name: detail.display_name,
            //     header_type:
            //       typeof detail.value === 'string' &&
            //       detail.value.includes('geojson')
            //         ? 'geojson'
            //         : detail.type_value,
            //     header_type_media: detail.type_media,
            //     options: detail.option,
            //   });
            // }
            if (detail.type_value === 'entity') {
              // console.log(detail);
              let str = '-';
              if (typeof detail.value === 'object') {
                str = detail?.value?.display_name ?? '-';
              }
              if (Array.isArray(detail.value)) {
                str =
                  detail?.value?.map((v: any) => v.display_name).join(', ') ??
                  '-';
              }

              newDataRow[detail.name] = str;
              // const relation =
              //   entity.entity_relations &&
              //   entity.entity_relations.find(
              //     (value: any) => value.detail_id === detail.id,
              //   );
              // if (relation) {
              //   newDataRow[detail.name] = relation.representative_value;
              // }
            } else if (detail.type_value === 'date') {
              // formateo la fecha a dd-mm-yyyy si es de tipo date
              if (!detail.value) {
                newDataRow[detail.name] = '';
              } else {
                const date = new Date(detail.value).toLocaleDateString('es-ES');

                if (date !== 'Invalid Date') {
                  newDataRow[detail.name] = date.split('/').join('-');
                } else {
                  newDataRow[detail.name] = detail.value ?? '';
                }
              }
            } else {
              // quiero qu si puede ser un array el value se muestre separado por , los valores sino el valor
              // para eso el value ,lo deserializo como array
              try {
                const value = JSON.parse(detail.value);
                if (value && Array.isArray(value)) {
                  newDataRow[detail.name] = value.join(', ');
                } else {
                  newDataRow[detail.name] = detail.value ?? '';
                }
              } catch {
                newDataRow[detail.name] = detail.value ?? '';
              }
            }
          }
        });
        if (entity.created_at) {
          newDataRow['Fecha de creación'] = formatInTimeZone(
            new Date(entity.created_at ?? ''),
            'America/Lima',
            'MM/dd/yyyy HH:mm:ss',
            {
              locale: es,
            },
          );
        }
        return newDataRow;
      });
      // const headerDate: HeaderType = {
      //   name: 'Fecha de creación',
      //   display_name: 'Fecha de creación',
      //   header_type: 'date',
      // };
      // if (data.length > 0) {
      //   headers.push(headerDate);
      // }
      // console.log(headers);

      // setHeaderNames(headers);
      console.log(newArrElements);
      return newArrElements;
    } catch (error) {
      console.log(error);
      return [];
    }
  }, []);

  const _paginateLots = useCallback(
    async (
      page: number,
      per_page: number,
      _sort_by: string,
      _order: string,
      search: string,
    ) => {
      setSearch(search);
      // const order: any = {
      //   created_at: -1,
      // };

      let start = '';
      let end = '';
      // console.log(dateRange);
      if (dateRange) {
        const startDate = new Date(
          dateRange?.startDate || new Date(new Date().getFullYear(), 0, 1),
        );
        const endDate = new Date(dateRange?.endDate || new Date());

        // al startDate le pongo el inicio del día
        if (startDate && dateRange?.startDate) {
          startDate.setHours(0, 0, 0, 0);
          // console.log(startDate);
        }
        // al endDate le pongo el final del día
        if (endDate && dateRange?.endDate) {
          endDate.setHours(23, 59, 59, 999);
          // console.log(endDate);
        }

        start = startDate.toISOString().slice(0, 10);
        end = endDate.toISOString().slice(0, 10);
        // console.log(start);
        // console.log(end);
      }
      // console.log(filters);

      const get = await FormService.getRegistersByFormId(
        form_id ?? '',
        page,
        per_page,
        'created_at',
        'desc',
        search,
        start,
        end,
      );
      const { items, total } = get;
      console.log(items);
      if (items) {
        let newItems = [];
        newItems = await _processingData(items);
        // console.log(newItems);
        return {
          data: {
            data: {
              items: newItems,
              total: total, // Total de documentos que cumplen con el filtro
              page: page,
              per_page: per_page,
            },
          },
        };
      }
      // _processingData,

      // console.log(get);
      return get;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tab, form_id, dateRange],
  );

  // const getSignedUrl = async (key: string): Promise<string> => {
  //   if (!key) return '';
  //   return new Promise<string>((resolve, reject) => {
  //     resolve('');
  //     StorageService.presignedDownload(`${key}`, false)
  //       .then((response) => {
  //         console.log(response);
  //         const { url_presigned } = response?.data?.data;
  //         resolve(url_presigned);
  //       })
  //       .catch((error) => {
  //         reject(error);
  //       });
  //   });
  // };

  // const loadImageUrl = useCallback(async (element: any) => {
  //   try {
  //     if (!element?.value) return '';
  //     const media = await StorageService.getMediaById(element?.value);
  //     console.log(media);
  //     // return '';
  //     if (media && media.path) {
  //       // setMedia(media);
  //       const url: string = await getSignedUrl(media.path);
  //       return url;
  //     }
  //   } catch (error) {
  //     return '';
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const handleDownloadData = useCallback(async () => {
    if (!form_id) return;
    setIsLoadingDownload(true);
    FormService.exportFormsToExcel(
      form_id,
      'created_at',
      'desc',
      search,
      '',
      '',
      50,
    )
      .then((resp: any) => {
        // console.log(resp);
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
      })
      .finally(() => {
        setIsLoadingDownload(false);
      });
  }, []);
  // const handleDownloadData = useCallback(async () => {
  //   setIsLoadingDownload(true);
  //   // console.log(headers);
  //   const totalHeaders = headers.map(
  //     (element: TableHeadColumn) => element.text,
  //   );
  //   const mediaHeaders: any[] = headers.filter(
  //     (element: any) => element.header_type === 'media',
  //   );
  //   // console.log(mediaHeaders);
  //   const colsWch: any[] = [];
  //   const newHeaders = totalHeaders.map((element: any) => {
  //     colsWch.push({ wch: `${element ?? ''}`.toString().length + 8 });
  //     return element;
  //   });

  //   const pageSize = 1000;
  //   let page = 1;
  //   let allRows: DataRow[] = [];
  //   let hasMore = true;

  //   while (hasMore) {
  //     // Llama a la función de paginación con los filtros actuales
  //     const response = await _paginateLots(
  //       page,
  //       pageSize,
  //       'created_at',
  //       'desc',
  //       search,
  //     );
  //     // response debe devolver un objeto con los datos y el total
  //     const { items: data, total } = response?.data?.data;

  //     if (Array.isArray(data)) {
  //       allRows = allRows.concat(data);
  //       page++;
  //       hasMore = allRows.length < total;
  //     } else {
  //       hasMore = false;
  //     }
  //   }

  //   const newRows = await Promise.all(
  //     allRows.map(async (row: DataRow) => {
  //       delete row.id;
  //       delete row.entity_id_producer;
  //       delete row.entity_type_producer;
  //       delete row.presentation;
  //       delete row.status;
  //       const newRow = Object.assign({}, row);

  //       const values = await Promise.all(
  //         Object.entries(newRow).map(async ([key, value]) => {
  //           const mediaHead = mediaHeaders.find((item) => item.value === key);
  //           if (mediaHead) {
  //             return await loadImageUrl({
  //               value,
  //               type_media: mediaHead.header_type_media,
  //             });
  //           }
  //           return Array.isArray(value) ? value.join(', ') : value;
  //         }),
  //       );

  //       return values;
  //     }),
  //   );
  //   // console.log(newHeaders);
  //   // console.log(newRows);
  //   const sheetName = (module?.name ?? '').substring(0, 25);
  //   console.log('newHeaders', newHeaders);
  //   console.log('newRows', newRows);
  //   // downloadExcel(
  //   //   sheetName ?? '',
  //   //   `${sheetName ?? ''}.xlsx`,
  //   //   [newHeaders, ...newRows],
  //   //   colsWch,
  //   // );
  //   setIsLoadingDownload(false);
  // }, [headers, module?.name, _paginateLots, search, loadImageUrl]);

  // const handleDelete = useCallback(
  //   async (row: DataRow) => {
  //     const { id } = row;
  //     // console.log(row);
  //     const result: boolean = await showYesNoQuestion(
  //       '¿Está seguro de que desea eliminar el registro?',
  //       '',
  //       'warning',
  //       false,
  //       ['Cancelar', 'Eliminar'],
  //     );
  //     if (result && id) {
  //       console.log('disabledEntity', id);
  //       // disabledEntity(id)
  //       //   .then(() => {
  //       //     // deshabilitar movimiento
  //       //     // disableMovementByReference(id);
  //       //     handleRefresh();
  //       //     showMessage('', 'Se eliminó correctamente', 'success', false);
  //       //   })
  //       //   .catch(() => {
  //       //     showMessage(
  //       //       '',
  //       //       'No se pudo eliminar el registro correctamente',
  //       //       'warning',
  //       //       true,
  //       //     );
  //       //   });
  //     }
  //   },
  //   [handleRefresh],
  // );

  // const handleRestore = useCallback(
  //   async (row: DataRow) => {
  //     const { id } = row;
  //     const result: boolean = await showYesNoQuestion(
  //       '¿Está seguro de que desea restaurar el registro?',
  //       '',
  //       'warning',
  //       false,
  //       ['Cancelar', 'Restaurar'],
  //     );
  //     if (result && id) {
  //       console.log('restoreEntity', id);
  //       // restoreEntity(id)
  //       //   .then(() => {
  //       //     // habilitar movimiento
  //       //     // enableMovementByReference(id);
  //       //     handleRefresh();
  //       //     showMessage('', 'Se restauró correctamente', 'success', false);
  //       //   })
  //       //   .catch(() => {
  //       //     showMessage(
  //       //       '',
  //       //       'No se pudo restaurar el registro correctamente',
  //       //       'warning',
  //       //       true,
  //       //     );
  //       //   });
  //     }
  //   },
  //   [handleRefresh],
  // );

  // const handleDateRangeChange = (range: { startDate: Date; endDate: Date } | null) => {
  //   //filtro el datarows con el rango de fechas
  //   if (range && range.startDate && range.endDate) {
  //     setFilteredDataRows(
  // eslint-disable-next-line max-len
  //       dataRows.filter((row: DataRow) => new Date(row.date) >= range.startDate && new Date(row.date) <= range.endDate)
  //     );
  //   } else {
  //     setFilteredDataRows(dataRows);
  //   }
  // };
  useEffect(() => {
    if (form_id) {
      FormService.getById(form_id)
        .then((resp: any) => {
          console.log(resp);
          const headers: HeaderType[] = [];
          // crear los headers a partir del schema
          // recorro el schema y las instructions
          if (resp.schema && resp.schema.instructions) {
            resp.schema.instructions.forEach((element: any) => {
              if (element && element.schema_gather) {
                headers.push({
                  name: element?.schema_gather?.name,
                  display_name:
                    element?.metadata?.data_input?.title ??
                    element?.schema_gather?.name,
                  header_type: element?.schema_gather?.type_value,
                  header_type_media: element?.schema_gather?.type_media,
                  options: element?.schema_gather?.options,
                  order: +element?.schema_gather?.is_visual_table || 0,
                });
              }
            });
            const headerDate: HeaderType = {
              name: 'Fecha de creación',
              display_name: 'Fecha de creación',
              header_type: 'date',
              order: -1,
            };
            headers.push(headerDate);
            console.log('newHeaders', headers);
            const sorted = headers.sort((a, b) => {
              const getPriority = (item: any) => {
                if (item.order === -1) return 3; // último siempre
                if (item.order === 0 || item.order == null) return 2; // medio
                return 1; // positivos
              };

              const priorityA = getPriority(a);
              const priorityB = getPriority(b);

              // primero por prioridad
              if (priorityA !== priorityB) {
                return priorityA - priorityB;
              }

              // si ambos son positivos, ordena por order
              if (priorityA === 1) {
                return a.order - b.order;
              }

              return 0;
            });
            console.log(sorted);
            setHeaderNames(sorted);
          }
          setModule(resp);
        })
        .catch((_err: any) => {
          showMessage('', 'Problemas al cargar los datos.', 'error');
          navigate(getListRoute());
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form_id]);

  useEffect(() => {
    // console.log(headerNames);
    // crear los headers de la tabla según los datos que vengan( sera dinámico , si no tienen datos sera nulo)
    if (headerNames.length === 0) {
      const _setHeaders: any = [
        {
          sorteable: true,
          align: 'left',
          text: 'sin datos',
          value: 'sin datos',
          padding: 'none',
        },
      ];
      setHeaders(_setHeaders);
    } else {
      const _setHeaders: any = headerNames.map((header: HeaderType) => {
        // console.log(header);
        if (header.header_type === 'geojson') {
          return {
            sorteable: true,
            align: 'left',
            text: header.display_name,
            value: header.name,
            minWidth: '80px',
            padding: 'none',
            header_type: header.header_type,
            render: (row: any) => {
              try {
                if (row[header.name]) {
                  const parseValue = JSON.parse(row[header.name]);
                  let value = null;
                  if (parseValue?.geojson) {
                    value = parseValue.geojson;
                  }

                  return (
                    <Box
                      display={'flex'}
                      sx={{
                        '&:hover': {
                          cursor: 'pointer',
                        },
                      }}
                      justifyContent={'flex-start'}
                      alignItems={'center'}
                    >
                      <Link
                        onClick={() => {
                          setMapToShow(value);
                          setIsOpenMapViewer(true);
                        }}
                      >
                        Ver mapa
                      </Link>
                    </Box>
                  );
                }
                return <></>;
              } catch (error) {
                // console.log(row);
                // console.log(error);
                return <></>;
              }

              // <>{row[header.name]}</>;
            },
          };
        }
        if (header.header_type === 'media') {
          return {
            sorteable: true,
            align: 'left',
            text: header.display_name,
            value: header.name,
            minWidth: '80px',
            padding: 'none',
            header_type: header.header_type,
            header_type_media: header.header_type_media,
            render: (row: any) => {
              return (
                <Box
                  display={'flex'}
                  sx={{
                    '&:hover': {
                      cursor: 'pointer',
                    },
                  }}
                  justifyContent={'flex-start'}
                  alignItems={'center'}
                >
                  <Link
                    onClick={() => {
                      setMediaToShow({
                        value: row[header.name],
                        type_media: header?.header_type_media ?? '',
                      });
                      setIsOpenViewer(true);
                    }}
                  >
                    Ver
                  </Link>
                </Box>
              );

              // <>{row[header.name]}</>;
            },
          };
        }

        if (header.header_type === 'option') {
          return {
            sorteable: true,
            align: 'left',
            text: header.display_name,
            value: header.name,
            header_type: header.header_type,
            padding: 'none',
            render: (row: any) => {
              const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
              // valido si el row[header.name] es un uuid
              if (regex.test(row[header.name]) && header.options) {
                // busco en las opciones del header
                const option = header.options.find(
                  (option: any) => option.id === row[header.name],
                );
                if (option) {
                  return option?.value ?? '';
                }
                // console.log(row);
              }
              return row[header.name];
            },
          };
        }
        if (header.header_type === 'entity') {
          return {
            sorteable: true,
            align: 'left',
            text: header.display_name,
            value: header.name,
            header_type: header.header_type,
            padding: 'none',
            render: (row: any) => {
              // console.log(row);
              // const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
              // // valido si el row[header.name] es un uuid
              // if (regex.test(row[header.name]) && header.options) {
              //   // busco en las opciones del header
              //   const option = header.options.find(
              //     (option: any) => option.id === row[header.name],
              //   );
              //   if (option) {
              //     return option?.value ?? '';
              //   }
              //   // console.log(row);
              // }

              return row[header.name];
            },
          };
        }

        return {
          sorteable: false,
          align: 'left',
          text: header.display_name,
          value: header.name,
          header_type: header.header_type,
          padding: 'none',
        };
      });
      // _setHeaders.push({
      //   sorteable: true,
      //   align: 'left',
      //   text: 'Acciones',
      //   padding: 'none',
      //   value: 'actions',
      //   render: (row: any) => {
      //     // console.log(row);
      //     return (
      //       <>
      //         {row?.disabled_at === null ? (
      //           <Tooltip title="Eliminar registro">
      //             <IconButton
      //               onClick={() => handleDelete(row)}
      //               sx={{
      //                 color: '#EF4444',
      //                 fontSize: '16px',
      //                 marginLeft: '8px',
      //                 marginRight: '8px',
      //               }}
      //             >
      //               <DeleteOutlineOutlined />
      //             </IconButton>
      //           </Tooltip>
      //         ) : (
      //           <Tooltip title="Restaurar registro">
      //             <IconButton
      //               onClick={() => handleRestore(row)}
      //               sx={{
      //                 // color: '#',
      //                 fontSize: '16px',
      //                 marginLeft: '8px',
      //                 marginRight: '8px',
      //               }}
      //             >
      //               <RestoreOutlined />
      //             </IconButton>
      //           </Tooltip>
      //         )}
      //       </>
      //     );
      //   },
      // });
      setHeaders(_setHeaders);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerNames]);

  return (
    <>
      <Grid container={true} spacing={1}>
        <Grid
          size={12}
          style={{
            display: 'flex',
            flexDirection: isActiveDesktop ? 'column' : 'row',
            justifyContent: 'space-between',
          }}
        >
          <Box my={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {module?.name ?? 'Módulo'}
            </Typography>
          </Box>
        </Grid>
        {/* <Grid item xs={12} display={'flex'} sx={{ height: '80px' }}>
          <DateRangeSelect
            onChange={handleDateRangeChange}
            dateDisplayFormat="dd MMM yyyy"
            definedRangeProps={{
              inputRanges: []
            }}
          />
        </Grid> */}
        <Grid size={12}>
          <Paper elevation={2} style={{ padding: '20px', marginTop: '10px' }}>
            <Tabs
              value={tab}
              onChange={(_, v) => {
                setTab(v);
                handleRefresh();
              }}
              sx={{ mb: 2 }}
            >
              <Tab label="Registros" sx={{ fontSize: '14px' }} />
              {/* <Tab label="Registros Eliminados" sx={{ fontSize: '14px' }} /> */}
            </Tabs>
            {tab === 0 && (
              <DataTable
                headers={headers}
                onLoad={_paginateLots}
                fullWidthSearch
                sizeSearch="small"
                refresh={isLoadData}
                // isSelect
                // checkValidateField={(row: any) => !row.status || (row.status && row.status !== 'SUCCESSFUL')}
                // handleSelects={handleSelects}
                // refreshSelect={refreshSelect}
                headComponent={(searchComponent: React.ReactChild) => (
                  <>
                    <Box
                      display={'flex'}
                      flexDirection={{ xs: 'column', md: 'row' }}
                      width={'100%'}
                    >
                      {searchComponent}
                      <Box
                        display={'flex'}
                        flexDirection={{ xs: 'column', md: 'row' }}
                        alignItems={'center'}
                        justifyContent={'space-between'}
                        sx={{
                          marginInline: { xs: '0px', md: '8px' },
                          marginTop: { xs: '8px', md: '0px' },
                        }}
                      >
                        <Box
                          display={'flex'}
                          alignItems={'center'}
                          width={'100%'}
                        >
                          <DateRange
                            startDate={dateRange?.startDate}
                            endDate={dateRange?.endDate}
                            onChange={(range) => {
                              setDateRange(range);
                            }}
                          />
                        </Box>
                        <IButton
                          text="Descargar archivo XLSX"
                          sx={{
                            mt: { xs: 1, md: 0 },
                            marginLeft: 1,
                            marginRight: 1,
                            minWidth: '200px',
                          }}
                          isLoading={isLoadingDownload}
                          disabled={isLoadingDownload}
                          variant="contained"
                          onClick={handleDownloadData}
                        />

                        <Button
                          sx={{
                            width: '100%',
                            minWidth: '64px',
                            mt: { xs: 1, md: 0 },
                          }}
                          variant="contained"
                          onClick={() => handleRefresh()}
                        >
                          <RefreshOutlined />
                        </Button>
                      </Box>
                    </Box>
                    {/* {selectedItems.length > 0 && (
                    <Box
                      display={'flex'}
                      flexDirection={{ xs: 'column', md: 'row' }}
                      sx={{ paddingBlock: '8px' }}
                      width={'100%'}
                    >
                      <ChipSelectedStyled>
                        <Typography>{selectedItems.length} Seleccionados</Typography>
                      </ChipSelectedStyled>
                    </Box>
                  )} */}
                  </>
                )}
              />
            )}
            {tab === 1 && (
              <DataTable
                headers={headers}
                onLoad={_paginateLots}
                refresh={isLoadData}
                hideSearch
                // isSelect
                // checkValidateField={(row: any) => !row.status || (row.status && row.status !== 'SUCCESSFUL')}
                // handleSelects={handleSelects}
                // refreshSelect={refreshSelect}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
      {isOpenViewer && (
        <MediaViewer
          element={mediaToShow}
          open={isOpenViewer}
          handleClose={handleCloseViewer}
        />
      )}
      {isOpenMapViewer && (
        <MapComponent
          handleClose={handleCloseMapViewer}
          open={isOpenMapViewer}
          value={mapToShow}
        />
      )}
    </>
  );
}
