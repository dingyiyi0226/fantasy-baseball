import React, { Component } from 'react'

import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';


import LoginImg from './yahoo_login.png';

const CLIENT_ID = 'dj0yJmk9N0U1Z01uTTRFZkpNJmQ9WVdrOVozY3dTakZQUVdnbWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PTI3';
// const REDIRECT_URI = 'https://dingyiyi0226.github.io/fantasy-baseball';
const REDIRECT_URI = 'https://localhost:3000/home';
const oauth_link = `https://api.login.yahoo.com/oauth2/request_auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;


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
          <img src={LoginImg} alt="yahoo-login" width="300"/>
        </a>

        
      </Container>
    )
  }
}

export default Login