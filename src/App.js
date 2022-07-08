import React, { Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Box from '@mui/material/Box';

import AuthContext from './contexts/AuthContext.js';
import Header from './containers/Header.js';
import Login from './containers/Login.js';
import LoginRedirect from './containers/LoginRedirect.js';
import Main from './containers/Main.js';

import { tokenExisted, clearToken } from './utils/auth.js';


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLogin: tokenExisted(),
      setLogin: this.setLogin
    }
  }

  setLogin = (isLogin) => {
    if (!isLogin) {
      clearToken();
    }
    this.setState({
      isLogin: isLogin
    })
  }

  render() {
    return (
      <AuthContext.Provider value={this.state}>
        <BrowserRouter basename={ process.env.PUBLIC_URL }>
          <Box sx={{ display: 'flex' }}>
            <Header />
            {this.state.isLogin ? <Main/> : (
              <Routes>
                <Route path="/">
                  <Route index element=<Navigate to="login" replace={true} />/>
                  <Route path="login" element=<Login/>/>
                  <Route path="home" element=<LoginRedirect/>/>
                  <Route path="*" element=<Navigate to="login" replace={true} />/>
                </Route>
              </Routes>
            )}

          </Box>
        </BrowserRouter>
      </AuthContext.Provider>
    )
  }
}

export default App;
