import React, { useEffect } from 'react';
import { Route, Routes, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';

import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';

import FetchingText from '../components/FetchingText.js';
import LeagueHome from './LeagueHome.js';
import PlayerRanking from './PlayerRanking';
import Sidebar from '../components/Sidebar.js';
import Stats from './Stats';
import Teams from './Teams';
import Transactions from './Transactions';

import { fetchMetadata, selectGame, selectLeague, isLoading } from './metadataSlice.js';

function Main() {

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
            <Route path="home" element={fetching ? <FetchingText /> : <LeagueHome />} />
            <Route path="stats/*" element={fetching ? <FetchingText /> : <Stats />} />
            <Route path="teams/*" element={fetching ? <FetchingText /> : <Teams league={league} game={game}/>} />
            <Route path="player-ranking" element={fetching ? <FetchingText /> : <PlayerRanking league={league} />} />
            <Route path="transactions" element={fetching ? <FetchingText /> : <Transactions league={league} game={game}/>} />
          </Route>
        </Routes>
      </Box>
    </React.Fragment>
  )
}

export default Main;
