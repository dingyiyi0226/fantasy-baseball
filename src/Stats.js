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

      league: {},
      teams: [],
      teamID2Name: {},
      statID2Name: {},
    }
  }

  getTeamStatsByWeek = async () => {
    for (let team_id=1;team_id<11;team_id++){
      let stat = await apis.getTeamStatsByWeek(team_id, this.state.week)
      stat = stat.filter(s => s.stat_id !== 60 && s.stat_id !== 50);

      this.setState(state => ({
        stats: {...state.stats, [team_id]: stat}
      }))
    }
  }

  getTeams = async () => {
    const teams = await apis.getTeams()
    const teamID2Name = {}
    teams.forEach(team => {
      teamID2Name[team.team_id] = team.name;
    })
    this.setState({
      teams: teams,
      teamID2Name: teamID2Name
    })
  }

  getLeague = async () => {
    const league = await apis.getLeague();
    const statCategories = league.settings.stat_categories.stats.stat.filter(s => !s.is_only_display_stat)
    const statID2Name = {}
    statCategories.forEach(stat => {
      statID2Name[stat.stat_id] = stat.display_name;
    })

    this.setState({
      league: league,
      statID2Name: statID2Name,
      week: league.current_week
    })
  }

  calulateRank = () => {
    const statCategories = this.state.league.settings.stat_categories.stats.stat
                               .filter(s => !s.is_only_display_stat)
    let statsT = {}
    statCategories.forEach(s => {
      statsT[s.stat_id] = []
    })

    Object.values(this.state.stats).forEach(stat => {
      stat.forEach(s => {
        statsT[s.stat_id].push(s.value)
      })
    })

    for (let [stat_id, stat] of Object.entries(statsT)){
      const sort_order = statCategories.find(s => s.stat_id === Number(stat_id)).sort_order === 0;
      stat.sort((a, b) => sort_order ? a-b : b-a)
    }

    const ranks = {}
    this.state.teams.forEach(team => {
      ranks[team.team_id] = []
    })

    for (let [team_id, stats] of Object.entries(this.state.stats)){
      stats.forEach(stat => {
        const rank = statsT[stat.stat_id].indexOf(stat.value) + 1;
        ranks[team_id].push({stat_id: stat.stat_id, value: rank})
      })
    }
    this.setState({ranks: ranks})
  }

  onSelectWeek = (e) => {
    if (this.state.fetchStats) {
      return
    }
    this.setState({
      week: e.target.value,
      ranks: {},
      type: 'value',
      fetchStats: true,
    })
    this.fetchStats()
  }

  onSelectType = (e) => {
    if (this.state.fetchStats) {
      return
    }

    if (Object.keys(this.state.ranks).length === 0) {
      this.calulateRank()
    }

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
                    <TableCell align="right">{team.name}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(this.state.statID2Name).map((statID) => (
                  <TableRow
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell align="right" component="th" scope="row">
                      {this.state.statID2Name[statID]}
                    </TableCell>
                    {this.state.type === 'value' ?
                      Object.keys(this.state.stats).map((teamID) => (
                      <TableCell align="right">
                        {this.state.stats[teamID].find(s => s.stat_id === Number(statID)).value}
                      </TableCell>
                      )) :
                      Object.keys(this.state.ranks).map((teamID) => (
                      <TableCell align="right">
                        {this.state.ranks[teamID].find(s => s.stat_id === Number(statID)).value}
                      </TableCell>
                      ))
                    }
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

export default Stats;