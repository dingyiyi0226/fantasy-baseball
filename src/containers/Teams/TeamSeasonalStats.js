import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';

import FetchingText from '../../components/FetchingText.js';
import PageTitle from '../../components/PageTitle.js';
import { selectLeague, selectTeams, selectStatCate, selectGameWeeks } from '../metadataSlice.js';
import { setTeam, fetchSeasonalStats, selectSeasonalStats, selectWeeklyStats, seasonalStatsIsLoading as isLoading } from './teamsSlice.js';

function TeamSeasonalStats(props) {
  const { team } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const teams = useSelector(state => selectTeams(state));
  const league = useSelector(state => selectLeague(state));
  const statCate = useSelector(state => selectStatCate(state));
  const gameWeeks = useSelector(state => selectGameWeeks(state));

  const fetching = useSelector(state => isLoading(state));
  const weeklyStats = useSelector(state => selectWeeklyStats(state));
  const seasonalStats = useSelector(state => selectSeasonalStats(state));

  const weeks = useMemo(() =>
    [...Array(league.current_week-league.start_week+1).keys()].map(i => i+league.start_week)
  , [league])

  useEffect(() => {
    if (isNaN(parseInt(team)) || parseInt(team) > teams.length || parseInt(team) === 0) {
      navigate('/teams/1/seasonal');
    }
  }, [team, teams, navigate])

  useEffect(() => {
    if (isNaN(parseInt(team)) || parseInt(team) > teams.length || parseInt(team) === 0) {
      return;
    }
    dispatch(setTeam(team));
    dispatch(fetchSeasonalStats({team: team, weeks: weeks}));
  }, [team, teams, weeks, dispatch])

  const onSelectTeam = (e) => {
    if (fetching) {
      return
    }
    navigate(`/teams/${e.target.value}/seasonal`);
  }

  return (
    <Container>
      <PageTitle title="Seasonal Stats" subtitle={`Seasonal stats by week of team ${teams.find(t => t.team_id === Number(team)).name}`}/>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-start">
        <FormControl variant="filled" sx={{ minWidth: 160 }}>
          <InputLabel id="team-label">Team</InputLabel>
          <Select
            labelId="team-label"
            id="team-selector"
            value={team}
            onChange={onSelectTeam}
          >
            {teams.map(t => (
              <MenuItem value={t.team_id} key={t.team_id}>{t.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {fetching ?
        <FetchingText /> :
        <TableContainer component={Paper} sx={{ my: 2 }}>
          <Table sx={{ minWidth: 600, 'th': {fontWeight: 'bold'}}} size="small" aria-label="stat-table">
            <TableHead>
              <TableRow>
                <TableCell sx={{minWidth: 70, maxWidth: 100}}></TableCell>
                {weeks.map(week => (
                  <TableCell align="right" sx={{minWidth: 75}} key={week}>{`W. ${week}`}</TableCell>
                ))}
                <TableCell sx={{minWidth: 70, maxWidth: 100}}>Total</TableCell>
              </TableRow>
              <TableRow>
                <TableCell></TableCell>
                {weeks.map(week => {
                  const start = gameWeeks.find(w => w.week===week).start;
                  return (
                    <TableCell align="right" key={week}>{`${Number(start.split('-')[1])}/${Number(start.split('-')[2])}`}</TableCell>
                  )
                })}
                <TableCell></TableCell>
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
                  {weeks.map(week => (
                    <TableCell align="right" key={week}>
                      {weeklyStats[week].find(s => s.stat_id === Number(stat.stat_id)).value}
                    </TableCell>
                  ))}
                  <TableCell>
                    {seasonalStats.find(s => s.stat_id === Number(stat.stat_id)).value}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      }
    </Container>
  )
}

export default TeamSeasonalStats;
