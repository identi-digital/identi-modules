// import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  //   Paper,
  Card,
  //   CardContent,
  Button,
  Avatar,
  Chip,
  TextField,
  Stack,
  Autocomplete,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  // ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ModuleConfig } from '@/core/moduleLoader';
import { useCallback, useState } from 'react';
import { FarmerGet } from '@/modules/farmers/src/models/farmer';
import { TransferCreate } from '../../models/transfer';
import { ExpenditureService } from '../../services/expenditure';
import { getListRoute } from '@/modules/expenditure';
import { FarmerService } from '@/modules/farmers/src/services/farmer';
import useDebounce from '@/ui/hooks/use_debounce';
import React from 'react';
import { showMessage } from '@/ui/utils/Messages';

const useEnhancedEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;
// import { getModuleRoute } from '../../../index';

interface CreatePageProps {
  config?: ModuleConfig;
}

const CreatePage: React.FC<CreatePageProps> = ({ config }) => {
  const navigate = useNavigate();

  const [farmers, setFarmers] = useState<FarmerGet[]>([]);
  const [search, setSearch] = useState<string>('');
  const textDebounce = useDebounce(search, 500);
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerGet | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTransfer, setLoadingTransfer] = useState<boolean>(false);

  const handleChangeAmount = (value: number) => {
    setAmount(value);
  };

  const handleCreateTransfer = async () => {
    if (selectedFarmer && amount > 0) {
      setLoadingTransfer(true);
      try {
        const transfer: TransferCreate = {
          dni: selectedFarmer.dni,
          first_name: selectedFarmer.first_name,
          last_name: selectedFarmer.last_name,
          amount: amount,
          cci: selectedFarmer.bank_cci ?? '',
        };
        await ExpenditureService.createTransfer(transfer);

        showMessage('', 'Transferencia creada exitosamente', 'success');
        navigate(getListRoute());
      } catch (error) {
        showMessage('', 'No se pudo crear la transferencia', 'error');
      } finally {
        setLoadingTransfer(false);
      }
    }
  };

  const handleOpen = useCallback(() => {
    setOpen(true);
    setLoading(true);
    FarmerService.getAll(1, 10, 'name', 'asc', '', 'todos')
      .then((resp: any) => {
        console.log(resp);
        const { items } = resp;
        console.log(items);
        setFarmers(items);
      })
      .catch((err: any) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleClose = () => {
    setOpen(false);
    // setOptions([]);
  };

  useEnhancedEffect(() => {
    console.log(textDebounce);
    // if (!loading) {
    //   return undefined;
    // }

    // if (inputValue === '') {
    //   setOptions(value ? [value] : emptyOptions);
    //   return undefined;
    // }
    setLoading(true);
    // Allow to resolve the out of order request resolution.
    let active = true;

    FarmerService.getAll(1, 10, 'name', 'asc', textDebounce, 'todos')
      .then((resp: any) => {
        if (!active) {
          return;
        }
        console.log(resp);
        const { items } = resp;
        console.log(items);
        setFarmers(items);
      })
      .catch((err: any) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [textDebounce]);

  return (
    <Box>
      <Card variant="outlined" sx={{ borderRadius: 4, p: 4 }}>
        <Typography variant="h5" fontWeight={800} gutterBottom>
          Nueva Transferencia Individual
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color="text.secondary"
                >
                  BUSCAR PRODUCTOR
                </Typography>
                {/* <TextField
                  fullWidth
                  sx={{ mt: 1 }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                /> */}
                <Autocomplete
                  // sx={{ width: 300 }}
                  fullWidth
                  open={open}
                  onOpen={handleOpen}
                  onClose={handleClose}
                  includeInputInList
                  isOptionEqualToValue={(option, value) =>
                    option.first_name === value.first_name
                  }
                  getOptionLabel={(option) =>
                    `${option.first_name} ${option.last_name}`
                  }
                  onChange={(_event: any, newValue: FarmerGet | null) => {
                    // setFarmers(newValue ? [newValue, ...options] : options);
                    setSelectedFarmer(newValue);
                  }}
                  onInputChange={(_event, newInputValue) => {
                    // console.log(newInputValue);
                    setSearch(newInputValue);
                  }}
                  filterSelectedOptions
                  filterOptions={(x) => x}
                  options={farmers}
                  loading={loading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label=""
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          endAdornment: (
                            <React.Fragment>
                              {loading ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </React.Fragment>
                          ),
                        },
                      }}
                    />
                  )}
                />
              </Box>
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#fdf7f4',
                  borderRadius: 3,
                  display: 'flex',
                  gap: 2,
                  alignItems: 'center',
                }}
              >
                <Avatar sx={{ bgcolor: 'white' }}>
                  <PersonIcon color="action" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {selectedFarmer?.first_name ?? ''}{' '}
                    {selectedFarmer?.last_name ?? ''}
                  </Typography>
                  <Typography variant="caption" display="block">
                    DNI: {selectedFarmer?.dni ?? ''} |{' '}
                    {selectedFarmer?.district?.name ?? ''}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    <Chip
                      label="VERIFICADO"
                      size="small"
                      color="success"
                      sx={{ fontSize: '0.6rem' }}
                    />
                    {/* <Chip
                      label="Deforestación Baja"
                      size="small"
                      variant="outlined"
                      color="success"
                      sx={{ fontSize: '0.6rem' }}
                    /> */}
                  </Stack>
                </Box>
              </Box>
              <TextField
                fullWidth
                label="MONTO A TRANSFERIR (PEN)"
                value={amount > 0 ? amount : ''}
                type="number"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">S/</InputAdornment>
                    ),
                  },
                }}
                onChange={(e) => handleChangeAmount(+e.target.value)}
              />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ bgcolor: '#f9fafb', borderRadius: 4, p: 3 }}>
              <Typography variant="caption" fontWeight="bold">
                INFORMACIÓN DE CUENTA
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Banco</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedFarmer?.bank_name || 'BCP'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Cuenta</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedFarmer?.bank_cc || '***-****-****-****'}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: 'white',
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid #eee',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    CCI
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="#f37021"
                  >
                    {selectedFarmer?.bank_cci || '***-****-****-****-****'}
                  </Typography>
                </Box>
              </Stack>
              <Button
                fullWidth
                variant="contained"
                loading={loadingTransfer}
                disabled={
                  loadingTransfer ||
                  !selectedFarmer ||
                  isNaN(amount) ||
                  amount <= 0
                }
                sx={{ mt: 4 }}
                onClick={handleCreateTransfer}
              >
                Ejecutar Transferencia
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default CreatePage;
