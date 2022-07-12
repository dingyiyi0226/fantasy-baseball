import React, { Component } from 'react';
import { BrowserRouter } from "react-router-dom";

import Box from '@mui/material/Box';

import AuthContext from './contexts/AuthContext.js';
import Main from './containers/Main.js';
import Public from './containers/Public';

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
            {this.state.isLogin ? <Main/> : <Public/>}
          </Box>
        </BrowserRouter>
      </AuthContext.Provider>
    )
  }
}

export default App;
