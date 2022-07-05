import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CircleIcon from '@mui/icons-material/Circle';

import FetchingText from '../components/FetchingText.js';
import { apis } from '../utils/apis.js';


function LeagueDailyStats(props) {

  const [fetching, setFetching] = useState(true);
  const [type, setType] = useState('value');  // 'value'|'rank'
  const [stats, setStats] = useState({});  // {<team_id>: [{stat_id:, value:, rank:}, ]}
  const [h2h, setH2H] = useState({});      // {<team_id>: {<opteam_id>: {win: [], lose: [], status: 'win'|'lose'|'tie' }}}

  const [opponent, setOpponent] = useState({});
  const [matchupPair, setMatchupPair] = useState({});
  const [week, setWeek] = useState(props.league.current_week);
  const [selectedTeam, setSelectedTeam] = useState(undefined);

  const [searchParams, setSearchParams] = useSearchParams();


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
    const statCate = props.league.settings.stat_categories.stats.stat;
    const statCateKey = statCate.reduce((pv, v) => ({...pv, [v.stat_id]: v}), {});
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
        teamsStats[team.team_id] = team.team_stats.stats.stat;
      })

      Object.keys(teamsStats).forEach(team_id => {
        teamsStats[team_id].forEach((stat, i) => {
          if (stat.value === 'INF') {
            teamsStats[team_id][i].value = Infinity;
          }
        })
      })

      calulateRank(teamsStats);
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
        const sort_order = statCateKey[stat_id].sort_order === 0;
        stat.sort((a, b) => sort_order ? a-b : b-a)
      }

      Object.values(teamsStats).forEach(stats => {
        stats.forEach(stat => {
          if(statCateKey[stat.stat_id].is_only_display_stat) {
            stat.rank = undefined;
          }
          else {
            stat.rank = statsT[stat.stat_id].indexOf(stat.value) + 1;
          }
        })
      })
    }

    const calculateH2H = (teamsStats) => {
      let h2h = {};
      let ranks = {};
      teams.forEach(team => {
        ranks[team.team_id] = teamsStats[team.team_id].reduce((pv, v) => ({...pv, [v.stat_id]: v.rank}), {});
      })

      teams.forEach(team => {
        h2h[team.team_id] = {};

        Object.keys(teamsStats).filter(team_id => Number(team_id) !== team.team_id).forEach(team_id => {
          let win = [];
          let lose = [];
          statCate.filter(s => !s.is_only_display_stat).forEach(s => {
            if (ranks[team.team_id][s.stat_id] < ranks[team_id][s.stat_id]) {
              win.push(s.stat_id);
            }
            else if (ranks[team.team_id][s.stat_id] > ranks[team_id][s.stat_id]) {
              lose.push(s.stat_id);
            }
          })
          let status;
          if (win.length > lose.length) {
            status = 'win';
          } else if (win.length < lose.length) {
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
      let opponent = {};
      let matchupPair = {}
      matchups.forEach((matchup, i) => {
        matchupPair[matchup.teams.team[0].team_id] = i;
        matchupPair[matchup.teams.team[1].team_id] = i;
        opponent[matchup.teams.team[0].team_id] = matchup.teams.team[1].team_id;
        opponent[matchup.teams.team[1].team_id] = matchup.teams.team[0].team_id;
      })
      setOpponent(opponent);
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

  const getRankAvg = (team) => {
    if (stats[team]) {
      const ranks = [];
      Object.values(stats[team]).forEach(s => {
        if (s.rank !== undefined){
          ranks.push(s.rank);
        }
      })
      return (ranks.reduce((pv, v) => pv+v, 0) / ranks.length).toFixed(2);
    }
    else {
      return null;
    }
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

  const onMouseEnterTeam = (e) => {
    setSelectedTeam(e.target.getAttribute('value'));
  }

  const onMouseLeaveTeam = (e) => {
    setSelectedTeam(undefined);
  }

  const league = props.league;
  const teams = props.league.teams.team;
  const statCate = props.league.settings.stat_categories.stats.stat;

  return (
    <Container>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-start">
        <FormControl variant="filled" sx={{ minWidth: 80 }}>
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
        </FormControl>
        <FormControl variant="filled" sx={{ minWidth: 80 }}>
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
        </FormControl>
        <ToggleButtonGroup
          value={type}
          exclusive
          onChange={onSelectType}
          aria-label="type-selector"
        >
          <ToggleButton value="value" aria-label="value">Value</ToggleButton>
          <ToggleButton value="rank" aria-label="rank">Rank</ToggleButton>
        </ToggleButtonGroup>

      </Stack>

      {fetching ?
        <FetchingText /> : (
          <React.Fragment>
            <TableContainer component={Paper} sx={{ my: 2 }}>
              <Table sx={{ minWidth: 700, 'th': {fontWeight: 'bold'}}} size="small" aria-label="stat-table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{minWidth: 70, maxWidth: 100}}> </TableCell>
                    {teams.map((team) => (
                      <TableCell align="right" sx={{minWidth: 70, bgcolor: `matchup.${matchupPair[team.team_id]}`}}
                        value={team.team_id} onMouseEnter={onMouseEnterTeam} onMouseLeave={onMouseLeaveTeam} key={team.team_id}>
                        {team.name}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statCate.map((stat) => (
                    <TableRow
                      key={stat.stat_id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 }, bgcolor: stat.is_only_display_stat ? `background.paperDark` : null}}
                    >
                      <TableCell align="right" component="th" scope="row">
                        {stat.display_name}
                      </TableCell>
                      {type === 'value' ?
                        Object.keys(stats).map((teamID) => (
                        <TableCell align="right" key={teamID}
                          sx={{bgcolor: (selectedTeam && matchupPair[selectedTeam] === matchupPair[teamID] && h2h[teamID][opponent[teamID]].win.includes(stat.stat_id)) ? 'background.paperDark' : null}}>
                          {stats[teamID].find(s => s.stat_id === Number(stat.stat_id)).value}
                        </TableCell>
                        )) :
                        Object.keys(stats).map((teamID) => (
                        <TableCell align="right" key={teamID}
                          sx={{bgcolor: (selectedTeam && matchupPair[selectedTeam] === matchupPair[teamID] && h2h[teamID][opponent[teamID]].win.includes(stat.stat_id)) ? 'background.paperDark' : null}}>
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
                      <TableCell align="right" key={team.team_id}>
                        {getRankAvg(team.team_id)}
                      </TableCell>
                    )}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Stack direction="row" spacing={1} sx={{ mt: 4 }}>
              <Chip icon={<CircleIcon sx={{ "&&": { color: "status.win" }}}/>} label="Win" variant="outlined" size="small"/>
              <Chip icon={<CircleIcon sx={{ "&&": { color: "status.lose" }}}/>} label="Lose" variant="outlined" size="small"/>
              <Chip icon={<CircleIcon sx={{ "&&": { color: "status.tie" }}}/>} label="Tie" variant="outlined" size="small"/>
            </Stack>

            <TableContainer component={Paper} sx={{ my: 2 }}>
              <Table sx={{ minWidth: 700, 'th': {fontWeight: 'bold'}}} size="small" aria-label="h2h-table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{minWidth: 70, maxWidth: 100}}> </TableCell>
                    {teams.map((team) => (
                      <TableCell align="right" sx={{minWidth: 70}} key={team.team_id}>
                        {team.name}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teams.map(team => (
                    <TableRow
                      key={team.team_id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell align="right" component="th" scope="row">
                        {team.name}
                      </TableCell>
                      {teams.map(teamRow => {
                        if (team.team_id === teamRow.team_id) {
                          return <TableCell align="right" key={teamRow.team_id}></TableCell>;
                        }
                        else {
                          let result = h2h[team.team_id][teamRow.team_id];
                          let colorType; // reverse win/lose color
                          if (result.status === 'win') {colorType = 'lose';}
                          else if (result.status === 'lose') {colorType = 'win';}
                          else {colorType = result.status;}

                          return (
                            <TableCell align="right" sx={{bgcolor: `status.${colorType}`}} key={teamRow.team_id}>
                              {`${result.lose.length}-${result.win.length}`}
                            </TableCell>
                          )
                        }
                      })}
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell align="right" component="th" scope="row">W-L-T</TableCell>
                    {teams.map((team) => (
                      <TableCell align="right" key={team.team_id}>
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
