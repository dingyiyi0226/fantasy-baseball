import React, { useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import GitHubIcon from '@mui/icons-material/GitHub';
import MenuIcon from '@mui/icons-material/Menu';

import AuthContext from '../contexts/AuthContext.js';

function Header(props) {
  const { setLogin } = useContext(AuthContext);
  let navigate = useNavigate();

  const onLogout = (e) => {
    setLogin(false);
    navigate("/login");
  }

  return (
    <AppBar position="fixed" elevation={3} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar variant="dense">
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={props.toggleDrawer}
          sx={{ mr: 1, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" color="inherit" component={RouterLink} to="/home" sx={{textDecoration: 'none', flexGrow: 1}}>
          Fantasy Baseball
        </Typography>

        <Button color="inherit" component={Link}
          href="https://baseball.fantasysports.yahoo.com" target="_blank" rel="noopener noreferrer">
          Official Site
        </Button>
        <Button color="inherit" value="logout" onClick={onLogout}>Logout</Button>
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

export default Header;

