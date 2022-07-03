import React, { Component } from 'react';
import { Route, Routes, Navigate } from "react-router-dom";

import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';

import Home from './Home.js';
import Sidebar from './Sidebar.js';
import LeagueStats from './LeagueStats';
import TeamStats from './TeamStats';
import TotalStats from './TotalStats.js';
import LeaguePlayerRanking from './LeaguePlayerRanking.js';

import { apis } from './utils/apis.js';


class Main extends Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      game: {},
      league: {},
    }
  }

  componentDidMount() {
    this.getMetadata();
  }

  getMetadata = async () => {
    const metaData = await apis.getMetadata();
    this.setState({
      fetching: false,
      league: metaData.league,
      game: metaData.game,
    })
  }

  fetchingElement = <h3 className="fetching-text">Fetching</h3>


  render() {
    return (
      <React.Fragment>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar variant="dense"/>
          <Routes>
            <Route path="/">
              <Route index element=<Navigate to="home" replace={true} />/>
              <Route path="home" element={this.state.fetching ? this.fetchingElement : <Home league={this.state.league}/>} />
              <Route path="league/*" element={this.state.fetching ? this.fetchingElement : <LeagueStats league={this.state.league} game={this.state.game}/>} />
              <Route path="total" element={this.state.fetching ? this.fetchingElement : <TotalStats league={this.state.league} />} />
              <Route path="team/*" element={this.state.fetching ? this.fetchingElement : <TeamStats league={this.state.league} game={this.state.game}/>} />
              <Route path="player-ranking" element={this.state.fetching ? this.fetchingElement : <LeaguePlayerRanking league={this.state.league} />} />
            </Route>
          </Routes>
        </Box>
      </React.Fragment>
    )
  }
}

export default Main;
