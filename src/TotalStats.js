import React, { Component } from 'react'

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Paper from '@mui/material/Paper';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

import { apis } from './apis.js'


class TotalStats extends Component {
  constructor(props) {
    super(props)

    this.league = props.league;
    this.teams = props.league.teams.team;
    this.statCate = props.league.settings.stat_categories.stats.stat.filter(s => !s.is_only_display_stat);

    this.state = {
      fetching: true,
      stats: {},
      calType: 'all', // 'all', 'batting', 'pitching'
      sum: {},
      rank: {},
    }
  }

  getMatchupsUntilWeek = async () => {

    let allStats = {}
    this.teams.forEach(team => {
      allStats[team.team_id] = {}
    })
    this.statCate.forEach(s => {
      Object.keys(allStats).forEach(key => {
        allStats[key][s.stat_id] = {'win': 0, 'lose': 0, 'tie': 0};
      })
    })

    const allMatchups = await apis.getMatchupsUntilWeek(this.teams.length, this.league.current_week-1)
    allMatchups.forEach(team => {
      team.matchups.matchup.forEach(week => {
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
    const calVal = this.calStats(this.state.calType, allStats);

    this.setState({
      stats: allStats,
      sum: calVal.sum,
      rank: calVal.rank,
      fetching: false,
    })
  }

  calStats = (calType, stats=null) => {
    let sum = {};
    let rank = {};

    if (stats === null) {
      stats = this.state.stats;
    }

    this.teams.forEach(team => {
      if (calType === 'pitching') {
        let result = {'win': 0, 'lose': 0, 'tie': 0};
        for (let [stat, val] of Object.entries(stats[team.team_id])) {
          if (this.statCate.find(s => s.stat_id === Number(stat)).position_type === 'P') {
            result.win += val.win;
            result.lose += val.lose;
            result.tie += val.tie;
          }
        }
        sum[team.team_id] = result;
      }
      else if (calType === 'batting') {
        let result = {'win': 0, 'lose': 0, 'tie': 0};
        for (let [stat, val] of Object.entries(stats[team.team_id])) {
          if (this.statCate.find(s => s.stat_id === Number(stat)).position_type === 'B') {
            result.win += val.win;
            result.lose += val.lose;
            result.tie += val.tie;
          }
        }
        sum[team.team_id] = result;
      }
      else {
        sum[team.team_id] = Object.values(stats[team.team_id])
          .reduce((pv, v) => ({'win': pv.win+v.win, 'lose': pv.lose+v.lose, 'tie': pv.tie+v.tie}), {'win': 0, 'lose': 0, 'tie': 0});
      }
    })

    const points = this.teams.map(team => sum[team.team_id].win - sum[team.team_id].lose)
                            .sort((a, b) => b-a)
    this.teams.forEach(team => {
      rank[team.team_id] = points.indexOf(sum[team.team_id].win - sum[team.team_id].lose) + 1;
    })

    return {'sum': sum, 'rank': rank}
  }

  onSelectType = (e) => {
    if (this.state.fetching) {
      return
    }

    const calVal = this.calStats(e.target.value);
    this.setState({
      calType: e.target.value,
      sum: calVal.sum,
      rank: calVal.rank,
    })
  }

  componentDidMount() {
    this.getMatchupsUntilWeek()
  }

  render() {
    return (
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              labelId="type-label"
              id="type-selector"
              value={this.state.calType}
              onChange={this.onSelectType}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="batting">Batting</MenuItem>
              <MenuItem value="pitching">Pitching</MenuItem>

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
                  <TableCell width="4%"> </TableCell>
                  {this.teams.map((team) =>
                    <TableCell align="right" width="9%">{team.name}</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {this.statCate.filter(stat => {
                  if (this.state.calType === 'pitching'){
                    return stat.position_type === 'P'
                  } else if (this.state.calType === 'batting') {
                    return stat.position_type === 'B'
                  } else {
                    return true
                  }}).map((stat) => (
                  <TableRow
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell align="right" component="th" scope="row">
                      {stat.display_name}
                    </TableCell>
                    {Object.keys(this.state.stats).map((teamID) => {
                      const s = this.state.stats[teamID][stat.stat_id]
                      return <TableCell align="right">{`${s.win}-${s.lose}-${s.tie}`}</TableCell>
                    })}
                  </TableRow>
                ))}
                <TableRow
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell align="right" component="th" scope="row">
                    Sum
                  </TableCell>
                  {this.teams.map(team =>
                    <TableCell align="right">
                      {`${this.state.sum[team.team_id].win}-${this.state.sum[team.team_id].lose}-${this.state.sum[team.team_id].tie}`}
                    </TableCell>
                  )}
                </TableRow>
                <TableRow
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell align="right" component="th" scope="row">
                    Rank
                  </TableCell>
                  {this.teams.map(team =>
                    <TableCell align="right">
                      {this.state.rank[team.team_id]}
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
}

export default TotalStats;