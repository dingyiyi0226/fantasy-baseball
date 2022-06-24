import React, { useEffect, useState } from 'react';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

import { apis } from '../utils/apis.js';


function Seasonal(props) {

  const [fetching, setFetching] = useState(true);
  const [type, setType] = useState('value');  // 'value'|'rank'
  const [stats, setStats] = useState({});  // {<team_id>: [{stat_id:, value:, rank:}, ]}
  const [h2h, setH2H] = useState({});      // {<team_id>: {<opteam_id>: {win:, lose:, status: 'win'|'lose'|'tie' }}}

  const color = {
    win: '#F1D9FA',
    lose: '#FAF2E1',
    tie: '#f9f8f1'
  }

  useEffect(() => {
    const teams = props.league.teams.team;
    const statCate = props.league.settings.stat_categories.stats.stat.filter(s => !s.is_only_display_stat);

    const fetchStats = async () => {
      await getTeamsStatsBySeason();
      setFetching(false);
    }

    const getTeamsStatsBySeason = async () => {

      let teamsStats = {}
      const teamsStatsRaw = await apis.getTeamsStatsBySeason(teams.length)
      teamsStatsRaw.forEach(team => {
        teamsStats[team.team_id] = team.team_stats.stats.stat.filter(s => s.stat_id !== 60 && s.stat_id !== 50);
      })

      Object.keys(teamsStats).forEach(team_id => {
        teamsStats[team_id].forEach((stat, i) => {
          if (stat.value === 'INF') {
            teamsStats[team_id][i].value = Infinity;
          }
        })
      })

      teamsStats = calulateRank(teamsStats);
      let h2h = calculateH2H(teamsStats);
      setStats(teamsStats);
      setH2H(h2h);
    }

    const calulateRank = (teamsStats) => {

      let statsT = {}
      statCate.forEach(s => {
        statsT[s.stat_id] = []
      })

      Object.values(teamsStats).forEach(stats => {
        stats.forEach(s => {
          statsT[s.stat_id].push(s.value)
        })
      })

      for (let [stat_id, stat] of Object.entries(statsT)){
        const sort_order = statCate.find(s => s.stat_id === Number(stat_id)).sort_order === 0;
        stat.sort((a, b) => sort_order ? a-b : b-a)
      }

      Object.values(teamsStats).forEach(stats => {
        stats.forEach(stat => {
          stat.rank = statsT[stat.stat_id].indexOf(stat.value) + 1;
        })
      })
      return teamsStats
    }

    const calculateH2H = (teamsStats) => {
      let h2h = {};
      teams.forEach(team => {
        h2h[team.team_id] = {};

        let myRanks = teamsStats[team.team_id].reduce((pv, v) => ({...pv, [v.stat_id]: v.rank}), {});

        Object.keys(teamsStats).filter(team_id => Number(team_id) !== team.team_id).forEach(team_id => {
          let opRanks = teamsStats[team_id].reduce((pv, v) => ({...pv, [v.stat_id]: v.rank}), {});
          let win = 0;
          let lose = 0;
          statCate.forEach(s => {
            if (myRanks[s.stat_id] < opRanks[s.stat_id]) {
              win += 1;
            }
            else if (myRanks[s.stat_id] > opRanks[s.stat_id]) {
              lose += 1;
            }
          })
          let status;
          if (win > lose) {
            status = 'win';
          } else if (win < lose) {
            status = 'lose';
          } else {
            status = 'tie';
          }
          let result = {
            win: win,
            lose: lose,
            status: status
          };
          h2h[team.team_id][team_id] = result;
        })
      })
      return h2h;
    }

    fetchStats();
  }, [props.league])


  const TeamH2HSumStr = (teamH2H) => {
    let win = 0;
    let lose = 0;
    let tie = 0;
    Object.values(teamH2H).forEach(opTeam => {
      if (opTeam.status === 'win') {
        win += 1;
      } else if (opTeam.status === 'lose') {
        lose += 1;
      } else {
        tie += 1;
      }
    })
    return `${win}-${lose}-${tie}`;
  }

  const onSelectType = (e) => {
    setType(e.target.value);
  }

  const teams = props.league.teams.team;
  const statCate = props.league.settings.stat_categories.stats.stat.filter(s => !s.is_only_display_stat);

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <InputLabel id="type-label">Type</InputLabel>
          <Select
            labelId="type-label"
            id="type-selector"
            value={type}
            onChange={onSelectType}
          >
            <MenuItem value="value">Value</MenuItem>
            <MenuItem value="rank">Rank</MenuItem>

          </Select>
        </Grid>
        <Grid item xs={9}>
        </Grid>

      </Grid>

      {fetching ?
        <h3 className="fetching-text">Fetching</h3> : (
          <React.Fragment>
            <TableContainer component={Paper} sx={{ my: 2 }}>
              <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell> </TableCell>
                    {teams.map((team) => (
                      <TableCell width="9%" align="right">
                        {team.name}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statCate.map((stat) => (
                    <TableRow
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell align="right" component="th" scope="row">
                        {stat.display_name}
                      </TableCell>
                      {type === 'value' ?
                        Object.keys(stats).map((teamID) => (
                        <TableCell align="right">
                          {stats[teamID].find(s => s.stat_id === Number(stat.stat_id)).value}
                        </TableCell>
                        )) :
                        Object.keys(stats).map((teamID) => (
                        <TableCell align="right">
                          {stats[teamID].find(s => s.stat_id === Number(stat.stat_id)).rank}
                        </TableCell>
                        ))
                      }
                    </TableRow>
                  ))}
                  <TableRow
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell align="right" component="th" scope="row">
                      Avg. Rank
                    </TableCell>
                    {teams.map(team =>
                      <TableCell align="right">
                        {(Object.values(stats[team.team_id])
                          .reduce((pv, v) => pv+v.rank, 0) / 14).toFixed(2)}
                      </TableCell>
                    )}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <TableContainer component={Paper} sx={{ my: 2 }}>
              <Table sx={{ minWidth: 650 }} size="small" aria-label="h2h table">
                <TableHead>
                  <TableRow>
                    <TableCell> </TableCell>
                    {teams.map((team) => (
                      <TableCell width="9%" align="right">
                        {team.name}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teams.map(team => (
                    <TableRow
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell align="right" component="th" scope="row">
                        {team.name}
                      </TableCell>
                      {teams.map(teamRow => {
                        if (team.team_id === teamRow.team_id) {
                          return <TableCell align="right"></TableCell>;
                        }
                        else {
                          let result = h2h[team.team_id][teamRow.team_id];
                          return <TableCell align="right" style={{backgroundColor: color[result.status]}}>{`${result.lose}-${result.win}`}</TableCell>;
                        }
                      })}
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell align="right">W-L-T</TableCell>
                    {teams.map((team) => (
                      <TableCell align="right">
                        {TeamH2HSumStr(h2h[team.team_id])}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </React.Fragment>
        )
      }
    </Container>
  )
}

export default Seasonal;
