import React, { Component } from 'react';

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

import { apis } from '../utils/apis.js';
import { composite_stats, composite_stats_formula } from '../utils/composite_stats.js';


class TeamWeeklyStats extends Component {
  constructor(props) {
    super(props)

    this.league = props.league;
    this.teams = props.league.teams.team;
    this.statCate = props.league.settings.stat_categories.stats.stat.filter(s => !s.is_only_display_stat);
    this.gameWeeks = props.game.game_weeks.game_week;
    this.allStatCate = props.game.stat_categories.stats.stat;
    this.dates = [];

    this.state = {
      fetching: true,
      team: 1,
      week: props.league.current_week,
      types: ['Roster'], // 'Roster', 'BN', 'IL', 'NA'
      compositeStatFormat: 'value', // 'value', 'raw'
      stats: {},    // {[date]: [player_stats,]}
      rosters: {},  // {[date]: [player,]}
      total: {},    // {[date]: {[stat_id]: value}}
      weeklyStats: {}, // {[stat_id]: value}
    }

    this.calculateDates();
  }

  calculateDates = (week=null) => {
    const dates = []
    const gameWeek = this.gameWeeks.find(w => w.week === (week || this.state.week));
    const start = new Date(gameWeek.start.split('-')[0], gameWeek.start.split('-')[1]-1, gameWeek.start.split('-')[2]);
    const end = new Date(gameWeek.end.split('-')[0], gameWeek.end.split('-')[1]-1, gameWeek.end.split('-')[2]);
    for (let d = start; d <= end; d.setDate(d.getDate()+1)) {
      dates.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
    }
    this.dates = dates;
  }

  onSelectTeam = (e) => {
    if (this.state.fetching) {
      return
    }
    this.setState({
      team: e.target.value,
      fetching: true
    })
    this.getTeamStats(e.target.value);
  }

  onSelectWeek = (e) => {
    if (this.state.fetching) {
      return
    }
    this.calculateDates(e.target.value);
    this.setState({
      week: e.target.value,
      fetching: true
    })
    this.getTeamStats();
  }

  onChangeType = (e, types) => {
    let total = {};
    this.setState(state => {
      for(let date of this.dates) {
        total[date] = this.calculateDailyStats(date, undefined, undefined, types);
      }
      const weeklyStats = this.calculateWeeklyStats(total);
      return {
        types: types,
        total: total,
        weeklyStats: weeklyStats,
      };
    })
  }

  onChangeCompositeStatsFormat = (e) => {
    this.setState(state => {
      Object.keys(state.total).forEach(date => {
        this.changeComposite(state.total[date], e.target.value === 'raw');
      })
      this.changeComposite(state.weeklyStats, e.target.value === 'raw');

      return {
        compositeStatFormat: e.target.value,
        total: state.total,
        weeklyStats: state.weeklyStats,
      }
    })
  }

  changeComposite = (stats, toStr) => {
    this.statCate.filter(stat => this.allStatCate.find(s => s.stat_id === stat.stat_id).is_composite_stat)
      .forEach(stat => {
        stats[stat.stat_id] = composite_stats(stats, stat.stat_id, toStr);
    })
  }

