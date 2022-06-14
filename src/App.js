import React, { Component } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Box from '@mui/material/Box';

import Header from './Header.js'
import Login from './Login.js'
import Main from './Main.js'

import './App.css';


class App extends Component {

  render() {
    return (
      <BrowserRouter basename={ process.env.PUBLIC_URL }>
        <Box sx={{ display: 'flex' }}>
          <Header />
          <Routes>
            <Route path="/" element=<Login/>/>
            <Route path="/*" element=<Main/>/>
          </Routes>

        </Box>
      </BrowserRouter>
    )
  }
}

export default App;
