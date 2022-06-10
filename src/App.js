import React, { Component } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';

import Stats from './Stats.js'
import Sidebar from './Sidebar.js'
import Header from './Header.js'

import './App.css';


class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Box sx={{ display: 'flex' }}>
          <Header />
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Toolbar variant="dense"/>
            <Routes>
              <Route path="/" element={<Stats />} />
              <Route path="/weekly" element={<Stats />} />
              <Route path="/total" element="asfwef" />
            </Routes>


          </Box>
        </Box>
      </BrowserRouter>
    )
  }
}

export default App;
