import React, { useCallback } from 'react';
import { Grid, Box, useMediaQuery, Typography } from '@mui/material';
// import ForgotPassword from '../ForgotPassword';
import ThemeConfig from '@ui/Themes';
import './Login.css';
import IdentiLogo from '@ui/assets/img/identi_logo_dark.svg';
import { Fingerprint } from '@mui/icons-material';
import Button from '@/ui/components/atoms/Button/Button';
import { launchAuthentication } from '../../services/identi';

type LoginProps = unknown;

const Login: React.FC<LoginProps> = () => {
  // const matches = useMediaQuery('(min-width:960px)');
  // const [isActiveVerifyCode, setIsActiveVerifyCode] = useState<boolean>(false);
  // const [userName, setUserName] = useState<string>('');

  // const handleVerifyCode = useCallback((userName?: string) => {
  //   setUserName(userName ?? '');
  //   setIsActiveVerifyCode((prevValue: boolean) => !prevValue);
  // }, []);
  const matches2 = useMediaQuery('(min-width:640px)');

  // const handleOnClickShowTerms = useCallback(() => {
  //   history('/terminos_y_condiciones');
  // }, [history]);

  const handleIdentiLogin = useCallback(async () => {
    await launchAuthentication();
  }, []);

  return (
    <>
      <ThemeConfig>
        <Grid container style={{ height: '100%' }}>
          {/* {matches && ( */}
          <Grid
            size={{
              xs: 4,
              sm: 6,
              md: 6,
              lg: 6,
              xl: 6,
            }}
          >
            <div className="account">
              <div className="account__photo">
                <div className="account_Photo_img">
                  <Box
                    width="100%"
                    height="100%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Box color="white" fontSize={30} p={15}>
                      <img src={IdentiLogo} alt="Identi_logo" />
                    </Box>
                  </Box>
                </div>
              </div>
            </div>
          </Grid>
          {/* // )} */}
          <Grid
            size={{
              xs: 8,
              sm: 6,
              md: 6,
              lg: 6,
              xl: 6,
            }}
          >
            <div className="account">
              <div className="account__card">
                <Box
                  width="100%"
                  style={
                    matches2
                      ? {
                          padding: '0rem 6rem',
                        }
                      : {}
                  }
                >
                  <div className="account__head">
                    <h1>Login</h1>
                    <h5>Accede a tu cuenta</h5>
                  </div>
                  <div
                    style={{
                      position: 'relative',
                      textAlign: 'center',
                      marginTop: '2rem',
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#09304f',
                        fontSize: '1rem',
                      }}
                    >
                      Inicia sesión de forma segura con IDENTI
                    </Typography>
                    <Button
                      text="IDENTI"
                      color="primary"
                      variant="contained"
                      onClick={handleIdentiLogin}
                      sx={{
                        fontSize: '1.2rem',
                        padding: '1rem 6rem',
                        borderRadius: '0.8rem',
                      }}
                      startIcon={
                        <Fingerprint sx={{ fontSize: '2rem !important' }} />
                      }
                      // data-cy="login-button"
                    />
                  </div>
                </Box>
              </div>
            </div>
          </Grid>
        </Grid>
      </ThemeConfig>
    </>
  );
};

export default React.memo(Login);
