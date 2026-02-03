import React, { useCallback, useEffect, useState } from 'react';
// import useGathering from '~/atlas/gathering';
import DataTable from '@ui/components/organisms/DataTable/ServerSide/DataTable';
import { TableHeadColumn } from '@ui/components/molecules/TableHead/TableHead';
// import Translation from '~/ui/components/shared/translation';
import {
  Box,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  DeleteRounded,
  EditRounded,
  LockResetRounded,
  ScaleOutlined,
} from '@mui/icons-material';
import { fCurrency } from '@ui/utils/formatNumber';
import DateCell from '@ui/components/atoms/DateCell/DateCell';
// import { getDetailValue, getRepresentativeValue, getStoreNameFromRelations } from '~/utils/EntityUtils';
import { showMessage, showYesNoQuestion } from '@ui/utils/Messages';
import SalesTable from '../../../components/SalesTable';
// import { ContextLayout } from '~/ui/templates/Layouts/Layout';
// import { ChangeHistory, Entity, EntityDetail } from '~/models/entities';
import SelectField from '@ui/components/atoms/SelectField/SelectField';
// import { modulesConfig } from '~/atlas/modules/modulesConfig';
import EditEntityDetail from '../../../components/AssignNetWeight';
import EditNameDialog from '../../../components/EditNameDialog';
// import useEntity from '~/atlas/entities';
// import { schemaNamesEntities } from '~/atlas';
import { useAuth } from '@/core/auth/AuthContext';
import { GatheringService } from '../../../services/gathering';
import { AxiosResponse } from 'axios';
// import useDebounce from '@/ui/hooks/use_debounce';
import { LotService } from '../../../services/lots';

// import { EntityDetail } from '~models/entities';

type LotsViewProps = {
  view: number; //0 activos, 1 en stock, 2 despachados, 3 eliminados
  // lots: any[];
  // statesArray: string[];
  // handleChangeData: () => void;
  handleChangeTab: (event: any, newValue: number) => void;
  gathering_id?: string;
  store_center_id?: string;
  // setStats: (stats: any) => void;
  // handleToDownload: (name: string, headers: string[], newRows: any[]) => void;
  // getEntitiesPaginate: (
  //   page: number,
  //   limit: number,
  //   order: any,
  //   filters?: any,
  //   onLoad?: any,
  // ) => Promise<any>;
  handleSelects?: (selected: any[]) => void;
};

// sale
export type SaleRow = {
  code: string;
  producer_name: string;
  producer_dni: string;
  farm_name: string;
  quantity: number;
  presentation: string;
  price: number;
  payment_method?: string;
  date: string;
  total_amount: number; //total
};

// lot
export type DataRow = {
  id: string;
  objectId: string;
  name: string;
  // nameDetail: any;
  gross_weight: number;
  net_weight: number;
  // netWeightDetail: any;
  date: string;
  disabled_at: string;
  gatherer_name: string;
  type: string;
  certifications: string;
  cost: number;
  state: string;
  // stateDetail: any;
  process: string;
  // processDetail: any;
  sales: SaleRow[];
  store?: string;
};

