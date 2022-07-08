import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import GitHubIcon from '@mui/icons-material/GitHub';

import AuthContext from './contexts/AuthContext.js';

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
    <AppBar position="fixed" elevation={3} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar variant="dense">
        <Typography variant="h6" color="inherit" component="div" sx={{ flexGrow: 1 }}>
          Fantasy Baseball
        </Typography>
        <Button color="inherit" value={isLogin ? "logout" : "login"} onClick={onLogin}>{isLogin ? "Logout" : "Login"}</Button>
        <IconButton
          size="large"
          aria-label="github repository"
          color="inherit"
          component={Link}
          href="https://github.com/dingyiyi0226/fantasy-baseball"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
