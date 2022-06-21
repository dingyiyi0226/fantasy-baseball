import React, { Component } from 'react'

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

import { apis } from './utils/apis.js'


class Stats extends Component {
  constructor(props) {
    super(props)

    this.state = {
      fetchStats: true,
      week: props.league.current_week,
      type: 'value', // 'value', 'rank'
      stats: {},
      h2h: {},
      matchups: [],
      matchupColors: [],
    }

    this.league = props.league;
    this.teams = props.league.teams.team;
    this.statCate = props.league.settings.stat_categories.stats.stat.filter(s => !s.is_only_display_stat);

    this.matchupColors = [
      '#f9f8f1', '#F4FAE6', '#D9E5FA', '#F1D9FA', '#FAF2E1'
    ]
    this.color = {
      win: '#F1D9FA',
      lose: '#FAF2E1',
      tie: '#f9f8f1'
    }
  }

  getTeamsStatsByWeek = async (week=null) => {
    let stats = {}
    const allStats = await apis.getTeamsStatsByWeek(this.teams.length, week || this.state.week)
    allStats.forEach(team => {
      stats[team.team_id] = team.team_stats.stats.stat.filter(s => s.stat_id !== 60 && s.stat_id !== 50);
    })

    stats = this.calulateRank(stats);
    let h2h = this.calculateH2H(stats);
    this.setState(state => ({
      stats: stats,
      h2h: h2h
    }))
  }

  getMatchupsByWeek = async (week=null) => {
    let matchups = await apis.getMatchupsByWeek(week || this.state.week)
    let matchupsColor = {}
    matchups.forEach((matchup, i) => {
      matchup.teams.team.forEach(team => {
        matchupsColor[team.team_id] = i
      })
    })
    this.setState({
      matchupColors: matchupsColor,
      matchups: matchups
    })
  }

  calulateRank = (allStats) => {

    let statsT = {}
    this.statCate.forEach(s => {
      statsT[s.stat_id] = []
    })

    Object.values(allStats).forEach(stats => {
      stats.forEach(s => {
        statsT[s.stat_id].push(s.value)
      })
    })

    for (let [stat_id, stat] of Object.entries(statsT)){
      const sort_order = this.statCate.find(s => s.stat_id === Number(stat_id)).sort_order === 0;
      stat.sort((a, b) => sort_order ? a-b : b-a)
    }

    Object.values(allStats).forEach(stats => {
      stats.forEach(stat => {
        stat.rank = statsT[stat.stat_id].indexOf(stat.value) + 1;
      })
    })
    return allStats
  }

