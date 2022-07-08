import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import TeamSeasonalStats from './TeamSeasonalStats.js';
import TeamWeeklyStats from './TeamWeeklyStats.js';
import TeamMatchups from './TeamMatchups.js';

function Teams(props) {
  return (
    <Routes>
      <Route index element=<Navigate to="weekly" replace={true} />/>
      <Route path="weekly" element={<TeamWeeklyStats league={props.league} game={props.game}/>}></Route>
      <Route path="seasonal" element={<TeamSeasonalStats league={props.league} game={props.game}/>}></Route>
      <Route path="matchups" element={<TeamMatchups league={props.league} game={props.game}/>}></Route>
    </Routes>
  )
}

export default Teams;
