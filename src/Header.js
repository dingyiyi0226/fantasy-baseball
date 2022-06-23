import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import AuthContext from './AuthContext.js';

export default function Header() {
  const {isLogin, setLogin} = useContext(AuthContext);
  let navigate = useNavigate();

  const onLogin = (e) => {
    if (e.target.value === "login") {
      navigate("/login");
    }
    else {
      setLogin(false);
      navigate("/login");
    }
  }

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar variant="dense">
        <Typography variant="h6" color="inherit" component="div" sx={{ flexGrow: 1 }}>
          Fantasy Baseball
        </Typography>
        <Button color="inherit" value={isLogin ? "logout" : "login"} onClick={onLogin}>{isLogin ? "Logout" : "Login"}</Button>
      </Toolbar>
    </AppBar>
  );
}
