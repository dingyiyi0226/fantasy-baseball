import React from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';

const oauth_link = `https://api.login.yahoo.com/oauth2/request_auth?client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&response_type=code`;


function Login(props) {
  return (
    <Container>
      <Toolbar/>
      <a href={oauth_link}>
        <Box component="img" sx={{ width: 250 }} alt="yahoo-login" src={process.env.PUBLIC_URL+'/yahoo_login.png'}/>
      </a>
    </Container>
  )
}


export default Login;
