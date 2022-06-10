import React, { Component } from 'react'

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

import apis from './apis.js'


class Stats extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fetchMetadata: true,
      fetchStats: true,
      week: 1,
      type: 'value', // 'value', 'rank'
      stats: {},
      ranks: {},
      matchups: [],
      matchupColors: [],

      league: {},
      statCate: [],
      teams: [],
    }

    this.matchupColors = [
      '#f9f8f1', '#F4FAE6', '#D9E5FA', '#F1D9FA', '#FAF2E1']
  }

  getTeamStatsByWeek = async () => {
    const stats = {}
    for (let team_id=1;team_id<11;team_id++){
      let stat = await apis.getTeamStatsByWeek(team_id, this.state.week)
      stat = stat.filter(s => s.stat_id !== 60 && s.stat_id !== 50);
      stats[team_id] = stat;
    }
    const ranks = this.calulateRank(stats)

    this.setState(state => ({
      stats: stats,
      ranks: ranks
    }))
  }

  getMatchupsByWeek = async () => {
    let matchups = await apis.getMatchupsByWeek(this.state.week)
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

  getTeams = async () => {
    const teams = await apis.getTeams()

    this.setState({
      teams: teams,
    })
  }

  getLeague = async () => {
    const league = await apis.getLeague();
    const statCategories = league.settings.stat_categories.stats.stat.filter(s => !s.is_only_display_stat)

    this.setState({
      league: league,
      statCate: statCategories,
      week: league.current_week
    })
  }

  calulateRank = (allStats) => {

    let statsT = {}
    this.state.statCate.forEach(s => {
      statsT[s.stat_id] = []
    })

    Object.values(allStats).forEach(stat => {
      stat.forEach(s => {
        statsT[s.stat_id].push(s.value)
      })
    })

    for (let [stat_id, stat] of Object.entries(statsT)){
      const sort_order = this.state.statCate.find(s => s.stat_id === Number(stat_id)).sort_order === 0;
      stat.sort((a, b) => sort_order ? a-b : b-a)
    }

    const ranks = {}
    this.state.teams.forEach(team => {
      ranks[team.team_id] = []
    })

    for (let [team_id, stats] of Object.entries(allStats)){
      stats.forEach(stat => {
        const rank = statsT[stat.stat_id].indexOf(stat.value) + 1;
        ranks[team_id].push({stat_id: stat.stat_id, value: rank})
      })
    }
    return ranks
  }

  onSelectWeek = (e) => {
    if (this.state.fetchStats) {
      return
    }
    this.setState({
      week: e.target.value,
      fetchStats: true,
    })
    this.fetchStats()
  }

  onSelectType = (e) => {
    this.setState({
      type: e.target.value,
    })
  }


  fetchMetadata = async () => {
    await this.getLeague()
    await this.getTeams()

    this.setState({
      fetchMetadata: false
    })
  }

  fetchStats = async () => {
    await this.getTeamStatsByWeek()
    await this.getMatchupsByWeek()
    this.setState({
      fetchStats: false
    })
  }

  async componentDidMount() {
    await this.fetchMetadata()
    await this.fetchStats()
  }

  render() {
    if (this.state.fetchMetadata) {
      return <h3 className="fetching-text">Fetching</h3>
    }

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
              {[...Array(this.state.league.end_week-this.state.league.start_week+1).keys()].map(i => (
                <MenuItem value={i+1}>{i+1}</MenuItem>
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
          <h3 className="fetching-text">Fetching</h3> :
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell> </TableCell>
                  {this.state.teams.map((team) => (
                    <TableCell align="right" style={{backgroundColor: this.matchupColors[this.state.matchupColors[team.team_id]]}}>
                      {team.name}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.statCate.map((stat) => (
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
                      Object.keys(this.state.ranks).map((teamID) => (
                      <TableCell align="right">
                        {this.state.ranks[teamID].find(s => s.stat_id === Number(stat.stat_id)).value}
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
                  {this.state.teams.map(team =>
                    <TableCell align="right">
                      {(Object.values(this.state.ranks[team.team_id])
                        .reduce((pv, v) => pv+v.value, 0) / 14).toFixed(2)}
                    </TableCell>
                  )}
                </TableRow>
                <TableRow
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell align="right" component="th" scope="row">
                    Win/Loss
                  </TableCell>
                  {this.state.teams.map(team => {
                    if (this.state.week >= this.state.league.current_week) {
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
        }
      </Container>
    )
  }
}

export default Stats;