import React, { Component } from 'react';
import { BrowserRouter } from "react-router-dom";

import AuthContext from './contexts/AuthContext';
import Main from './containers/Main';
import Public from './containers/Public';

import { tokenExisted, clearToken } from './utils/auth';


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
        <BrowserRouter basename={ import.meta.env.BASE_URL }>
          {this.state.isLogin ? <Main/> : <Public/>}
        </BrowserRouter>
      </AuthContext.Provider>
    )
  }
}

export default App;