  calculateDailyStats = (date, roster=null, stats=null, types=null) => {
    let dailyTotal = {};
    let statFull;

    roster = roster || this.state.rosters[date];
    stats = stats || this.state.stats[date];
    types = types || this.state.types;
    roster = roster.filter(player => {
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

    stats = stats.filter(stat => roster.includes(stat.player_key));
    this.statCate.forEach(stat => {
      statFull = this.allStatCate.find(s => s.stat_id === stat.stat_id);

      if (statFull.is_composite_stat) {
        if (!Array.isArray(statFull.base_stats.base_stat)) {
          statFull.base_stats.base_stat = [statFull.base_stats.base_stat];
        }

        statFull.base_stats.base_stat.forEach(bs => {
          if (dailyTotal[bs.stat_id] === undefined) {
            dailyTotal[bs.stat_id] = stats.reduce((pv, v) => {
              let value = v.player_stats.stats.stat.find(s => s.stat_id === bs.stat_id)?.value ?? 0;
              return pv + (isNaN(value) ? 0 : value);
            }, 0);
          }
        })
        dailyTotal[stat.stat_id] = composite_stats(dailyTotal, stat.stat_id);
      }
      else {
        if (dailyTotal[stat.stat_id] === undefined) {
          dailyTotal[stat.stat_id] = stats.reduce((pv, v) => {
            let value = v.player_stats.stats.stat.find(s => s.stat_id === stat.stat_id)?.value ?? 0;
            return pv + (isNaN(value) ? 0 : value);
          }, 0);
        }
      }
    })

    return dailyTotal;
  }

  calculateWeeklyStats = (stats=null) => {
    stats = stats || this.state.total;

    let weeklyStats = {};
    let statFull;
    this.statCate.forEach(stat => {
      statFull = this.allStatCate.find(s => s.stat_id === stat.stat_id);
      if (statFull.is_composite_stat) {
        statFull.base_stats.base_stat.forEach(bs => {
          if (weeklyStats[bs.stat_id] === undefined) {
            weeklyStats[bs.stat_id] = Object.values(stats).reduce((pv, v) => {
              return pv + (isNaN(v[bs.stat_id]) ? 0 : v[bs.stat_id]);
            }, 0);
          }
        })
        weeklyStats[stat.stat_id] = composite_stats(weeklyStats, stat.stat_id);
      }
      else {
        if (weeklyStats[stat.stat_id] === undefined) {
          weeklyStats[stat.stat_id] = Object.values(stats).reduce((pv, v) => {
            return pv + (isNaN(v[stat.stat_id]) ? 0 : v[stat.stat_id]);
          }, 0);
        }
      }

    })
    return weeklyStats;
  }

  getTeamStats = async (team) => {
    let stats = {};
    let rosters = {};
    let total = {};

    await Promise.all(this.dates.map(async (date) => {
      const roster = await apis.getTeamRosterByDate(team || this.state.team, date);
      const stat = await apis.getPlayerAllStatsByDate(roster.map(p => p.player_key), date);
      stats[date] = stat;
      rosters[date] = roster;
      total[date] = this.calculateDailyStats(date, roster, stat);
    }))

    const weeklyStats = this.calculateWeeklyStats(total);

    this.setState({
      stats: stats,
      rosters: rosters,
      total: total,
      weeklyStats: weeklyStats,
      fetching: false
    })
  }

  async componentDidMount() {
    await this.getTeamStats();
  }

  render() {
    return (
      <Container>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-start">
          <FormControl variant="filled" sx={{ minWidth: 160 }}>
            <InputLabel id="team-label">Team</InputLabel>
            <Select
              labelId="team-label"
              id="team-selector"
              value={this.state.team}
              onChange={this.onSelectTeam}
            >
              {this.teams.map(team => (
                <MenuItem value={team.team_id} key={team.team_id}>{team.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="filled" sx={{ minWidth: 80 }}>
            <InputLabel id="week-label">Week</InputLabel>
            <Select
              labelId="week-label"
              id="week-selector"
              value={this.state.week}
              onChange={this.onSelectWeek}
            >
              {[...Array(this.league.current_week-this.league.start_week+1).keys()].map(i => (
                <MenuItem value={i+this.league.start_week} key={i+this.league.start_week}>{i+this.league.start_week}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <ToggleButtonGroup
            value={this.state.types}
            onChange={this.onChangeType}
            aria-label="type-selector"
          >
            <ToggleButton value="Roster" aria-label="Roster">Roster</ToggleButton>
            <ToggleButton value="BN" aria-label="BN">BN</ToggleButton>
            <ToggleButton value="IL" aria-label="IL">IL</ToggleButton>
            <ToggleButton value="NA" aria-label="NA">NA</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup
            value={this.state.compositeStatFormat}
            exclusive
            onChange={this.onChangeCompositeStatsFormat}
            aria-label="composite-stats-format"
          >
            <ToggleButton value="value" aria-label="value">Value</ToggleButton>
            <ToggleButton value="raw" aria-label="raw">Raw</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {this.state.fetching ?
          <h3 className="fetching-text">Fetching</h3> :
          <TableContainer component={Paper} sx={{ my: 2 }}>
            <Table sx={{ minWidth: 700, 'th': {fontWeight: 'bold'}}} size="small" aria-label="stat-table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{minWidth: 70, maxWidth: 100}}> </TableCell>
                  {this.dates.map(date => (
                    <TableCell align="right" sx={{minWidth: 70}} key={date}>{date}</TableCell>
                  ))}
                  <TableCell sx={{minWidth: 70, maxWidth: 100}}>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.statCate.map((stat) => (
                  <TableRow
                    key={stat.stat_id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell align="right" component="th" scope="row">
                      {this.state.compositeStatFormat === "raw" && this.allStatCate.find(s => s.stat_id === stat.stat_id).is_composite_stat ? (
                        <Tooltip title={composite_stats_formula(stat.stat_id)}>
                          <Typography variant="span">{stat.display_name}</Typography>
                        </Tooltip>
                      ) : stat.display_name}
                    </TableCell>
                    {this.dates.map(date => (
                      <TableCell align="right" key={date}>
                        {isNaN(this.state.total[date][stat.stat_id]) ?
                          this.state.total[date][stat.stat_id] || 'NaN' :
                          Math.round(this.state.total[date][stat.stat_id]*100)/100
                        }
                      </TableCell>
                    ))}
                    <TableCell>
                      {isNaN(this.state.weeklyStats[stat.stat_id]) ?
                        this.state.weeklyStats[stat.stat_id] || 'NaN':
                        Math.round(this.state.weeklyStats[stat.stat_id]*100)/100
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
}

export default TeamWeeklyStats;