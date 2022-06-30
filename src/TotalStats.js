import React, { Component } from 'react'

import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { apis } from './utils/apis.js'


class TotalStats extends Component {
  constructor(props) {
    super(props)

    this.league = props.league;
    this.teams = props.league.teams.team;
    this.statCate = props.league.settings.stat_categories.stats.stat.filter(s => !s.is_only_display_stat);

    this.state = {
      fetching: true,
      stats: {},
      statTypes: ['B', 'P'], // B: batting, P: pitching
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
    let allMatchups = {};
    await Promise.all(this.teams.map(async (team) => {
      const matchup = await apis.getTeamMatchupsUntilWeek(team.team_id, this.league.current_week-1);
      allMatchups[team.team_id] = matchup;
    }))

    this.teams.forEach(team => {
      allMatchups[team.team_id].forEach(week => {
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

    const calVal = this.calStats(this.state.statTypes, allStats);

    this.setState({
      stats: allStats,
      sum: calVal.sum,
      rank: calVal.rank,
      fetching: false,
    })
  }

  calStats = (statTypes, stats=null) => {
    let sum = {};
    let rank = {};

    if (stats === null) {
      stats = this.state.stats;
    }

    this.teams.forEach(team => {
      let result = {'win': 0, 'lose': 0, 'tie': 0};
      for (let [stat, val] of Object.entries(stats[team.team_id])) {
        if (statTypes.includes(this.statCate.find(s => s.stat_id === Number(stat)).position_type)) {
          result.win += val.win;
          result.lose += val.lose;
          result.tie += val.tie;
        }
      }
      sum[team.team_id] = result;

    })

    const points = this.teams.map(team => sum[team.team_id].win - sum[team.team_id].lose)
                            .sort((a, b) => b-a)
    this.teams.forEach(team => {
      rank[team.team_id] = points.indexOf(sum[team.team_id].win - sum[team.team_id].lose) + 1;
    })

    return {'sum': sum, 'rank': rank}
  }

  onChangeType = (e, types) => {
    if (this.state.fetching) {
      return;
    }

    this.setState(state => {
      const calVal = this.calStats(types);

      return {
        statTypes: types,
        sum: calVal.sum,
        rank: calVal.rank,
      };
    })
  }

  componentDidMount() {
    this.getMatchupsUntilWeek()
  }

  render() {
    return (
      <Container>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-start">
          <ToggleButtonGroup
            value={this.state.statTypes}
            onChange={this.onChangeType}
            aria-label="type-selector"
          >
            <ToggleButton value="B" aria-label="Batting">Batting</ToggleButton>
            <ToggleButton value="P" aria-label="Pitching">Pitching</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {this.state.fetching ?
          <h3 className="fetching-text">Fetching</h3> :
          <TableContainer component={Paper} sx={{my: 2}}>
            <Table sx={{ minWidth: 700, 'th': {fontWeight: 'bold'}}} size="small" aria-label="stat-table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{minWidth: 70, maxWidth: 100}}> </TableCell>
                  {this.teams.map((team) =>
                    <TableCell align="right" sx={{minWidth: 70}} key={team.team_id}>{team.name}</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {this.statCate.filter(stat => this.state.statTypes.includes(stat.position_type))
                  .map((stat) => (
                  <TableRow
                    key={stat.stat_id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell align="right" component="th" scope="row">
                      {stat.display_name}
                    </TableCell>
                    {Object.keys(this.state.stats).map((teamID) => {
                      const s = this.state.stats[teamID][stat.stat_id]
                      return <TableCell align="right" key={teamID}>{`${s.win}-${s.lose}-${s.tie}`}</TableCell>
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
                    <TableCell align="right" key={team.team_id}>
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
                    <TableCell align="right" key={team.team_id}>
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
