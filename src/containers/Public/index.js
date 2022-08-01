import React from 'react';
import { Routes, Route, Navigate } from'react-router-dom';

import Box from '@mui/material/Box';

import HomePage from './HomePage.js';
import Login from './Login.js';
import LoginRedirect from './LoginRedirect.js';
import PublicHeader from './PublicHeader.js';
import Footer from '../../components/Footer.js';

function Public(props) {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column',  minHeight: '100vh'}}>
      <PublicHeader />
      <Box sx={{flexGrow: 1, p: 3}}>
        <Routes>
          <Route path="/">
            <Route index element=<Navigate to="home" replace={true} />/>
            <Route path="login" element=<Login/>/>
            <Route path="redirect" element=<LoginRedirect/>/>
            <Route path="home" element=<HomePage/>/>
            <Route path="*" element=<Navigate to="home" replace={true} />/>
          </Route>
        </Routes>
      </Box>
      <Footer />
    </Box>
  )
}

export default Public;
