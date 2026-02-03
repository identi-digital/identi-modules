import React, { useCallback, useEffect, useState } from 'react';
// import Breadcrumbs from '@/ui/components/molecules/Breadcrumbs/Breadcrumbs';
import { Box, CircularProgress, Grid } from '@mui/material';
import {
  // getDetailRoute,
  getListRoute,
  // getModuleRoute,
  // MODULE_ACTOR_DISPLAY_NAME,
  MODULE_ACTOR_DISPLAY_NAME_PLURAL,
  // MODULE_ENTITY_DISPLAY_NAME,
  // MODULE_ENTITY_DISPLAY_NAME_PLURAL,
} from '../../../index';
import { ModuleConfig } from '@/core/moduleLoader';
import ResumeComponent from '@/ui/components/molecules/ResumeComponent';
import { GatheringService } from '../../services/gathering';
import { useNavigate, useParams } from 'react-router-dom';
import Tabs from '@/ui/components/molecules/Tabs/Tabs';
import Button from '@/ui/components/atoms/Button/Button';
import { DownloadRounded, Store } from '@mui/icons-material';
import { StoreCenter } from '../../models/store_center';
import PopoverComponent from '@/ui/components/atoms/Popover';
import AssignStore from '../../components/AssignStore';
import Paper from '@/ui/components/atoms/Paper/Paper';
import MovementsView from './views/MovementsView';
import GatherersView from './views/GatherersView';
import LotsView from './views/LotsView';
import { saveAs } from '@/ui/utils/dowloadExcel';
import { showMessage } from '@/ui/utils/Messages';
import { WarehouseService } from '@/modules/warehouse/src/services/warehouse';
import { LotService } from '../../services/lots';

interface GatherersListProps {
  config?: ModuleConfig;
}

