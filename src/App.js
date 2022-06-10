import React, { Component } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';

import Stats from './Stats.js'
import TotalStats from './TotalStats.js'
import Sidebar from './Sidebar.js'
import Header from './Header.js'

import apis from './apis.js'
import './App.css';


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      league: {},
    }
  }

  componentDidMount() {
    this.getMetadata()
  }

  getMetadata = async () => {
    const league = await apis.getMetadata();
    this.setState({
      fetching: false,
      league: league,
    })
  }

  fetchingElement = <h3 className="fetching-text">Fetching</h3>

  render() {
    const { fetching } = this.state;
    return (
      <BrowserRouter>
        <Box sx={{ display: 'flex' }}>
          <Header />
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Toolbar variant="dense"/>
            <Routes>
              <Route path="/" element={fetching ? this.fetchingElement : <Stats league={this.state.league}/>} />
              <Route path="/weekly" element={fetching ? this.fetchingElement : <Stats league={this.state.league}/>} />
              <Route path="/total" element={fetching ? this.fetchingElement : <TotalStats league={this.state.league} />} />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    )
  }
}

export default App;
