import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import FetchingText from '../components/FetchingText.js';
import { apis } from '../utils/apis.js';
import { composite_stats, composite_stats_formula } from '../utils/composite_stats.js';
import { selectLeague, selectTeams, selectStatCate, selectStatCateFull, selectGameWeeks } from '../metadataSlice.js';


function TeamWeeklyStats(props) {

  const teams = useSelector(state => selectTeams(state));
  const league = useSelector(state => selectLeague(state));
  const statCate = useSelector(state => selectStatCate(state));
  const statCateFull = useSelector(state => selectStatCateFull(state));
  const gameWeeks = useSelector(state => selectGameWeeks(state));

  const [fetching, setFetching] = useState(true);
  const [team, setTeam] = useState(1);
  const [week, setWeek] = useState(league.current_week);
  const [types, setTypes] = useState(['Roster']);  // 'Roster', 'BN', 'IL', 'NA'
  const [compStatFormat, setCompStatFormat] = useState('value');  // 'value', 'raw'
  const [stats, setStats] = useState({});      // {[date]: [player_stats,]}
  const [rosters, setRosters] = useState({});  // {[date]: [player,]}

  const dates = useMemo(() => {
    const dates = []
    const gameWeek = gameWeeks.find(w => w.week === (week));
    const start = new Date(gameWeek.start.split('-')[0], gameWeek.start.split('-')[1]-1, gameWeek.start.split('-')[2]);
    const end = new Date(gameWeek.end.split('-')[0], gameWeek.end.split('-')[1]-1, gameWeek.end.split('-')[2]);
    for (let d = start; d <= end; d.setDate(d.getDate()+1)) {
      dates.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
    }
    return dates;
  }, [week, gameWeeks])

  useEffect(() => {
    const getTeamStats = async () => {
      let stats = {};
      let rosters = {};

      await Promise.all(dates.map(async (date) => {
        const roster = await apis.getTeamRosterByDate(team, date);
        let stat;
        if (roster.length > 25) {
          const [stat1, stat2] =  await Promise.all([
            apis.getPlayerAllStatsByDate(roster.slice(0, 25).map(p => p.player_key), date),
            apis.getPlayerAllStatsByDate(roster.slice(25).map(p => p.player_key), date)
          ]);
          stat = stat1.concat(stat2);
        }
        else {
          stat = await apis.getPlayerAllStatsByDate(roster.map(p => p.player_key), date);
        }

        stats[date] = stat;
        rosters[date] = roster;
      }))
      setStats(stats);
      setRosters(rosters);
      setFetching(false);
    }
    getTeamStats();
  }, [team, dates])

  const dailyStats = useMemo(() => {  // {[date]: {[stat_id]: value}}
    if (Object.keys(stats).length === 0 || Object.keys(rosters).length === 0) {
      return {};
    }
    let totalStats = {};

    Object.keys(stats).forEach(date => {
      let dailyTotal = {};
      let statFull;

      const roster = rosters[date].filter(player => {
        if (types.includes(player.selected_position.position)){
          return true;
        }
        else if (types.includes('Roster')) {
          return !['BN', 'IL', 'NA'].includes(player.selected_position.position);
        }
        else {
          return false;
        }
      }).map(player => player.player_key);

      const dailyStats = stats[date].filter(stat => roster.includes(stat.player_key));

      statCate.forEach(stat => {
        statFull = statCateFull.find(s => s.stat_id === stat.stat_id);
        if (statFull.is_composite_stat) {
          const baseStats = Array.isArray(statFull.base_stats.base_stat) ? statFull.base_stats.base_stat : [statFull.base_stats.base_stat];

          baseStats.forEach(bs => {
            if (dailyTotal[bs.stat_id] === undefined) {
              dailyTotal[bs.stat_id] = dailyStats.reduce((pv, v) => {
                let value = v.player_stats.stats.stat.find(s => s.stat_id === bs.stat_id)?.value ?? 0;
                return pv + (isNaN(value) ? 0 : value);
              }, 0);
            }
          })
          dailyTotal[stat.stat_id] = composite_stats(dailyTotal, stat.stat_id, compStatFormat === 'raw');
        }
        else {
          if (dailyTotal[stat.stat_id] === undefined) {
            dailyTotal[stat.stat_id] = dailyStats.reduce((pv, v) => {
              let value = v.player_stats.stats.stat.find(s => s.stat_id === stat.stat_id)?.value ?? 0;
              return pv + (isNaN(value) ? 0 : value);
            }, 0);
          }
        }
      })
      totalStats[date] = dailyTotal;
    })

    return totalStats;

  }, [stats, rosters, types, compStatFormat, statCate, statCateFull])

  const weeklyStats = useMemo(() => {  // {[stat_id]: value}
    let weeklyStats = {};
    let statFull;

    statCate.forEach(stat => {
      statFull = statCateFull.find(s => s.stat_id === stat.stat_id);
      if (statFull.is_composite_stat) {
        const baseStats = Array.isArray(statFull.base_stats.base_stat) ? statFull.base_stats.base_stat : [statFull.base_stats.base_stat];

        baseStats.forEach(bs => {
          if (weeklyStats[bs.stat_id] === undefined) {
            weeklyStats[bs.stat_id] = Object.values(dailyStats).reduce((pv, v) => {
              return pv + (isNaN(v[bs.stat_id]) ? 0 : v[bs.stat_id]);
            }, 0);
          }
        })
        weeklyStats[stat.stat_id] = composite_stats(weeklyStats, stat.stat_id, compStatFormat === 'raw');
      }
      else {
        if (weeklyStats[stat.stat_id] === undefined) {
          weeklyStats[stat.stat_id] = Object.values(dailyStats).reduce((pv, v) => {
            return pv + (isNaN(v[stat.stat_id]) ? 0 : v[stat.stat_id]);
          }, 0);
        }
      }
    })
    return weeklyStats;
  }, [dailyStats, compStatFormat, statCate, statCateFull])

  const onSelectTeam = (e) => {
    if (fetching) {
      return
    }
    setTeam(e.target.value);
    setFetching(true);
  }

  const onSelectWeek = (e) => {
    if (fetching) {
      return
    }
    setWeek(e.target.value);
    setFetching(true);
  }

  const onChangeType = (e, types) => {
    setTypes(types);
  }

  const onChangeCompStatsFormat = (e) => {
    setCompStatFormat(e.target.value);
  }

  return (
    <Container>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-start">
        <FormControl variant="filled" sx={{ minWidth: 160 }}>
          <InputLabel id="team-label">Team</InputLabel>
          <Select
            labelId="team-label"
            id="team-selector"
            value={team}
            onChange={onSelectTeam}
          >
            {teams.map(team => (
              <MenuItem value={team.team_id} key={team.team_id}>{team.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
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
        <ToggleButtonGroup
          value={types}
          onChange={onChangeType}
          aria-label="type-selector"
        >
          <ToggleButton value="Roster" aria-label="Roster">Roster</ToggleButton>
          <ToggleButton value="BN" aria-label="BN">BN</ToggleButton>
          <ToggleButton value="IL" aria-label="IL">IL</ToggleButton>
          <ToggleButton value="NA" aria-label="NA">NA</ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          value={compStatFormat}
          exclusive
          onChange={onChangeCompStatsFormat}
          aria-label="comp-stats-format"
        >
          <ToggleButton value="value" aria-label="value">Value</ToggleButton>
          <ToggleButton value="raw" aria-label="raw">Raw</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {fetching ?
        <FetchingText /> :
        <TableContainer component={Paper} sx={{ my: 2 }}>
          <Table sx={{ minWidth: 700, 'th': {fontWeight: 'bold'}}} size="small" aria-label="stat-table">
            <TableHead>
              <TableRow>
                <TableCell sx={{minWidth: 70, maxWidth: 100}}> </TableCell>
                {dates.map(date => (
                  <TableCell align="right" sx={{minWidth: 70}} key={date}>{date}</TableCell>
                ))}
                <TableCell sx={{minWidth: 70, maxWidth: 100}}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statCate.map((stat) => (
                <TableRow
                  key={stat.stat_id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, bgcolor: stat.is_only_display_stat ? `background.paperDark` : null}}
                >
                  <TableCell align="right" component="th" scope="row">
                    {compStatFormat === "raw" && statCateFull.find(s => s.stat_id === stat.stat_id).is_composite_stat ? (
                      <Tooltip title={composite_stats_formula(stat.stat_id)}>
                        <Typography variant="span">{stat.display_name}</Typography>
                      </Tooltip>
                    ) : stat.display_name}
                  </TableCell>
                  {dates.map(date => (
                    <TableCell align="right" key={date}>
                      {isNaN(dailyStats[date][stat.stat_id]) ?
                        dailyStats[date][stat.stat_id] || 'NaN' :
                        Math.round(dailyStats[date][stat.stat_id]*100)/100
                      }
                    </TableCell>
                  ))}
                  <TableCell>
                    {isNaN(weeklyStats[stat.stat_id]) ?
                      weeklyStats[stat.stat_id] || 'NaN':
                      Math.round(weeklyStats[stat.stat_id]*100)/100
                    }
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

export default TeamWeeklyStats;
