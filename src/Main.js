import React, { useEffect } from 'react';
import { Route, Routes, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';

import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';

import Home from './Home.js';
import Sidebar from './components/Sidebar.js';
import LeagueStats from './LeagueStats';
import TeamStats from './TeamStats';
import TotalStats from './TotalStats.js';
import LeaguePlayerRanking from './LeaguePlayerRanking.js';
import LeagueTransaction from './LeagueTransaction.js';
import FetchingText from './components/FetchingText.js';

import { fetchMetadata, selectGame, selectLeague, isLoading } from './metadataSlice.js';

function Main(props) {

  const dispatch = useDispatch();
  const fetching = useSelector(state => isLoading(state));
  const game = useSelector(state => selectGame(state));
  const league = useSelector(state => selectLeague(state));

  useEffect(() => {
    dispatch(fetchMetadata());
  }, [dispatch])

  return (
    <React.Fragment>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar variant="dense"/>
        <Routes>
          <Route path="/">
            <Route index element=<Navigate to="home" replace={true} />/>
            <Route path="home" element={fetching ? <FetchingText /> : <Home />} />
            <Route path="league/*" element={fetching ? <FetchingText /> : <LeagueStats league={league} game={game}/>} />
            <Route path="total" element={fetching ? <FetchingText /> : <TotalStats league={league} />} />
            <Route path="team/*" element={fetching ? <FetchingText /> : <TeamStats league={league} game={game}/>} />
            <Route path="player-ranking" element={fetching ? <FetchingText /> : <LeaguePlayerRanking league={league} />} />
            <Route path="transaction" element={fetching ? <FetchingText /> : <LeagueTransaction league={league} game={game}/>} />
          </Route>
        </Routes>
      </Box>
    </React.Fragment>
  )
}

export default Main;
