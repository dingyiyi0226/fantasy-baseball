import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import FetchingText from '../../components/FetchingText.js';
import { selectLeague, selectTeams, selectStatCate } from '../metadataSlice.js';
import { fetchMatchupsUntilWeek, selectAllMatchups, allMatchupsIsLoading as isLoading } from './statsSlice.js';


function WinLoss() {
  const dispatch = useDispatch();
  const teams = useSelector(state => selectTeams(state));
  const league = useSelector(state => selectLeague(state));
  const statCate = useSelector(state => selectStatCate(state)).filter(s => !s.is_only_display_stat);

  const fetching = useSelector(state => isLoading(state));
  const allMatchupsRaw = useSelector(state => selectAllMatchups(state));  // {<team_id>: []}

  const [statTypes, setStatTypes] = useState(['B', 'P']);  // B: batting, P: pitching

  useEffect(() => {
    dispatch(fetchMatchupsUntilWeek({teamIDs: teams.map(t => t.team_id), week: league.current_week-1}));
  }, [teams, league, dispatch])

  const stats = useMemo(() => {  // {<team_id>: {<stat_id>: {win:, lose:, tie:}}}
    if (fetching) {
      return undefined;
    }
    console.log('all', allMatchupsRaw)
    let allStats = {};
    teams.forEach(team => {
      allStats[team.team_id] = {};
    })
    statCate.forEach(s => {
      Object.keys(allStats).forEach(team => {
        allStats[team][s.stat_id] = {'win': 0, 'lose': 0, 'tie': 0};
      })
    })
    teams.forEach(team => {
      allMatchupsRaw[team.team_id].forEach(week => {
        week.stat_winners.stat_winner.forEach(stat_winner => {
          if (stat_winner.is_tied) {
            allStats[team.team_id][stat_winner.stat_id].tie += 1;
          } else if (stat_winner.winner_team_key === team.team_key) {
            allStats[team.team_id][stat_winner.stat_id].win += 1;
          } else {
            allStats[team.team_id][stat_winner.stat_id].lose += 1;
          }
        })
      })
    })
    return allStats;
  }, [fetching, allMatchupsRaw, teams, statCate])

  const calStats = useMemo(() => {
    if (stats === undefined) {
      return undefined;
    }
    let sum = {};
    let rank = {};

    teams.forEach(team => {
      sum[team.team_id] = {'win': 0, 'lose': 0, 'tie': 0};
    })

    if (Object.keys(stats).length > 0) {
      teams.forEach(team => {
        for (let [stat, val] of Object.entries(stats[team.team_id])) {
          if (statTypes.includes(statCate.find(s => s.stat_id === Number(stat)).position_type)) {
            sum[team.team_id].win += val.win;
            sum[team.team_id].lose += val.lose;
            sum[team.team_id].tie += val.tie;
          }
        }
      })

      const points = teams.map(team => sum[team.team_id].win - sum[team.team_id].lose)
                          .sort((a, b) => b-a);
      teams.forEach(team => {
        rank[team.team_id] = points.indexOf(sum[team.team_id].win - sum[team.team_id].lose) + 1;
      })
    }

    return {'sum': sum, 'rank': rank};
  }, [stats, statTypes, teams, statCate])

  const onChangeType = (e, types) => {
    setStatTypes(types);
  }

  return (
    <Container>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-start">
        <ToggleButtonGroup
          value={statTypes}
          onChange={onChangeType}
          aria-label="type-selector"
        >
          <ToggleButton value="B" aria-label="Batting">Batting</ToggleButton>
          <ToggleButton value="P" aria-label="Pitching">Pitching</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {fetching ?
        <FetchingText /> :
        <TableContainer component={Paper} sx={{my: 2}}>
          <Table sx={{ minWidth: 700, 'th': {fontWeight: 'bold'}}} size="small" aria-label="stat-table">
            <TableHead>
              <TableRow>
                <TableCell sx={{minWidth: 70, maxWidth: 100}}> </TableCell>
                {teams.map((team) =>
                  <TableCell align="right" sx={{minWidth: 70}} key={team.team_id}>{team.name}</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {statCate.filter(stat => statTypes.includes(stat.position_type))
                .map((stat) => (
                <TableRow
                  key={stat.stat_id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell align="right" component="th" scope="row">
                    {stat.display_name}
                  </TableCell>
                  {Object.keys(stats).map((teamID) => {
                    const s = stats[teamID][stat.stat_id]
                    return <TableCell align="right" key={teamID}>{`${s.win}-${s.lose}-${s.tie}`}</TableCell>
                  })}
                </TableRow>
              ))}
              <TableRow
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell align="right" component="th" scope="row">
                  Sum
                </TableCell>
                {teams.map(team =>
                  <TableCell align="right" key={team.team_id}>
                    {`${calStats.sum[team.team_id].win}-${calStats.sum[team.team_id].lose}-${calStats.sum[team.team_id].tie}`}
                  </TableCell>
                )}
              </TableRow>
              <TableRow
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell align="right" component="th" scope="row">
                  Rank
                </TableCell>
                {teams.map(team =>
                  <TableCell align="right" key={team.team_id}>
                    {calStats.rank[team.team_id]}
                  </TableCell>
                )}
              </TableRow>

            </TableBody>
          </Table>
        </TableContainer>
      }
    </Container>
  )
}

export default WinLoss;
