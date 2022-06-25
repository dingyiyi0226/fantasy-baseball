import React, { Component } from 'react'

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

import { apis } from '../utils/apis.js';


class TeamSeasonalStats extends Component {
  constructor(props) {
    super(props)

    this.league = props.league;
    this.teams = props.league.teams.team;
    this.statCate = props.league.settings.stat_categories.stats.stat.filter(s => !s.is_only_display_stat);
    this.gameWeeks = props.game.game_weeks.game_week;

    this.weeks = [...Array(props.league.current_week-props.league.start_week+1).keys()].map(i => i+props.league.start_week);
    this.state = {
      fetching: true,
      team: 1,
      stats: {},
      seasonalStats: {},
    }
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

  getTeamStats = async (team=null) => {
    let stats = {};

    await Promise.all(this.weeks.map(async (week) => {
      const stat = await apis.getTeamStatsByWeek(team || this.state.team, week);
      stats[week] = stat;
    }))

    const seasonalStats = await apis.getTeamStatsBySeason(team || this.state.team);

    this.setState({
      stats: stats,
      seasonalStats: seasonalStats,
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
          
          <Grid item xs={9}>
          </Grid>
        </Grid>

        {this.state.fetching ?
          <h3 className="fetching-text">Fetching</h3> :
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Week</TableCell>
                  {this.weeks.map(week => (
                    <TableCell width="10%" align="right">{week}</TableCell>
                  ))}
                  <TableCell>Total</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell></TableCell>
                  {this.weeks.map(week => {
                    const start = this.gameWeeks.find(w => w.week===week).start;
                    return (
                      <TableCell width="10%" align="right">{`${Number(start.split('-')[1])}/${Number(start.split('-')[2])}`}</TableCell>
                    )
                  })}
                  <TableCell></TableCell>
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
                    {this.weeks.map(week => (
                      <TableCell align="right">
                        {this.state.stats[week].find(s => s.stat_id === Number(stat.stat_id)).value}
                      </TableCell>
                    ))}
                    <TableCell>
                      {this.state.seasonalStats.find(s => s.stat_id === Number(stat.stat_id)).value}
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

export default TeamSeasonalStats;