  calculateH2H = (allStats) => {
    let h2h = {};
    this.teams.forEach(team => {
      h2h[team.team_id] = {};

      let myRanks = allStats[team.team_id].reduce((pv, v) => ({...pv, [v.stat_id]: v.rank}), {});

      Object.keys(allStats).filter(team_id => Number(team_id) !== team.team_id).forEach(team_id => {
        let opRanks = allStats[team_id].reduce((pv, v) => ({...pv, [v.stat_id]: v.rank}), {});
        let win = 0;
        let lose = 0;
        this.statCate.forEach(s => {
          if (myRanks[s.stat_id] < opRanks[s.stat_id]) {
            win += 1;
          }
          else if (myRanks[s.stat_id] > opRanks[s.stat_id]) {
            lose += 1;
          }
        })
        let status;
        if (win > lose) {
          status = 'W';
        } else if (win < lose) {
          status = 'L';
        } else {
          status = 'T';
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

  onSelectWeek = (e) => {
    if (this.state.fetchStats) {
      return
    }
    this.setState({
      week: e.target.value,
      fetchStats: true,
    })
    this.fetchStats(e.target.value);
  }

  onSelectType = (e) => {
    this.setState({
      type: e.target.value,
    })
  }

  fetchStats = async (week) => {
    await this.getTeamsStatsByWeek(week)
    await this.getMatchupsByWeek(week)
    this.setState({
      fetchStats: false
    })
  }

  async componentDidMount() {
    await this.fetchStats()
  }

  render() {
    return (
      <Container>
        <Grid container spacing={2}>
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
          <Grid item xs={3}>
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              labelId="type-label"
              id="type-selector"
              value={this.state.type}
              onChange={this.onSelectType}
            >
              <MenuItem value="value">Value</MenuItem>
              <MenuItem value="rank">Rank</MenuItem>

            </Select>
          </Grid>
          <Grid item xs={6}>
          </Grid>

        </Grid>

        {this.state.fetchStats ?
          <h3 className="fetching-text">Fetching</h3> : (
            <React.Fragment>
              <TableContainer component={Paper} sx={{ my: 2 }}>
                <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell> </TableCell>
                      {this.teams.map((team) => (
                        <TableCell width="9%" align="right" style={{backgroundColor: this.matchupColors[this.state.matchupColors[team.team_id]]}}>
                          {team.name}
                        </TableCell>
                      ))}
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
                        {this.state.type === 'value' ?
                          Object.keys(this.state.stats).map((teamID) => (
                          <TableCell align="right">
                            {this.state.stats[teamID].find(s => s.stat_id === Number(stat.stat_id)).value}
                          </TableCell>
                          )) :
                          Object.keys(this.state.stats).map((teamID) => (
                          <TableCell align="right">
                            {this.state.stats[teamID].find(s => s.stat_id === Number(stat.stat_id)).rank}
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
                      {this.teams.map(team =>
                        <TableCell align="right">
                          {(Object.values(this.state.stats[team.team_id])
                            .reduce((pv, v) => pv+v.rank, 0) / 14).toFixed(2)}
                        </TableCell>
                      )}
                    </TableRow>
                    <TableRow
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell align="right" component="th" scope="row">
                        Win/Loss
                      </TableCell>
                      {this.teams.map(team => {
                        if (this.state.week >= this.league.current_week) {
                          return <TableCell align="right"> N/A </TableCell>
                        }
                        const tied_keys = []
                        this.state.matchups.filter(matchup => matchup.is_tied)
                          .forEach(matchup => {
                            tied_keys.push(...matchup.teams.team.map(team => team.team_key))
                          })
                        const winner_keys = this.state.matchups.map(matchup => matchup.winner_team_key)
                        if (tied_keys.includes(team.team_key)) {
                          return <TableCell align="right"> T </TableCell>
                        } else if (winner_keys.includes(team.team_key)) {
                          return <TableCell align="right"> W </TableCell>
                        } else {
                          return <TableCell align="right"> L </TableCell>
                        }
                      })}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <TableContainer component={Paper} sx={{ my: 2 }}>
                <Table sx={{ minWidth: 650 }} size="small" aria-label="h2h table">
                  <TableHead>
                    <TableRow>
                      <TableCell> </TableCell>
                      {this.teams.map((team) => (
                        <TableCell width="9%" align="right">
                          {team.name}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.teams.map(team => (
                      <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell align="right" component="th" scope="row">
                          {team.name}
                        </TableCell>
                        {this.teams.map(teamRow => {
                          if (team.team_id === teamRow.team_id) {
                            return <TableCell align="right"></TableCell>;
                          }
                          else {
                            let result = this.state.h2h[team.team_id][teamRow.team_id];
                            let color;
                            if (result.status === 'W') {
                              color = this.color.win;
                            } else if (result.status === 'L') {
                              color = this.color.lose;
                            } else {
                              color = this.color.tie;
                            }
                            return <TableCell align="right" style={{backgroundColor: color}}>{`${result.win}-${result.lose}`}</TableCell>;
                          }
                        })}
                      </TableRow>
                    ))}

                  </TableBody>
                </Table>
              </TableContainer>
            </React.Fragment>
          )
        }
      </Container>
    )
  }
}

export default Stats;