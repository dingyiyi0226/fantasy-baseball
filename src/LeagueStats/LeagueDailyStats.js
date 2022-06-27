import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';


import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { apis } from '../utils/apis.js';


function LeagueDailyStats(props) {

  const [fetching, setFetching] = useState(true);
  const [type, setType] = useState('value');  // 'value'|'rank'
  const [stats, setStats] = useState({});  // {<team_id>: [{stat_id:, value:, rank:}, ]}
  const [h2h, setH2H] = useState({});      // {<team_id>: {<opteam_id>: {win:, lose:, status: 'win'|'lose'|'tie' }}}

  const [matchupPair, setMatchupPair] = useState([]);
  const [week, setWeek] = useState(props.league.current_week);

  const [searchParams, setSearchParams] = useSearchParams();

  const matchupColors = [
    '#f9f8f1', '#F4FAE6', '#D9E5FA', '#F1D9FA', '#FAF2E1'
  ]

  const color = {
    win: '#F1D9FA',
    lose: '#FAF2E1',
    tie: '#f9f8f1'
  }

  const dates = useMemo(() => {
    const dates = []
    const gameWeek = props.game.game_weeks.game_week.find(w => w.week === week);

    const start = new Date(gameWeek.start.split('-')[0], gameWeek.start.split('-')[1]-1, gameWeek.start.split('-')[2]);
    const end = new Date(gameWeek.end.split('-')[0], gameWeek.end.split('-')[1]-1, gameWeek.end.split('-')[2]);
    for (let d = start; d <= end; d.setDate(d.getDate()+1)) {
      dates.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
    }
    return dates;
  }, [week, props.game]);

  useEffect(() => {
    const teams = props.league.teams.team;
    const statCate = props.league.settings.stat_categories.stats.stat.filter(s => !s.is_only_display_stat);
    let date = searchParams.get('date');
    if (!date) {
      const today = new Date();
      setSearchParams({date: `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`});
      return;
    }

    if (!dates.includes(date)){
      date = dates[0];
      setSearchParams({date: date});
      return;
    }

    const fetchStats = async (date) => {
      await getTeamsStatsByDate(date);
      setFetching(false);
    }

    const getTeamsStatsByDate = async (date) => {

      let teamsStats = {}
      const teamsStatsRaw = await apis.getTeamsStatsByDate(teams.length, date)
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

    fetchStats(date);
  }, [props.league, searchParams, setSearchParams, dates])

  useEffect(() => {
    const fetchStats = async (week) => {
      await getMatchupsByWeek(week);
    }

    const getMatchupsByWeek = async (week) => {
      let matchups = await apis.getMatchupsByWeek(week)
      let matchupPair = {}
      matchups.forEach((matchup, i) => {
        matchup.teams.team.forEach(team => {
          matchupPair[team.team_id] = i
        })
      })
      setMatchupPair(matchupPair);
    }

    fetchStats(week);
  }, [week])


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

  const onSelectWeek = (e) => {
    setWeek(e.target.value);
  }

  const onSelectDate = (e) => {
    if (fetching) {
      return;
    }
    setSearchParams({date: e.target.value});
    setFetching(true);
  }

  const onSelectType = (e) => {
    setType(e.target.value);
  }

  const league = props.league;
  const teams = props.league.teams.team;
  const statCate = props.league.settings.stat_categories.stats.stat.filter(s => !s.is_only_display_stat);

  return (
    <Container>
      <Grid container spacing={2} justifyContent="flex-start" alignItems="flex-end">
        <Grid item xs={2}>
          <InputLabel id="week-label">Week</InputLabel>
          <Select
            labelId="week-label"
            id="week-selector"
            value={week}
            onChange={onSelectWeek}
          >
            {[...Array(league.current_week-league.start_week+1).keys()].map(i => (
              <MenuItem value={i+league.start_week} key={i+league.start_week}>{i+league.start_week}</MenuItem>
            ))}

          </Select>
        </Grid>

        <Grid item xs={2}>
          <InputLabel id="date-label">Date</InputLabel>
          <Select
            labelId="date-label"
            id="date-selector"
            value={searchParams.get('date') || ''}
            onChange={onSelectDate}
          >
            {dates.map(date => (
              <MenuItem value={date} key={date}>{date}</MenuItem>
            ))}

          </Select>
        </Grid>
        <Grid item xs={2}>
          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={onSelectType}
            aria-label="type-selector"
          >
            <ToggleButton value="value" aria-label="value">Value</ToggleButton>
            <ToggleButton value="rank" aria-label="rank">Rank</ToggleButton>
          </ToggleButtonGroup>
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
                      <TableCell width="9%" align="right" style={{backgroundColor: matchupColors[matchupPair[team.team_id]]}}>
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
                        {stats[team.team_id] ?
                          (Object.values(stats[team.team_id]).reduce((pv, v) => pv+v.rank, 0) / 14).toFixed(2) :
                          null
                        }
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

export default LeagueDailyStats;
