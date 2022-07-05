import React, {  useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import AuthContext from './AuthContext.js'
import { getToken } from './utils/auth.js';


function LoginRedirect(props) {
  let [searchParams] = useSearchParams();
  const { setLogin } = useContext(AuthContext);
  const authCode = searchParams.get('code');
  let navigate = useNavigate();

  useEffect(() => {
    const fetchToken = async (authCode) => {
      const status = await getToken(authCode);
      if (status) {
        setLogin(true);
      }
      else {
        navigate('/login');
      }
    }
    fetchToken(authCode);
  }, [authCode, setLogin, navigate]);

  return (
    <Backdrop open sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <CircularProgress color="inherit" />
    </Backdrop>
  )
}

export default LoginRedirect;