export default function DetailPage({ config }: GatherersListProps) {
  const navigate = useNavigate();
  const { gathering_id } = useParams<{ gathering_id: string }>();
  console.log(gathering_id);
  if (!gathering_id) navigate(getListRoute());

  const [activeTab, setActiveTab] = React.useState(0);
  const [isLoadingData, setIsLoadingData] = useState();
  // const [isLoadData, setIsLoadData] = useState<boolean>(false);
  const [isDownloadAllData, setIsDownloadAllData] = useState<boolean>(false);

  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [stores, setStores] = useState<StoreCenter[]>([]);
  const [isAssignLoad, setIsAssignLoad] = useState<boolean>(false);

  const [dailyExpense, setDailyExpense] = useState<number>(0);
  const [monthlyExpense, setMonthlyExpense] = useState<number>(0);
  const [lastTransactionAmount, setLastTransactionAmount] = useState<number>(0);
  // const [gatherersArray, setGatherersArray] = useState<any[]>([]);

  const handleChangeTab = (
    _event: React.SyntheticEvent | null,
    newValue: number,
  ) => {
    setActiveTab(newValue);
  };

  const handleAssignStore = useCallback(
    (obj: any) => {
      // console.log('asignar', obj);
      // console.log(selectedRows);
      // arreglo de ids
      const lot_ids = selectedRows.map((element: any) => element.id);
      LotService.dispatchLots({
        lot_ids,
        store_center_id: obj.id,
      })
        .then((resp: any) => {
          if (resp) {
            showMessage(
              '',
              `Se asignó el almacén a los lotes seleccionados exitosamente`,
              'success',
            );
            handleChangeTab(null, 2);
            setOpenDialog(false);
          }
        })
        .catch(() => {
          showMessage(
            '',
            `No se ha podido asignar el almacén a los lotes seleccionados, intente nuevamente.`,
            'error',
          );
        });
    },
    [selectedRows],
  );
  const handleOpenAssignStore = useCallback(() => {
    setOpenDialog(true);
  }, []);

  const handleDownloadGatherers = useCallback(() => {
    setIsDownloadAllData(true);
    GatheringService.getGatherersExport(gathering_id)
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
          saveAs(resp.data, filename);
        }
      })
      .catch(() => {
        showMessage('', 'Problemas al exportar los registros', 'error', true);
      })
      .finally(() => {
        setIsDownloadAllData(false);
      });
  }, [gathering_id]);

  const handleDownloadBalances = useCallback(() => {
    setIsDownloadAllData(true);
    if (!gathering_id) return;
    GatheringService.getBalancesExport(gathering_id)
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
          saveAs(resp.data, filename);
        }
      })
      .catch(() => {
        showMessage('', 'Problemas al exportar los registros', 'error', true);
      })
      .finally(() => {
        setIsDownloadAllData(false);
      });
  }, [gathering_id]);

  const handleDownloadLots = useCallback(
    async (type_download: 'lots' | 'purchases') => {
      setIsDownloadAllData(true);
      let filter = 'activo';
      if (activeTab === 1) filter = 'en stock';
      if (activeTab === 2) filter = 'despachado';
      if (activeTab === 3) filter = 'eliminado';
      GatheringService.getLotsExport(
        type_download,
        'created_at',
        'desc',
        '',
        filter,
        gathering_id,
      )
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
            saveAs(resp.data, filename);
          }
        })
        .catch(() => {
          showMessage('', 'Problemas al exportar los registros', 'error', true);
        })
        .finally(() => {
          setIsDownloadAllData(false);
        });
    },
    [activeTab],
  );

  useEffect(() => {
    GatheringService.getGatheringSummary(gathering_id).then((resp: any) => {
      console.log(resp);
      const { last_purchase_amount, today_expense, month_expense } = resp;
      setLastTransactionAmount(+last_purchase_amount || 0);
      setDailyExpense(+today_expense || 0);
      setMonthlyExpense(+month_expense || 0);
    });
  }, [gathering_id]);

  // obtengo los almacenes
  useEffect(() => {
    WarehouseService.getWarehousesPaginate(1, 100, 'name', 'asc', '')
      .then((resp: any) => {
        console.log(resp);
        setStores(resp.items);
      })
      .catch((err: any) => {
        console.log(err);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // useEffect(() => {
  //   GatheringService.getGatherersOfGatheringCenter(gathering_id).then((resp: any) => {
  //     console.log(resp);
  //   })

  // }, [gathering_id]);

  return (
    <>
      <Grid container={true} spacing={1}>
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
        <Grid size={12}>
          <Box
            mt={2}
            display={'flex'}
            flexDirection={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'flex-end', md: 'center' }}
            justifyContent={'space-between'}
          >
            <Tabs
              variant="scrollable"
              tabs={[
                {
                  label: 'Lotes activos',
                },
                {
                  label: 'Lotes en stock',
                },
                { label: 'lotes despachados' },
                {
                  label: 'Lotes eliminados',
                },
                { label: MODULE_ACTOR_DISPLAY_NAME_PLURAL },
                { label: 'Movimientos de caja' },
              ]}
              activeTab={activeTab}
              onChangeTab={function(tab: number): void {
                setActiveTab(tab);
              }}
            />
            <Box
              sx={{
                // width: '100%',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              {activeTab === 4 || activeTab === 5 ? (
                <Button
                  startIcon={<DownloadRounded />}
                  sx={{ width: 'max-content' }}
                  variant="contained"
                  // color="secondary"
                  onClick={
                    activeTab === 4
                      ? handleDownloadGatherers
                      : handleDownloadBalances
                  }
                  text="Descargar XLSX"
                  isLoading={isDownloadAllData}
                  disabled={isDownloadAllData}
                />
              ) : (
                <>
                  <Button
                    startIcon={<Store />}
                    sx={{ width: 'max-content' }}
                    variant="contained"
                    onClick={handleOpenAssignStore}
                    text="Despachar"
                    // isLoading={isDownloadAllData}
                    disabled={selectedRows.length <= 0}
                  />
                  <PopoverComponent
                    buttonLabel={'Descargar XLSX'}
                    buttonStartIcon={<DownloadRounded />}
                    isLoading={isDownloadAllData}
                  >
                    <Button
                      startIcon={<DownloadRounded />}
                      sx={{ width: '100%', justifyContent: 'flex-start' }}
                      variant="text"
                      fullWidth
                      onClick={() => handleDownloadLots('lots')}
                      text="Descargar lotes"
                      isLoading={isDownloadAllData}
                      disabled={isDownloadAllData}
                    />
                    <Button
                      startIcon={<DownloadRounded />}
                      sx={{ width: '100%', justifyContent: 'flex-start' }}
                      variant="text"
                      onClick={() => handleDownloadLots('purchases')}
                      text="Descargar lotes y compras"
                      isLoading={isDownloadAllData}
                      disabled={isDownloadAllData}
                    />
                  </PopoverComponent>
                </>
              )}
            </Box>
          </Box>
        </Grid>
        {isLoadingData ? (
          <Grid size={12}>
            <Paper
              elevation={2}
              sx={{ padding: '20px', marginTop: '10px', textAlign: 'center' }}
            >
              <CircularProgress />
            </Paper>
          </Grid>
        ) : (
          <Grid size={12}>
            {(activeTab === 0 ||
              activeTab === 1 ||
              activeTab === 2 ||
              activeTab === 3) && (
              <LotsView
                view={activeTab}
                handleChangeTab={handleChangeTab}
                gathering_id={gathering_id ?? ''}
                handleSelects={(selectedRows: any[]) =>
                  setSelectedRows(selectedRows)
                }
              />
            )}
            {activeTab === 4 && (
              <GatherersView
                gatheringId={gathering_id ?? ''}
                handleChangeTab={handleChangeTab}
                entityIdGathering={''}
              />
            )}
            {activeTab === 5 && (
              <MovementsView gatheringId={gathering_id ?? ''} />
            )}
          </Grid>
        )}
      </Grid>
      {openDialog && (
        <AssignStore
          handleCloseDialog={() => {
            setOpenDialog(false);
          }}
          isLoading={isAssignLoad}
          handleAssignStore={handleAssignStore}
          stores={stores}
        />
      )}
    </>
  );
}
