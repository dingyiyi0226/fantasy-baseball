import React from 'react';
import { Routes, Route, Navigate } from'react-router-dom';

import Box from '@mui/material/Box';

import Login from './Login.js';
import LoginRedirect from './LoginRedirect.js';
import PublicHeader from './PublicHeader.js';
import Footer from '../../components/Footer.js';

function Public(props) {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column',  minHeight: '100vh'}}>
      <PublicHeader />
      <Routes>
        <Route path="/">
          <Route index element=<Navigate to="login" replace={true} />/>
          <Route path="login" element=<Login/>/>
          <Route path="home" element=<LoginRedirect/>/>
          <Route path="*" element=<Navigate to="login" replace={true} />/>
        </Route>
      </Routes>
      <Box sx={{flexGrow: 1}}/>
      <Footer />
    </Box>
  )
}

export default Public;
