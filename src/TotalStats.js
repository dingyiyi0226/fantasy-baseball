import React, { Component } from 'react'

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Paper from '@mui/material/Paper';

import apis from './apis.js'


class TotalStats extends Component {
  constructor(props) {
    super(props)

    this.league = props.league;
    this.teams = props.league.teams.team;
    this.statCate = props.league.settings.stat_categories.stats.stat.filter(s => !s.is_only_display_stat);

    this.state = {
      fetching: true,
      stats: {},
    }

  }

  getMatchupsUntilWeek = async () => {

    let allStats = {}
    this.teams.forEach(team => {
      allStats[team.team_id] = {}
    })
    this.statCate.forEach(s => {
      Object.keys(allStats).forEach(key => {
        allStats[key]['stat'] = {...allStats[key]['stat'], [s.stat_id]: {'win': 0, 'lose': 0, 'tie': 0}};
      })
    })

    const allMatchups = await apis.getMatchupsUntilWeek(this.teams.length, this.league.current_week-1)
    allMatchups.forEach(team => {
      team.matchups.matchup.forEach(week => {
        week.stat_winners.stat_winner.forEach(stat_winner => {
          if (stat_winner.is_tied) {
            allStats[team.team_id]['stat'][stat_winner.stat_id].tie += 1;
          } else if (stat_winner.winner_team_key === team.team_key) {
            allStats[team.team_id]['stat'][stat_winner.stat_id].win += 1;
          } else {
            allStats[team.team_id]['stat'][stat_winner.stat_id].lose += 1;
          }
        })
      })
    })
    this.teams.forEach(team => {
      const sum = Object.values(allStats[team.team_id]['stat'])
        .reduce((pv, v) => ({'win': pv.win+v.win, 'lose': pv.lose+v.lose, 'tie': pv.tie+v.tie}), {'win': 0, 'lose': 0, 'tie': 0});
      allStats[team.team_id]['sum'] = sum;
    })

    const point = this.teams.map(team =>
      allStats[team.team_id]['sum'].win - allStats[team.team_id]['sum'].lose
    ).sort((a, b) => b-a)

    this.teams.forEach(team => {
      const rank = point.indexOf(allStats[team.team_id]['sum'].win - allStats[team.team_id]['sum'].lose) + 1;
      allStats[team.team_id]['rank'] = rank;
    })

    this.setState({
      stats: allStats,
      fetching: false
    })
  }

  componentDidMount() {
    this.getMatchupsUntilWeek()
  }

  render() {
    return (this.state.fetching ?
      <h3 className="fetching-text">Fetching</h3> :
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell> </TableCell>
              {this.teams.map((team) =>
                <TableCell align="right">{team.name}</TableCell>
              )}
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
                {Object.keys(this.state.stats).map((teamID) => {
                  const s = this.state.stats[teamID]['stat'][stat.stat_id]
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
                  {`${this.state.stats[team.team_id].sum.win}-${this.state.stats[team.team_id].sum.lose}-${this.state.stats[team.team_id].sum.tie}`}
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
                  {this.state.stats[team.team_id].rank}
                </TableCell>
              )}
            </TableRow>
            
          </TableBody>
        </Table>
      </TableContainer>
    )
  }
}

export default TotalStats;
