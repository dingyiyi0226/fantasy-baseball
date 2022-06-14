import React, { Component } from 'react'

import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';

const oauth_link = `https://api.login.yahoo.com/oauth2/request_auth?client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&response_type=code`;


class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  render() {
    return (
      <Container>
        <Toolbar/>
        <a href={oauth_link}>
          <img src={process.env.PUBLIC_URL+'/yahoo_login.png'} alt="yahoo-login" width="300"/>
        </a>

        
      </Container>
    )
  }
}

export default Login