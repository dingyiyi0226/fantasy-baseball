import React, { Component } from 'react'

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import { apis } from './apis.js';
import composite_stats from './composite_stats.js';


class Team extends Component {
  constructor(props) {
    super(props)

    this.league = props.league;
    this.teams = props.league.teams.team;
    this.statCate = props.league.settings.stat_categories.stats.stat.filter(s => !s.is_only_display_stat);
    this.gameWeeks = props.game.game_weeks.game_week;
    this.allStatCate = [];
    this.dates = [];

    this.state = {
      fetching: true,
      team: 1,
      week: props.league.current_week,
      types: ['Roster'], // 'Roster', 'BN', 'IL', 'NA'
      stats: {},
      rosters: {},
      total: {},
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

  onChangeType = (e) => {
    let total = {};
    this.setState(state => {
      let types = state.types;
      if (!e.target.checked && types.includes(e.target.value)) {
        types = types.filter(type => type !== e.target.value)
      }
      else if (e.target.checked && !types.includes(e.target.value)){
        types.push(e.target.value);
      }
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
    let roster;
    let stat;
    let stats = {};
    let rosters = {};
    let total = {};

    this.allStatCate = await apis.getAllStats();

    await Promise.all(this.dates.map(async (date) => {
      roster = await apis.getTeamRosterByDate(team || this.state.team, date);
      stat = await apis.getPlayerAllStatsByDate(roster.map(p => p.player_key), date);
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
        <Grid container spacing={2}>
          <Grid item xs={3}>
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
          </Grid>
          <Grid item xs={3}>
            <InputLabel id="week-label">Week</InputLabel>
            <Select
              labelId="week-label"
              id="week-selector"
              value={this.state.week}
              onChange={this.onSelectWeek}
            >
              {[...Array(this.league.current_week-this.league.start_week+1).keys()].map(i => (
                <MenuItem value={i+1} key={i+1}>{i+1}</MenuItem>
              ))}

            </Select>
          </Grid>
          <Grid item xs={5}>
            <FormGroup row>
              <FormControlLabel control={<Checkbox defaultChecked onChange={this.onChangeType} value="Roster"/>} label="Roster" />
              <FormControlLabel control={<Checkbox onChange={this.onChangeType} value="BN"/>} label="BN" />
              <FormControlLabel control={<Checkbox onChange={this.onChangeType} value="IL"/>} label="IL" />
              <FormControlLabel control={<Checkbox onChange={this.onChangeType} value="NA"/>} label="NA" />
            </FormGroup>
          </Grid>
          <Grid item xs={1}>
          </Grid>
        </Grid>

        {this.state.fetching ?
          <h3 className="fetching-text">Fetching</h3> :
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell> </TableCell>
                  {this.dates.map(date => (
                    <TableCell width="10%" align="right">{date}</TableCell>
                  ))}
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.statCate.map((stat) => (
                  <TableRow
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell align="right" component="th" scope="row">
                      {stat.display_name}
                    </TableCell>
                    {this.dates.map(date => (
                      <TableCell align="right">
                        {Math.round(this.state.total[date][stat.stat_id]*100)/100}
                      </TableCell>
                    ))}
                    <TableCell>
                      {Math.round(this.state.weeklyStats[stat.stat_id]*100)/100}
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

export default Team;