import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import Weekly from './Weekly.js';

function Stats(props) {
  return (
    <Routes>
      <Route index element=<Navigate to="weekly" replace={true} />/>
      <Route path="daily" element={<Weekly league={props.league}/>}></Route>
      <Route path="weekly" element={<Weekly league={props.league}/>}></Route>
      <Route path="seasonal" element={<Weekly league={props.league}/>}></Route>
    </Routes>
  )
}

export default Stats;
