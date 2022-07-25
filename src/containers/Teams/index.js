import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import TeamSeasonalStats from './TeamSeasonalStats.js';
import TeamWeeklyStats from './TeamWeeklyStats.js';
import TeamMatchups from './TeamMatchups.js';

function Teams(props) {
  return (
    <Routes>
      <Route index element=<Navigate to="1/" replace={true} />/>
      <Route path=":team" >
        <Route index element=<Navigate to="weekly" replace={true} />/>
        <Route path="weekly" element={<TeamWeeklyStats />}/>
        <Route path="seasonal" element={<TeamSeasonalStats />}/>
        <Route path="matchups" element={<TeamMatchups />}/>
      </Route>
    </Routes>
  )
}

export default Teams;
