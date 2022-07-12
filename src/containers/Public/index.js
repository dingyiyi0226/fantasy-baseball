import React from 'react';
import { Routes, Route, Navigate } from'react-router-dom';

import Login from './Login.js';
import LoginRedirect from './LoginRedirect.js';
import PublicHeader from './PublicHeader.js';


function Public(props) {
  return (
    <React.Fragment>
      <PublicHeader />
      <Routes>
        <Route path="/">
          <Route index element=<Navigate to="login" replace={true} />/>
          <Route path="login" element=<Login/>/>
          <Route path="home" element=<LoginRedirect/>/>
          <Route path="*" element=<Navigate to="login" replace={true} />/>
        </Route>
      </Routes>
    </React.Fragment>
  )
}

export default Public;
