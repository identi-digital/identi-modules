import React, { useCallback, useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import { getListRoute } from '../../../index';
import { ModuleConfig } from '@/core/moduleLoader';
import ResumeComponent from '@/ui/components/molecules/ResumeComponent';
import { GatheringService } from '@/modules/gathering/src/services/gathering';
import { useNavigate, useParams } from 'react-router-dom';
import Tabs from '@/ui/components/molecules/Tabs/Tabs';
import Button from '@/ui/components/atoms/Button/Button';
import { DownloadRounded } from '@mui/icons-material';
import PopoverComponent from '@/ui/components/atoms/Popover';
// import Paper from '@/ui/components/atoms/Paper/Paper';
import LotsView from '@/modules/gathering/src/pages/Detail/views/LotsView';
import { saveAs } from '@/ui/utils/dowloadExcel';
import { showMessage } from '@/ui/utils/Messages';
import { WarehouseService } from '../../services/warehouse';

interface GatherersListProps {
  config?: ModuleConfig;
}

export default function DetailPage({ config }: GatherersListProps) {
  const navigate = useNavigate();
  const { store_center_id } = useParams<{ store_center_id: string }>();
  console.log(store_center_id);
  if (!store_center_id) navigate(getListRoute());

  const [activeTab, setActiveTab] = React.useState(0);
  const [isDownloadAllData, setIsDownloadAllData] = useState<boolean>(false);

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

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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
        undefined,
        store_center_id,
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
    WarehouseService.getWarehouseSummary(store_center_id).then((resp: any) => {
      console.log(resp);
      if (resp) {
        setResume(resp);
      }
    });
  }, [store_center_id]);

  return (
    <>
      <Grid container={true} spacing={1}>
        <Grid size={12}>
          <ResumeComponent
            textHeader={'Resumen de saldo'}
            resumeKeys={[
              {
                text: 'Ultimo lote',
                value: `${resume.last_lot?.name ?? ''}`,
              },
              {
                text: 'Lotes totales',
                value: `${resume.total_lots ?? 0}`,
              },
              {
                text: 'Lotes activos',
                value: `${resume.active_lots ?? 0}`,
              },
              {
                text: 'Lotes en stock',
                value: `${resume.stock_lots ?? 0}`,
              },
              {
                text: 'Total de kilos',
                value: `${resume.kg_total ?? 0}`,
              },
              {
                text: 'Monto total',
                value: `${resume.total ?? 0}`,
                color: 'rgb(255, 91, 0)',
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
            </Box>
          </Box>
        </Grid>

        <Grid size={12}>
          {(activeTab === 0 || activeTab === 1) && (
            <LotsView
              view={activeTab}
              // lots={lotsEntities}
              handleChangeTab={handleChangeTab}
              // handleChangeData={handleChangeData}
              // getEntitiesPaginate={getEntitiesPaginate}
              store_center_id={store_center_id ?? ''}
              // handleToDownload={handleToDownload}
              // setStats={handleStats}
              // statesArray={statesArray}
              handleSelects={undefined}
            />
          )}
        </Grid>
      </Grid>
    </>
  );
}
