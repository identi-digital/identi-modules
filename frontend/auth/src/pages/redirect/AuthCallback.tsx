import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  exchangeToken,
  getEntity,
  getTenantsOfEntity,
  getToken,
} from '../../services/identi';
import { alertMessage } from '@ui/utils/Messages';
import { useAuth } from '@core/auth/AuthContext';
// import routes from '~/routes/routes';
import {
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { Business } from '@mui/icons-material';
import ILoading from '@ui/components/molecules/IdentiLoading';

const AuthCallback: React.FC = () => {
  const { setUser, setOrganizationTenant } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [continueLoading, setContinueLoading] = useState<boolean>(false);
  const [showOrganizations, setShowOrganizations] = useState<boolean>(false);
  const [tenants, setTenants] = useState<any>([]);
  const [tenantSelected, setTenantSelected] = useState<string | null>(null);
  // const { assignFeaturesData } = useFeaturesContext();
  const navigate = useNavigate();

  const handleSelectTenant = useCallback(async (tenant: string) => {
    setTenantSelected(tenant);
  }, []);

  const handleSelectOrganization = useCallback(async () => {
    if (tenantSelected) {
      try {
        setContinueLoading(true);
        // cambiar al nuevo token
        const authx_resp = await exchangeToken(tenantSelected);
        if (authx_resp) {
          const { access_token } = authx_resp?.data;
          localStorage.setItem('token', access_token);
          localStorage.setItem('tenant_id', tenantSelected);
          // obtengo los datos del usuario
          const authx_user = await getEntity();
          // console.log(authx_user);
          if (authx_user && authx_user.status === 200) {
            const data = authx_user?.data;
            if (data) {
              // console.log(data);
              setUser && setUser(data);
              // const respCredentials = await getCredentials();
              // const { appId, javascriptKey, serverURL } = respCredentials?.data?.payload?.keys;
              // Parse.initialize(appId, javascriptKey);
              // Parse.serverURL = serverURL;
              setLoading(false);
              navigate('/farmers');
            }
          }
        }
      } catch (error) {
        // console.log(error);
        alertMessage('Problemas al ingresar, inténtelo nuevamente.', 'warning');
        setLoading(false);
        navigate('/');
        return;
      } finally {
        setContinueLoading(false);
      }
    } else {
      alertMessage('Seleccione una organización', 'error');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSelected]);

  const handleGetToken = useCallback(
    async (code: string) => {
      try {
        setLoading(true);
        const authx_resp = await getToken(code);
        console.log('authx_resp', authx_resp);
        if (authx_resp) {
          const { access_token, refresh_token, id_token } = authx_resp;
          localStorage.setItem('token', access_token);
          localStorage.setItem('refresh-token', refresh_token);
          localStorage.setItem('id_token', id_token);
          const authx_tenants = await getTenantsOfEntity();
          const tenants = authx_tenants;
          // const tenants = [
          //   {
          //     name: 'Identi Organization',
          //     short_name: 'IDENTI',
          //     tenant_id: 'Organization_1'
          //   },
          //   {
          //     name: 'Identi Org',
          //     short_name: 'Org',
          //     tenant_id: 'Organization_2'
          //   }
          // ];
          // console.log(tenants);
          if (tenants.length < 1) {
            alertMessage(
              'El usuario no pertenece a una organización válida',
              'error',
            );
            setLoading(false);
            navigate('/');
            return;
          }
          if (tenants.length === 1) {
            localStorage.setItem('tenant_id', tenants[0].tenant_id);
            setOrganizationTenant && setOrganizationTenant(tenants[0]);
            const authx_resp = await exchangeToken(tenants[0].tenant_id);
            const { access_token } = authx_resp;
            localStorage.setItem('token', access_token);
            // obtengo los datos del usuario
            const authx_user = await getEntity();
            console.log(authx_user);
            if (authx_user) {
              const data = authx_user;
              if (data) {
                setUser && setUser(data);
                setLoading(false);
                navigate('/farmers');
              }
            }
          } else {
            setShowOrganizations(true);
            setTenants(tenants);
            setLoading(false);
          }
          // console.log('authx_tenants:', authx_tenants);
        }
      } catch (error) {
        console.log(error);
        // alertMessage('Problemas al ingresar, inténtelo nuevamente.', 'warning');
        setLoading(false);
        navigate('/');
        return;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      console.log('code', code);
      handleGetToken(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginTop: '2rem',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 4,
        }}
      >
        <Box sx={{ maxWidth: 600 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              color: '#0A1929',
            }}
          >
            Ingresando con <span style={{ color: '#FF6B35' }}>Identi</span>
          </Typography>
          {loading ? (
            <ILoading />
          ) : (
            <>
              <Box
                sx={{
                  bgcolor: 'white',
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  opacity: showOrganizations ? 1 : 0,
                  transform: showOrganizations
                    ? 'translateY(0)'
                    : 'translateY(20px)',
                  transition: 'all 0.6s ease-in-out',
                }}
              >
                <Box
                  sx={{
                    bgcolor: '#0A1929',
                    py: 2,
                    px: 3,
                  }}
                >
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    Organizaciones
                  </Typography>
                </Box>
                <List sx={{ padding: 0 }}>
                  {tenants.map((tenant: any) => (
                    <ListItem key={tenant.tenant_id} disablePadding divider>
                      <ListItemButton
                        selected={tenantSelected === tenant.tenant_id}
                        onClick={() => {
                          handleSelectTenant(tenant.tenant_id);
                          setOrganizationTenant &&
                            setOrganizationTenant(tenant);
                        }}
                        sx={
                          tenantSelected === tenant.tenant_id
                            ? {
                                '&.Mui-selected': {
                                  background:
                                    'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0.05) 100%)',
                                  color: '#ff6b35',
                                  fontWeight: '600 !important',
                                },
                                '&.Mui-selected:hover': {
                                  background: 'rgba(255, 107, 53, 0.04)',
                                },
                              }
                            : {
                                '&:hover': {
                                  background: 'rgba(255, 107, 53, 0.04)',
                                },
                              }
                        }
                      >
                        <ListItemIcon>
                          <Business sx={{ color: '#FF6B35' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={tenant.name}
                          primaryTypographyProps={{ fontWeight: 'medium' }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Box mt={4}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={!tenantSelected}
                  // onClick={handleContinue}
                  sx={{
                    background: tenantSelected
                      ? 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)'
                      : undefined,
                    '&:hover': {
                      background: tenantSelected
                        ? 'linear-gradient(135deg, #e55a2b 0%, #cc4a1f 100%)'
                        : undefined,
                    },
                    boxShadow: tenantSelected
                      ? '0 4px 20px rgba(255, 107, 53, 0.4)'
                      : undefined,
                  }}
                  onClick={handleSelectOrganization}
                >
                  {continueLoading ? (
                    <CircularProgress size={20} sx={{ color: 'white' }} />
                  ) : (
                    'Continuar'
                  )}
                  {/* Continuar */}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AuthCallback;
