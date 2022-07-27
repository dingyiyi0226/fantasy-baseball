import React from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import yahooLogin from './yahoo_login.png';

const oauth_link = `https://api.login.yahoo.com/oauth2/request_auth?client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&response_type=code`;


function Login(props) {
  return (
    <Container>
      <Toolbar variant="dense"/>
      <Box sx={{p: 3}}>
        <Stack direction="column" spacing={4} alignItems="center" justifyContent="center">
          <Typography variant="h3" align="center" sx={{fontWeight: 'bold'}}>
            Fantasy Baseball Helper
          </Typography>

          <a href={oauth_link}>
            <Box component="img" sx={{ width: 250 }} alt="yahoo-login" src={yahooLogin}/>
          </a>
          
        </Stack>
      </Box>
    </Container>
  )
}


export default Login;
