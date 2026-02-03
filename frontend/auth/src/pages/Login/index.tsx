import React, { useEffect } from 'react';
import { Box, Grid } from '@mui/material';
import ThemeConfig from '@ui/Themes';
import './Login.css';
import LogIn from './Login';

const Auth = () => {
  useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <>
      <ThemeConfig>
        <Grid>
          <Grid
            size={{
              xs: 4,
              sm: 6,
              md: 8,
              lg: 8,
              xl: 8,
            }}
          >
            <div className="account account__photo">
              <div className="account__wrapper"></div>
            </div>
          </Grid>
          <Grid
            size={{
              xs: 8,
              sm: 6,
              md: 4,
              lg: 4,
              xl: 4,
            }}
            style={{ background: 'white' }}
          >
            <Box my={3} mx={5}>
              <LogIn />
            </Box>
          </Grid>
        </Grid>
      </ThemeConfig>
    </>
  );
};

export default React.memo(Auth);
