import React, {  useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';

import AuthContext from './AuthContext.js'
import { getToken } from './utils/auth.js';

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

function LoginRedirect(props) {
  let [searchParams] = useSearchParams();
  const { setLogin } = useContext(AuthContext);
  const authCode = searchParams.get('code');

  useEffect(() => {
    const fetchToken = async (authCode) => {
      await getToken(authCode);
      setLogin(true);
    }
    fetchToken(authCode);
  }, [authCode, setLogin]);

  return <Login/>
}

export { Login, LoginRedirect };
