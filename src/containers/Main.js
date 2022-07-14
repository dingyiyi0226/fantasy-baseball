import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';

import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';

import FetchingText from '../components/FetchingText.js';
import Footer from '../components/Footer.js';
import Header from './Header.js';
import LeagueHome from './LeagueHome.js';
import PlayerRanking from './PlayerRanking';
import Sidebar from './Sidebar.js';
import Stats from './Stats';
import Teams from './Teams';
import Transactions from './Transactions';

import { fetchMetadata, selectGame, selectLeague, isLoading } from './metadataSlice.js';

function Main() {

  const dispatch = useDispatch();
  const fetching = useSelector(state => isLoading(state));
  const game = useSelector(state => selectGame(state));
  const league = useSelector(state => selectLeague(state));

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMetadata());
  }, [dispatch])

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  }

  return (
    <Box sx={{ display: 'flex'}}>
      <Header toggleDrawer={toggleDrawer}/>
      <Sidebar drawerOpen={drawerOpen} toggleDrawer={toggleDrawer}/>
      <Box component="main" sx={{flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
        <Toolbar variant="dense"/>
        <Box sx={{flexGrow: 1, p: 3}}>
          <Routes>
            <Route path="/">
              <Route index element=<Navigate to="home" replace={true} />/>
              <Route path="home" element={fetching ? <FetchingText /> : <LeagueHome />} />
              <Route path="stats/*" element={fetching ? <FetchingText /> : <Stats />} />
              <Route path="teams/*" element={fetching ? <FetchingText /> : <Teams league={league} game={game}/>} />
              <Route path="player-ranking" element={fetching ? <FetchingText /> : <PlayerRanking league={league} />} />
              <Route path="transactions" element={fetching ? <FetchingText /> : <Transactions league={league} game={game}/>} />
            </Route>
          </Routes>
        </Box>
        <Footer />
      </Box>
    </Box>
  )
}

export default Main;