const LotsView: React.FC<LotsViewProps> = (props: LotsViewProps) => {
  const {
    view,
    // lots,
    // statesArray,
    // handleChangeData,
    handleSelects,
    gathering_id,
    store_center_id,
    handleChangeTab,
    // getEntitiesPaginate,
  } = props;
  // const { addDetailHistory } = useEntity(schemaNamesEntities['OBJECT']);

  // const {
  //   disabledLot,
  //   getSalesOfLotsById,
  //   saveOneDetail,
  //   saveOrAddOneDetail,
  //   recoverLot,
  // } = useGathering();
  const [headers, setHeaders] = useState<TableHeadColumn[]>([]);
  const { user } = useAuth();
  // console.log(user);
  // cambios peso neto
  const [openChangeDetail, setOpenChangeDetail] = useState<boolean>(false);
  const [lotIdToChange, setLotIdToChange] = useState<string>('');
  const [isRefresh, setIsRefresh] = useState<boolean>(false);
  const [lotSelected, setLotSelected] = useState<any>(null);

  const [openChangeNameDetail, setOpenChangeNameDetail] = useState<boolean>(
    false,
  );
  // const [entityIdToChange, setEntityIdToChange] = useState<string>('');
  const [nameDetail, setNameDetail] = useState<any | null>(null);
  // const [search, setSearch] = useState<string>('');
  // const textDebounce = useDebounce(search, 500);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const [dataRows, setDataRows] = useState<DataRow[]>([]);
  // const [filteredDataRows, setFilteredDataRows] = useState<DataRow[]>([]);
  // const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRefresh = useCallback(() => {
    setIsRefresh((prev: boolean) => !prev);
  }, []);

  const onLoad = useCallback(
    async (
      page: number,
      perPage: number,
      sortBy: string,
      order: string,
      _search: string,
    ): Promise<AxiosResponse<any>> => {
      let filter = 'activo';
      if (view === 1) filter = 'en_stock';
      if (view === 2) filter = 'despachado';
      if (view === 3) filter = 'eliminado';

      const data = await GatheringService.getLotsPaginate(
        page,
        perPage,
        sortBy,
        order,
        '',
        filter,
        gathering_id,
        store_center_id,
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
    [view],
  );

  const handleDeleteRow = useCallback((id: string) => {
    if (id === '') return;
    showYesNoQuestion(
      '¿Seguro de querer eliminar este lote?',
      '',
      'warning',
    ).then((val: any) => {
      if (val) {
        // console.log('disabledLot', id);
        LotService.disableLot(`${id}`)
          .then(() => {
            showMessage('', 'El lote fue eliminado correctamente.', 'success');
            handleRefresh();
            handleChangeTab(null, 3);
          })
          .catch(() => {
            showMessage(
              '',
              'Problemas al eliminar el lote, inténtelo nuevamente.',
              'error',
            );
          });
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRecoverRow = useCallback((id: string) => {
    if (id === '') return;
    showYesNoQuestion(
      '¿Seguro de querer recuperar este lote?',
      '',
      'warning',
    ).then((val: any) => {
      if (val) {
        // console.log('recoverLot', id);
        LotService.restoreLot(`${id}`)
          .then(() => {
            showMessage('', 'El lote fue recuperado correctamente.', 'success');
            handleRefresh();
            handleChangeTab(null, 3);
          })
          .catch(() => {
            showMessage(
              '',
              'Problemas al recuperar el lote, inténtelo nuevamente.',
              'error',
            );
          });
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeState = useCallback((id: string, new_state: string) => {
    if (id === '') return;
    if (new_state === '') return;
    let page = 0;
    // if (newEntityDetail.value === 'Activo') {
    //   page = 0;
    // }
    if (new_state === 'en stock') {
      page = 1;
    }
    showYesNoQuestion(
      '¿Seguro de querer cambiar el estado del lote?',
      '',
      'warning',
    ).then((val: any) => {
      if (val) {
        LotService.patchLot(id, { current_status: new_state })
          .then(() => {
            showMessage('', 'El estado fue cambiado correctamente.', 'success');
            // handleRefresh();
            handleChangeTab(null, page);
          })
          .catch(() => {
            showMessage(
              '',
              'Problemas al cambiar el estado, inténtelo nuevamente.',
              'error',
            );
          });
        // saveOneDetail(idEntity, idEntityDetail, newEntityDetail)
        //   .then(async () => {
        //     // agregar historial
        //     const newHistory: ChangeHistory = {
        //       attr_id: idEntityDetail,
        //       attr_name: newEntityDetail.name,
        //       change: newEntityDetail.value,
        //       created_at: new Date(),
        //       user_id: user?.id ?? '',
        //     };
        //     await addDetailHistory(
        //       schemaNamesEntities['OBJECT'],
        //       idEntity,
        //       newHistory,
        //     );

        //     showMessage(
        //       '',
        //       'El estado fue cambiado correctamente.',
        //       'success',
        //     );
        //     handleChangeData();
        //     handleChangeTab(null, page);
        //   })
        //   .catch(() => {
        //     showMessage(
        //       '',
        //       'Problemas al cambiar el estado, inténtelo nuevamente.',
        //       'error',
        //     );
        //   });
      }
    });
  }, []);

  const handleChangeProcess = useCallback(
    (lot_id: string, new_process: string) => {
      if (lot_id === '') return;
      if (new_process === '') return;
      showYesNoQuestion(
        '¿Seguro de querer cambiar el proceso del lote?',
        '',
        'warning',
      ).then((val: any) => {
        if (val) {
          LotService.patchLot(lot_id, { current_process: new_process })
            .then(() => {
              showMessage(
                '',
                'El proceso fue cambiado correctamente.',
                'success',
              );
              handleRefresh();
            })
            .catch(() => {
              showMessage(
                '',
                'Problemas al cambiar el proceso, inténtelo nuevamente.',
                'error',
              );
            });
        }
      });
    },
    [],
  );

  const handleChangeName = useCallback(
    (idEntity: string, idEntityDetail: string, newEntityDetail: any) => {
      if (idEntity === '') return;
      if (idEntityDetail === '') return;
      // console.log(idEntity);
      // console.log(idEntityDetail);
      // console.log(newEntityDetail);
      showYesNoQuestion(
        '¿Seguro de querer cambiar el nombre del lote?',
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
          // saveOneDetail(idEntity, idEntityDetail, newEntityDetail)
          //   .then(async () => {
          //     // agregar historial
          //     const newHistory: ChangeHistory = {
          //       attr_id: idEntityDetail,
          //       attr_name: newEntityDetail.name,
          //       change: newEntityDetail.value,
          //       created_at: new Date(),
          //       user_id: user?.id ?? '',
          //     };
          //     await addDetailHistory(
          //       schemaNamesEntities['OBJECT'],
          //       idEntity,
          //       newHistory,
          //     );
          //     showMessage(
          //       '',
          //       'El nombre fue cambiado correctamente.',
          //       'success',
          //     );
          //     handleChangeData();
          //   })
          //   .catch(() => {
          //     showMessage(
          //       '',
          //       'Problemas al cambiar el nombre, inténtelo nuevamente.',
          //       'error',
          //     );
          //   });
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id],
  );

  const handleChangeNetWeight = useCallback(
    (idLot: string, newValue: number) => {
      if (idLot === '') return;

      showYesNoQuestion(
        '¿Seguro de querer cambiar el peso neto del lote?',
        '',
        'warning',
      ).then((val: any) => {
        if (val) {
          LotService.patchLot(idLot, { net_weight: newValue })
            .then(() => {
              showMessage(
                '',
                'El peso neto fue cambiado correctamente.',
                'success',
              );
              setOpenChangeDetail(false);
              setLotSelected(null);
              setLotIdToChange('');
              handleRefresh();
            })
            .catch(() => {
              showMessage(
                '',
                'Problemas al cambiar el peso neto, inténtelo nuevamente.',
                'error',
              );
            });
          // saveOrAddOneDetail(idEntity, idEntityDetail, newEntityDetail)
          //   .then(async () => {
          //     // agregar historial
          //     const newHistory: ChangeHistory = {
          //       attr_id: idEntityDetail,
          //       attr_name: newEntityDetail.name,
          //       change: newEntityDetail.value,
          //       created_at: new Date(),
          //       user_id: user?.user?.uuid ?? '',
          //     };
          //     await addDetailHistory(
          //       schemaNamesEntities['OBJECT'],
          //       idEntity,
          //       newHistory,
          //     );
          //     showMessage(
          //       '',
          //       'El peso neto fue cambiado correctamente.',
          //       'success',
          //     );
          //     handleChangeData();
          //   })
          //   .catch(() => {
          //     showMessage(
          //       '',
          //       'Problemas al cambiar el peso neto, inténtelo nuevamente.',
          //       'error',
          //     );
          //   });
        }
      });
    },
    [],
  );

  // const getPurchaseStats = (purchases: any) => {
  //   const now = new Date();
  //   if (purchases.length === 0) return { totalLatestPurchase: 0, totalDayPurchase: 0, totalMonthPurchase: 0 };
  //   // Obtener la fecha de hoy (sin horas, minutos ni segundos)
  //   const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  //   const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  //   // Obtener el primer día del mes y el último día del mes
  //   const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  //   const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  //   // Última compra
  //   const latestPurchase = purchases.reduce((latest: any, current: any) =>
  //     new Date(current.date) > new Date(latest.date) ? current : latest
  //   );

  //   // Compras de hoy
  //   const purchasesToday = purchases.filter((p: any) => {
  //     const purchaseDate = new Date(p.date);
  //     return purchaseDate >= todayStart && purchaseDate < tomorrowStart;
  //   });

  //   // Compras de este mes
  //   const purchasesThisMonth = purchases.filter((p: any) => {
  //     const purchaseDate = new Date(p.date);
  //     return purchaseDate >= monthStart && purchaseDate < nextMonthStart;
  //   });

  //   const totalLatestPurchase = latestPurchase.total_amount;
  //   const totalDayPurchase = purchasesToday.reduce((total: number, current: any) => total + current.total_amount, 0);
  //   const totalMonthPurchase = purchasesThisMonth.reduce(
  //     (total: number, current: any) => total + current.total_amount,
  //     0
  //   );

  //   return {
  //     totalLatestPurchase,
  //     totalDayPurchase,
  //     totalMonthPurchase
  //   };
  // };

  useEffect(() => {
    const _setHeaders: any = [
      {
        sorteable: true,
        align: 'left',
        text: 'Nombre del lote',
        value: 'name',
        padding: 'none',
      },
      {
        sorteable: true,
        align: 'left',
        text: 'Peso bruto',
        padding: 'none',
        value: 'fresh_weight',
        render: (row: any) => {
          // calculo el total de las compras
          // const totalSales = row.sales.reduce((sum: any, item: any) => sum + item.quantity, 0);
          return <Typography>{(+row.fresh_weight).toFixed(2)} kg</Typography>;
        },
      },
      {
        sorteable: true,
        align: 'left',
        text: 'Peso neto',
        padding: 'none',
        value: 'net_weight',
        render: (row: any) => {
          // calculo el total de las compras
          // const totalSales = row.sales.reduce((sum: any, item: any) => sum + item.quantity, 0);
          return (
            <Typography>{(+row.net_weight || 0).toFixed(2)} kg</Typography>
          );
        },
      },
      {
        sorteable: true,
        align: 'left',
        text: 'Fecha',
        padding: 'none',
        value: 'created_at',
        render: (row: any) => (
          <>
            <DateCell date={new Date(row?.created_at ?? '')} showTime={false} />
          </>
        ),
      },
      {
        sorteable: true,
        align: 'left',
        text: 'Acopiador',
        padding: 'none',
        value: 'gatherer_id',
        render: (row: any) => {
          return (
            <>
              {row?.gatherer?.first_name ?? ''} {row?.gatherer?.last_name ?? ''}
            </>
          );
        },
      },
      {
        sorteable: true,
        align: 'left',
        text: 'Tipo de producto',
        padding: 'none',
        value: 'product_type',
      },
      {
        sorteable: true,
        align: 'left',
        text: 'Certificaciones',
        padding: 'none',
        value: 'certifications',
        render: (row: any) => {
          return (
            <>
              {String(row.certifications)
                .split(',')
                .join(', ')}
            </>
          );
        },
      },
      {
        sorteable: true,
        align: 'left',
        text: 'Costo',
        padding: 'none',
        value: 'cost',
        render: (row: any) => {
          // calculo el total de las compras
          // const totalSales = row.sales.reduce((sum: any, item: any) => sum + item.total_amount, 0);
          return (
            <Typography sx={{ color: 'green' }}>
              S/.
              {fCurrency((!isNaN(+row.cost) ? +row.cost : 0).toFixed(2))}
            </Typography>
          );
        },
      },
      {
        sorteable: true,
        align: 'left',
        text: 'Proceso',
        padding: 'none',
        value: 'proceso',
        render: (row: any) => {
          // console.log(row);
          const options = [
            { id: 'baba', value: 'baba' },
            { id: 'fermentado', value: 'fermentado' },
            { id: 'secado', value: 'secado' },
            { id: 'seco', value: 'seco' },
          ];
          return (
            <>
              <SelectField
                id={'process_field'}
                label={''}
                name={'process_field'}
                items={options ?? []}
                value={row?.current_process ?? ''}
                itemText="value"
                itemValue="value"
                variant="outlined"
                disabled={
                  row?.current_status === 'en stock' || view === 3 || view === 2
                }
                isNotUpdateValue
                onChange={(_name: any, value: any) => {
                  handleChangeProcess(row.id, value);
                }}
              />
            </>
          );
        },
      },
      {
        sorteable: true,
        align: 'left',
        text: 'Estado',
        padding: 'none',
        value: 'state',
        render: (row: any) => {
          const options = [
            { id: 'activo', value: 'activo' },
            { id: 'en stock', value: 'en stock' },
          ];
          return (
            <>
              <SelectField
                id={'state_field'}
                label={''}
                name={'state_field'}
                items={options ?? []}
                value={row?.current_status ?? ''}
                itemText="value"
                itemValue="value"
                variant="outlined"
                isNotUpdateValue
                disabled={
                  // row?.stateDetail?.value ===
                  //   statesArray[statesArray.length - 1] ||
                  view === 3 || view === 2
                }
                onChange={(_name: any, value: any) => {
                  // console.log(value);

                  handleChangeState(row?.id, value);
                }}
              />
            </>
          );
        },
      },
      view === 2
        ? {
            sorteable: false,
            align: 'center',
            text: 'Ubicación',
            value: '',
            render: (row: any) => {
              return (
                <Box display="flex" flexDirection="row" justifyContent="center">
                  {row.store}
                </Box>
              );
            },
          }
        : {
            sorteable: false,
            align: 'center',
            text: 'Acciones',
            value: '',
            render: (row: any) => {
              return (
                <Box display="flex" flexDirection="row" justifyContent="center">
                  {view === 3 ? (
                    <Tooltip title="Recuperar lote">
                      <IconButton
                        onClick={() => handleRecoverRow(row?.id ?? '')}
                      >
                        <LockResetRounded />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <>
                      {row.gross_weight <= 0 && (
                        <Tooltip title="Editar nombre">
                          <IconButton
                            onClick={() => {
                              setLotIdToChange(row.objectId ?? '');
                              setNameDetail(row.nameDetail);
                              setOpenChangeNameDetail(true);
                            }}
                          >
                            <EditRounded />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Asignar peso neto">
                        <IconButton
                          onClick={() => {
                            setLotSelected(row);
                            setLotIdToChange(row.id ?? '');
                            setOpenChangeDetail(true);
                          }}
                        >
                          <ScaleOutlined />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          onClick={() => handleDeleteRow(row?.id ?? '')}
                        >
                          <DeleteRounded />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              );
            },
          },
      {
        sorteable: false,
        align: 'center',
        text: '',
        isNotShowInHeader: true,
        value: '',
        render: (row: any) => {
          const averagePrice =
            (row.purchases ?? []).reduce(
              (sum: any, item: any) => sum + item.price,
              0,
            ) / row.purchases.length;

          return (
            <Box
              display="flex"
              flexDirection="row"
              mt={2}
              justifyContent="space-between"
              width={'100%'}
            >
              {/* <p>hola</p> */}
              {/* <Box>
                <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Cooperativa</Typography>
                <Typography sx={{ fontSize: '14px' }}>{organization?.business_name}</Typography>
              </Box> */}
              <Box>
                <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>
                  Precio promedio
                </Typography>
                <Typography sx={{ fontSize: '14px', color: 'red' }}>
                  S/. {fCurrency(averagePrice.toFixed(2))}
                </Typography>
              </Box>
              <Box ml={2}>
                <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>
                  Transacciones del lote
                </Typography>
                <SalesTable
                  rows={row.purchases}
                  headers={[
                    {
                      head: 'Recibo',
                      align: 'left',
                      value: 'ticket_number',
                      width: '150px',
                    },
                    {
                      head: 'Nombre',
                      align: 'left',
                      value: 'farm.name',
                      width: '200px',
                      render: (row: any) => {
                        return (
                          <>
                            {row.farmer?.first_name ?? ''}{' '}
                            {row.farmer?.last_name ?? ''}
                          </>
                        );
                      },
                    },
                    {
                      head: 'Parcela',
                      align: 'left',
                      value: 'farm_id',
                      width: '200px',
                      render: (row: any) => {
                        return <>{row.farm?.name ?? ''}</>;
                      },
                    },
                    // { head: 'DNI', align: 'left', value: 'producer_dni' },
                    {
                      head: 'Cantidad',
                      align: 'right',
                      value: 'quantity',
                      parse: 'quantity',
                    },
                    {
                      head: 'P. Unitario',
                      align: 'right',
                      value: 'price',
                      parse: 'price',
                    },
                    {
                      head: 'Monto Cancelado',
                      align: 'right',
                      value: 'price_total',
                      parse: 'price',
                    },
                    {
                      head: 'Medio de pago',
                      align: 'right',
                      value: 'payment_method',
                    },
                    {
                      head: 'Fecha de compra',
                      align: 'right',
                      value: 'purchase_date',
                      parse: 'date',
                    },
                  ]}
                />
              </Box>
            </Box>
          );
        },
      },
    ];
    setHeaders(_setHeaders);
  }, [
    handleChangeProcess,
    handleChangeState,
    handleDeleteRow,
    handleRecoverRow,
    // organization?.business_name,
    // statesArray,
    view,
  ]);

  // const _processingData = useCallback(
  //   async (data: any[]) => {
  //     // setIsLoading(true);
  //     console.log(data);
  //     const newRows: any[] = [];
  //     const arraySales: any[] = [];
  //     // await getSalesOfLotsById(
  //     //   data.map((element: any) => element.idRef),
  //     // );
  //     // listado de compras para estadísticas
  //     const purchases: SaleRow[] = [];
  //     for (const element of data) {
  //       let gathererName = '';
  //       const detailGatherer = element?.module_detail?.find(
  //         (element: any) => element.name === 'acopiador',
  //       );
  //       if (detailGatherer) {
  //         const gatherer = detailGatherer?.option?.find(
  //           (element: any) => element.id === detailGatherer.value,
  //         );
  //         if (gatherer) {
  //           gathererName = gatherer.value;
  //         } else {
  //           gathererName = detailGatherer.value ?? '';
  //         }
  //       }

  //       // obtener las compras del lote
  //       const salesArr: SaleRow[] = [];
  //       const salesObj = arraySales.find(
  //         (sale: any) => sale._id === element?.idRef,
  //       );
  //       const sales = salesObj?.documents;
  //       // console.log(sales);
  //       if (sales && Array.isArray(sales) && sales.length > 0) {
  //         sales.forEach((salesObj: any) => {
  //           const quantity = salesObj.quantity;
  //           const price = salesObj.price;
  //           const producerName = salesObj.farmer_id;
  //           const farmName = salesObj.farm_id;

  //           const newSale: SaleRow = {
  //             code: salesObj.ticket_number,
  //             producer_name: producerName,
  //             producer_dni: '',
  //             farm_name: farmName,
  //             quantity: quantity ?? 0,
  //             presentation: salesObj.presentation,
  //             price: price ?? 0,
  //             total_amount: price * quantity,
  //             date: salesObj?.created_at ?? '',
  //             payment_method: salesObj.payment_method,
  //           };
  //           salesArr.push(newSale);
  //         });
  //       }
  //       // console.log(salesArr);
  //       // const gatheringsNames = await getGatheringsByGathererId(element.uuid);
  //       // const stateDetail = element.module_detail.find(
  //       //   (element: any) => element.name === 'estado',
  //       // );
  //       // const processDetail = element.module_detail.find(
  //       //   (element: any) => element.name === 'proceso',
  //       // );
  //       // const netWeightDetail = element.module_detail.find(
  //       //   (element: any) => element.name === 'peso neto',
  //       // );
  //       // const nameDetail = element.module_detail.find(
  //       //   (element: any) => element.name === 'nombre',
  //       // );

  //       // if (netWeightDetail) {
  //       //   setNetWeightDetail(netWeightDetail);
  //       // }
  //       const newRow: DataRow = {
  //         id: element?.idRef ?? '',
  //         objectId: element?._id ?? '',
  //         name: element?.name ?? '',
  //         // nameDetail: nameDetail,
  //         date: element?.updated_at ?? '',
  //         gatherer_name: gathererName,
  //         type: element?.product_type ?? '',
  //         certifications: String(element?.certifications ?? '')
  //           .split(',')
  //           .join(', '),
  //         cost: element?.cost ?? 0,
  //         state: element.current_status ?? '',
  //         process: element.current_process ?? '',
  //         gross_weight:
  //           salesArr.reduce((sum: any, item: any) => sum + item.quantity, 0) ??
  //           0,
  //         net_weight: element?.net_weight || 0,
  //         disabled_at: element?.disabled_at ?? '',
  //         sales: element.purchases ?? [],
  //         store: '',
  //       };
  //       newRows.push(newRow);
  //     }

  //     newRows.forEach((row: any) => {
  //       if (!row?.disabled_at) {
  //         purchases.push(...row.sales);
  //       }
  //     });
  //     // setFilteredDataRows(newRows);
  //     // setIsLoading(false);
  //     return newRows;
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [
  //     // lots
  //     view,
  //   ],
  // );

  // useEffect(() => {
  //   if (lots.length > 0) {
  //     let filteredLots = [];
  //     let name = '';
  //     if (view === 0) {
  //       name = 'Lotes activos';
  //       filteredLots = lots.filter(
  //         (row: any) =>
  //           getDetailValue('estado', row.module_detail) === statesArray[0] &&
  //           (row.disabled_at === null || !row.disabled_at)
  //       );
  //     }
  //     if (view === 1) {
  //       name = 'Lotes en stock';
  //       filteredLots = lots.filter(
  //         (row: any) =>
  //           getDetailValue('estado', row.module_detail) !== statesArray[0] &&
  //           getDetailValue('estado', row.module_detail) !== statesArray[statesArray.length - 1] &&
  //           (row.disabled_at === null || !row.disabled_at)
  //       );
  //     }
  //     if (view === 2) {
  //       name = 'Lotes despachados';
  //       filteredLots = lots.filter(
  //         (row: any) =>
  //           getDetailValue('estado', row.module_detail) === statesArray[statesArray.length - 1] &&
  //           (row.disabled_at === null || !row.disabled_at)
  //       );
  //     }
  //     if (view === 3) {
  //       name = 'Lotes eliminados';
  //       filteredLots = lots.filter((row: any) => row.disabled_at && row.disabled_at !== null);
  //     }

  //     // calcular el precio promedio
  //     _processingData(filteredLots);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [lots, view]);

  // const getEntitiesPaginate = useCallback(
  //   (page: number, limit: number, order: any, filters?: any, onLoad?: any) => {
  //     return new Promise((resolve, reject) => {
  //       GatheringService.getLotsPaginate(
  //         page,
  //         limit,
  //         order.orderBy,
  //         order.order,
  //         '',
  //       )
  //         .then((resp: any) => {
  //           const { items, total } = resp.data;
  //           resolve({
  //             items: items,
  //             total: total,
  //           });
  //         })
  //         .catch((err: any) => {
  //           reject(err);
  //         });
  //     });
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [],
  // );

  // const _paginateLots = useCallback(
  //   (
  //     page: number,
  //     per_page: number,
  //     sort_by: string,
  //     order: string,
  //     search: string,
  //   ) => {
  //     const statusOne =
  //       view === 0
  //         ? 'Activo'
  //         : view === 1
  //         ? 'En stock'
  //         : view === 2
  //         ? 'Despachado'
  //         : 'Eliminado';
  //     // const lotsIds = lots.map((element: any) => element.idRef);
  //     // const order: any = {
  //     //   created_at: -1,
  //     // };
  //     // let filters: Record<string, any> = {
  //     //   idRef: { $in: lotsIds },
  //     // };
  //     if (statusOne === 'Activo') {
  //       console.log('filtro activo');
  //       // filters = {
  //       //   idRef: { $in: lotsIds },
  //       //   'module_detail.name': 'estado',
  //       //   'module_detail.value': 'Activo',
  //       //   entity_relations: {
  //       //     $not: {
  //       //       $elemMatch: {
  //       //         module_id: modulesConfig.STORE_MODULE_UUID,
  //       //       },
  //       //     },
  //       //   },
  //       //   $or: [{ disabled_at: null }, { disabled_at: { $exists: false } }],
  //       // };
  //     } else if (statusOne === 'En stock') {
  //       console.log('filtro en stock');
  //       // filters = {
  //       //   idRef: { $in: lotsIds },
  //       //   'module_detail.name': 'estado',
  //       //   'module_detail.value': 'En stock',
  //       //   // 'module_detail.value': { $nin: [statesArray[0], statesArray[statesArray.length - 1]] },
  //       //   entity_relations: {
  //       //     $not: {
  //       //       $elemMatch: {
  //       //         module_id: modulesConfig.STORE_MODULE_UUID,
  //       //       },
  //       //     },
  //       //   },
  //       //   $or: [{ disabled_at: null }, { disabled_at: { $exists: false } }],
  //       // };
  //     } else if (statusOne === 'Despachado') {
  //       console.log('filtro despachado');
  //       // filtro obtiene los lotes que tiene al menos una relación con cualquier almacén
  //       // filters = {
  //       //   idRef: { $in: lotsIds },
  //       //   entity_relations: {
  //       //     $elemMatch: {
  //       //       module_id: modulesConfig.STORE_MODULE_UUID,
  //       //     },
  //       //   },
  //       //   // 'module_detail.name': 'estado',
  //       //   // 'module_detail.value': statesArray[statesArray.length - 1],
  //       //   // $or: [{ disabled_at: null }, { disabled_at: { $exists: false } }]
  //       // };
  //     } else if (statusOne === 'Eliminado') {
  //       console.log('filtro eliminado');
  //       // filters = {
  //       //   idRef: { $in: lotsIds },
  //       //   disabled_at: { $exists: true, $ne: null },
  //       // };
  //     }
  //     const get = getEntitiesPaginate(1, per_page, order, {}, _processingData);
  //     // const response = await get;
  //     // console.log(get);
  //     return get;
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [
  //     view,
  //     // lots,
  //     // statesArray
  //   ],
  // );

  return (
    <Grid size={12}>
      <Paper elevation={2} style={{ padding: '20px', marginTop: '10px' }}>
        <DataTable
          headers={headers}
          refresh={isRefresh}
          hideSearch
          isCollapsible
          isSelect={handleSelects && (view === 0 || view === 1)}
          handleSelects={handleSelects}
          onLoad={onLoad}
        />
        {/* <DataTable
          headers={headers}
          // items={filteredDataRows}
          // searchSize="small"
          // loading={isLoading}
          isCollapsible
          schema={''} // searchFullWidth

          // isSelect
          // checkValidateField={(row: any) => !row.status || (row.status && row.status !== 'SUCCESSFUL')}
          // handleSelects={(items: any[]) => {
          //   setSelectedItems(items);
          // }}
          // refreshSelect={refreshSelect}
        /> */}
      </Paper>
      {openChangeDetail && (
        <EditEntityDetail
          currentValue={lotSelected?.net_weight}
          idLot={lotIdToChange}
          // entityDetail={headers}
          handleChangeNetWeight={handleChangeNetWeight}
          userId={user?.user?.uuid ?? ''}
          handleCloseDialog={(isRefresh?: boolean) => {
            if (isRefresh) {
              handleRefresh();
            }
            setLotIdToChange('');
            lotSelected(null);
            setOpenChangeDetail(false);
          }}
        />
      )}
      {openChangeNameDetail && nameDetail && (
        <EditNameDialog
          element={nameDetail}
          idEntity={lotIdToChange}
          // entityDetail={headers}
          handleChangeName={handleChangeName}
          userId={user?.user?.uuid ?? ''}
          handleCloseDialog={(isRefresh?: boolean) => {
            if (isRefresh) {
              handleRefresh();
            }
            setLotIdToChange('');
            setNameDetail(null);
            setOpenChangeNameDetail(false);
          }}
        />
      )}
    </Grid>
  );
};

export default LotsView;
