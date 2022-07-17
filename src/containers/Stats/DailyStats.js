import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

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

import { to_fantasy_date } from '../../utils/timezone.js';
import FetchingText from '../../components/FetchingText.js';
import PageTitle from '../../components/PageTitle.js';
import PageSubtitle from '../../components/PageSubtitle.js';
import { selectLeague, selectGameWeeks, selectTeams, selectStatCate } from '../metadataSlice.js';
import { fetchMatchupsByWeek, fetchStatsByDate, selectMatchups, selectDailyStats, dailyIsLoading as isLoading } from './statsSlice.js';
import { statsPreprocessing, statsH2H, statsRankAvg, statsH2HSum } from './statsHelper.js';

function DailyStats() {
  const dispatch = useDispatch();
  const teams = useSelector(state => selectTeams(state));
  const league = useSelector(state => selectLeague(state));
  const statCate = useSelector(state => selectStatCate(state));
  const gameWeeks = useSelector(state => selectGameWeeks(state));

  const fetching = useSelector(state => isLoading(state));
  const matchups = useSelector(state => selectMatchups(state));
  const dailyStatsRaw = useSelector(state => selectDailyStats(state));

  const [week, setWeek] = useState(league.current_week);
  const [type, setType] = useState('value');  // 'value'|'rank'
  const [selectedTeam, setSelectedTeam] = useState(undefined);

  const [searchParams, setSearchParams] = useSearchParams();

  const dates = useMemo(() => {
    const dates = []
    const gameWeek = gameWeeks.find(w => w.week === week);

    const start = new Date(gameWeek.start.split('-')[0], gameWeek.start.split('-')[1]-1, gameWeek.start.split('-')[2]);
    const end = new Date(gameWeek.end.split('-')[0], gameWeek.end.split('-')[1]-1, gameWeek.end.split('-')[2]);
    for (let d = start; d <= end; d.setDate(d.getDate()+1)) {
      dates.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
    }
    return dates;
  }, [week, gameWeeks]);

  useEffect(() => {
    let date = searchParams.get('date');
    if (!date) {
      let today = new Date();
      today = to_fantasy_date(today);
      date = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    }
    if (!dates.includes(date)){
      date = dates[0];
    }
    if (date !== searchParams.get('date')) {
      setSearchParams({date: date});
      return;
    }

    dispatch(fetchStatsByDate({teamNum: teams.length, date: date}));
  }, [dispatch, searchParams, setSearchParams, teams, dates])

  useEffect(() => {
    dispatch(fetchMatchupsByWeek(week));
  }, [week, dispatch])


  const dailyStats = useMemo(() => {  // {<team_id>: [{stat_id:, value:, rank:}, ]}
    if (fetching) {
      return undefined;
    }
    return statsPreprocessing(dailyStatsRaw, statCate);
  }, [fetching, dailyStatsRaw, statCate])

  const h2h = useMemo(() => {
    if (dailyStats === undefined) {
      return undefined;
    }
    return statsH2H(dailyStats, statCate, teams);
  }, [dailyStats, statCate, teams])

  const rankAvg = useMemo(() => {
    if (dailyStats === undefined) {
      return undefined;
    }
    return statsRankAvg(dailyStats);
  }, [dailyStats])

  const h2hSum = useMemo(() => {
    if (h2h === undefined) {
      return undefined;
    }
    return statsH2HSum(h2h);
  }, [h2h])


  const matchupPair = useMemo(() => {
    if (matchups === undefined) {
      return {};
    }
    let matchupPair = {};
    matchups.forEach((matchup, i) => {
      matchupPair[matchup.teams.team[0].team_id] = i;
      matchupPair[matchup.teams.team[1].team_id] = i;
    })
    return matchupPair;
  }, [matchups])

  const opponent = useMemo(() => {
    if (matchups === undefined) {
      return {};
    }
    let opponent = {};
    matchups.forEach((matchup, i) => {
      opponent[matchup.teams.team[0].team_id] = matchup.teams.team[1].team_id;
      opponent[matchup.teams.team[1].team_id] = matchup.teams.team[0].team_id;
    })
    return opponent;
  }, [matchups])


  const onSelectWeek = (e) => {
    setWeek(e.target.value);
  }

  const onSelectDate = (e) => {
    if (fetching) {
      return;
    }
    setSearchParams({date: e.target.value});
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

  return (
    <Container>
      <PageTitle title="Daily Stats" subtitle={`${searchParams.get('date') || ''} stats summary by ${type}`}/>
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
                        Object.keys(dailyStats).map((teamID) => (
                        <TableCell align="right" key={teamID}
                          sx={{bgcolor: (selectedTeam && matchupPair[selectedTeam] === matchupPair[teamID] && h2h[teamID][opponent[teamID]].win.includes(stat.stat_id)) ? 'background.paperDark' : null}}>
                          {dailyStats[teamID].find(s => s.stat_id === Number(stat.stat_id)).value}
                        </TableCell>
                        )) :
                        Object.keys(dailyStats).map((teamID) => (
                        <TableCell align="right" key={teamID}
                          sx={{bgcolor: (selectedTeam && matchupPair[selectedTeam] === matchupPair[teamID] && h2h[teamID][opponent[teamID]].win.includes(stat.stat_id)) ? 'background.paperDark' : null}}>
                          {dailyStats[teamID].find(s => s.stat_id === Number(stat.stat_id)).rank}
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
                        {rankAvg[team.team_id]}
                      </TableCell>
                    )}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <PageSubtitle title="Matchup Results" subtitle={`Matchup results between teams of ${searchParams.get('date') || ''}`}/>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
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
                        {`${h2hSum[team.team_id].win}-${h2hSum[team.team_id].lose}-${h2hSum[team.team_id].tie}`}
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

export default DailyStats;
