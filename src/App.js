import React, { Component } from 'react';
import { BrowserRouter } from "react-router-dom";

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
          {this.state.isLogin ? <Main/> : <Public/>}
        </BrowserRouter>
      </AuthContext.Provider>
    )
  }
}

export default App;
