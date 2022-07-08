import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import DailyStats from './DailyStats.js';
import SeasonalStats from './SeasonalStats.js';
import WinLoss from './WinLoss.js';
import WeeklyStats from './WeeklyStats.js';

function LeagueStats(props) {
  return (
    <Routes>
      <Route index element=<Navigate to="weekly" replace={true} />/>
      <Route path="daily" element={<DailyStats league={props.league} game={props.game} />}></Route>
      <Route path="weekly" element={<WeeklyStats league={props.league}/>}></Route>
      <Route path="seasonal" element={<SeasonalStats league={props.league}/>}></Route>
      <Route path="win-loss" element={<WinLoss league={props.league}/>}></Route>
    </Routes>
  )
}

export default LeagueStats;
