import React, { Component } from 'react'
import { Routes, Route } from "react-router-dom";

import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';

import Home from './Home.js'
import Sidebar from './Sidebar.js';
import Stats from './Stats.js'
import TotalStats from './TotalStats.js'

import { apis, getToken } from './apis.js'


class Main extends Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      league: {},
    }
  }

  componentDidMount() {
    this.getMetadata(null);
  }

  getMetadata = async (authCode) => {
    if (authCode){
      await getToken(authCode);
    }
    const league = await apis.getMetadata();
    this.setState({
      fetching: false,
      league: league,
    })
    return league;
  }

  fetchingElement = <h3 className="fetching-text">Fetching</h3>


  render() {
    return (
      <React.Fragment>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar variant="dense"/>
          <Routes>
            <Route path="/home" element=<Home getMetadata={this.getMetadata} league={this.state.league}/> />
            <Route path="/weekly" element={this.state.fetching ? this.fetchingElement : <Stats league={this.state.league}/>} />
            <Route path="/total" element={this.state.fetching ? this.fetchingElement : <TotalStats league={this.state.league} />} />
          </Routes>
        </Box>
      </React.Fragment>
    )
  }
}

export default Main;
