import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import LeagueDailyStats from './LeagueDailyStats.js';
import LeagueSeasonalStats from './LeagueSeasonalStats.js';
import LeagueWeeklyStats from './LeagueWeeklyStats.js';

function LeagueStats(props) {
  return (
    <Routes>
      <Route index element=<Navigate to="weekly" replace={true} />/>
      <Route path="daily" element={<LeagueDailyStats league={props.league} game={props.game} />}></Route>
      <Route path="weekly" element={<LeagueWeeklyStats league={props.league}/>}></Route>
      <Route path="seasonal" element={<LeagueSeasonalStats league={props.league}/>}></Route>
    </Routes>
  )
}

export default LeagueStats;
