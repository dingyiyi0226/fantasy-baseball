import React, { Component } from 'react'

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import Paper from '@mui/material/Paper';

import apis from './apis.js'
import './App.css';


class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      week: 1,
      stats: {},
      teams: [],
      teamID2Name: {},
      statID2Name: {},
      league: {},
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

  onSelectWeek = (e) => {
    this.setState({week: e.target.value})
    this.getTeamStatsByWeek()
  }


  fetch = async () => {
    await this.getTeams()
    await this.getTeamStatsByWeek()
    await this.getLeague()

    this.setState({
      fetching: false
    })
  }

  componentDidMount() {
    this.fetch()
  }

  render() {
    if(this.state.fetching) {
      return <h3 className="fetching-text">Fetching</h3>
    }
    else {
      return (
        <div className="App">
          <Select
            labelId="demo-simple-select-filled-label"
            id="demo-simple-select-filled"
            value={this.state.week}
            onChange={this.onSelectWeek}
          >
            <MenuItem value={this.state.week}>{
              this.state.week}
            </MenuItem>
            {[...Array(this.state.league.end_week-this.state.league.start_week+1).keys()].map(i => (
              <MenuItem value={i+1}>{i+1}</MenuItem>
            ))}

          </Select>


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
                    {Object.keys(this.state.stats).map((teamID) => (
                      <TableCell align="right">
                        {this.state.stats[teamID].find(s => s.stat_id === Number(statID)).value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )
    }
  }
}

export default App;
