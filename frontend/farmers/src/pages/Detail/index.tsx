// Ruta de detalle: /detail/:id
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, styled } from '@mui/material';
import Paper from '@/ui/components/atoms/Paper/Paper';
import {
  Compost,
  ContentPaste,
  PersonOutlineOutlined,
} from '@mui/icons-material';
import { ModuleConfig } from '@core/moduleLoader';
import { getListRoute } from '../../../index';
import Tabs from '@/ui/components/molecules/Tabs/Tabs';
import { useEffect, useState } from 'react';
import ProducerTab from './tabs/ProducerTab';
import FarmsTab from './tabs/FarmsTab';
import FormsTab from './tabs/FormsTab';
import { FarmerService } from '../../services/farmer';
import { FarmerGet } from '../../models/farmer';

import LinearProgress from '@/ui/components/atoms/LinearProgress/LinearProgress';

export const CaptionStyled = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: 400,
  fontSize: 12,
  variant: 'body2',
}));

export const FieldValueStyled = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  variant: 'body1',
  fontWeight: 600,
  marginBottom: 2,
}));
export const TitleSectionStyled = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 16,
}));

interface FarmerDetailProps {
  config?: ModuleConfig;
}

export default function FarmerDetail({ config }: FarmerDetailProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  if (!id) navigate(getListRoute());
  const [tab, setTab] = useState<number>(0);

  const [farmer, setFarmer] = useState<FarmerGet | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    if (!id) return;
    FarmerService.getById(id)
      .then(async (farmer: any) => {
        if (farmer) {
          setFarmer(farmer);
          // const farms = await FarmerService.getFarmsByFarmerId(id);
          // setFarms(farms);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [id]);

  if (!farmer) {
    return (
      <Paper>
        <Typography variant="h6" sx={{ color: '#ef4444' }}>
          Agricultor no encontrado
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e293b' }}>
          {farmer.first_name} {farmer.last_name}
        </Typography>
      </Paper>
      <Paper sx={{ paddingTop: 1, marginBottom: 0 }}>
        <Tabs
          tabs={[
            { label: 'Información principal', icon: <PersonOutlineOutlined /> },
            { label: 'Información de parcelas', icon: <Compost /> },
            { label: 'Formularios', icon: <ContentPaste /> },
          ]}
          activeTab={tab}
          onChangeTab={(value: number) => setTab(value)}
          completeLine
        />
      </Paper>

      <LinearProgress loading={isLoading} />
      {tab === 0 && <ProducerTab farmer={farmer} />}
      {tab === 1 && <FarmsTab farmer={farmer} />}
      {tab === 2 && <FormsTab farmer={farmer} farmerId={farmer.id} />}
    </>
  );
}
