import React, { useState, useEffect, useMemo } from 'react';

import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import { apis } from './utils/apis.js'


function LeagueTransaction(props) {

  const [fetching, setFetching] = useState(true);
  const [week, setWeek] = useState(props.league.current_week);
  const [transactions, setTransactions] = useState({});  // {[team]: transactions}


  useEffect(() => {
    const fetchStats = async () => {
      const teams = props.league.teams.team;
      const transactions = {};
      await Promise.all(teams.map(async (team) => {
        const results = await apis.getTransactionsByTeam(team.team_id);
        transactions[team.team_id] = results || [];
      }))

      setTransactions(transactions);
      setFetching(false);
    }


    fetchStats();
  }, [props.league]);

  const weekTransactions = useMemo(() => {
    // {[team]: transactions}

    if (Object.keys(transactions).length === 0) {
      return {};
    }

    const result = {};
    let gameWeek, start, end;
    if (week === 0) { // preseason
      end = new Date(props.league.start_date.split('-')[0], props.league.start_date.split('-')[1]-1, props.league.start_date.split('-')[2]);
    }
    else {
      gameWeek = props.game.game_weeks.game_week.find(w => w.week === week);
      start = new Date(gameWeek.start.split('-')[0], gameWeek.start.split('-')[1]-1, gameWeek.start.split('-')[2]);
      end = new Date(gameWeek.end.split('-')[0], gameWeek.end.split('-')[1]-1, gameWeek.end.split('-')[2]);
    }

    Object.keys(transactions).forEach(team => {
      const trans = [];
      for (let i=0;i<transactions[team].length;i++) {
        if (new Date(transactions[team][i].timestamp*1000) > end) {
          continue;
        }
        else if (week !== 0 && new Date(transactions[team][i].timestamp*1000) < start) {
          break;
        }
        else {
          trans.push(transactions[team][i]);
        }
      }
      result[team] = trans;
    })

    return result;
  }, [transactions, week, props.game, props.league])

  const dateString = (timestamp) => {
    const date = new Date(timestamp*1000);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2,'0')} ${date.getMonth()+1}/${date.getDate()}`
  }

  const onSelectWeek = (e) => {
    setWeek(e.target.value);
  }

  const league = props.league;
  const teams = props.league.teams.team;

  return (
    <Container>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-start">
        <FormControl variant="filled" sx={{ minWidth: 80 }}>
          <InputLabel id="week-label">Week</InputLabel>
          <Select
            labelId="week-label"
            id="week-selector"
            value={week}
            onChange={onSelectWeek}
          >
            <MenuItem value={0}>Pre-season</MenuItem>
            {[...Array(league.current_week-league.start_week+1).keys()].map(i => (
              <MenuItem value={i+league.start_week} key={i+league.start_week}>{i+league.start_week}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {fetching ?
        <h3 className="fetching-text">Fetching</h3> : (
          <Grid container spacing={2} sx={{my: 1}}>
            {[...teams].sort((a, b) => weekTransactions[b.team_id].length - weekTransactions[a.team_id].length)
              .map(team => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={team.team_id}>
                <TableContainer component={Paper}>
                  <Table size="small" sx={{'th': {fontWeight: 'bold'}}} aria-label="team-table">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" colSpan={4}>{team.name}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {weekTransactions[team.team_id].map(tran => (
                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 }}} key={tran.transaction_id}>
                          <TableCell align="center" colSpan={4}>
                            <Typography align="right" variant="caption" display="block" color="transaction.timestamp" sx={{fontWeight: 'bold'}}>{dateString(tran.timestamp)}</Typography>
                            {Array.isArray(tran.players.player) ? (
                              <React.Fragment>
                                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                                  {tran.players.player[0].transaction_data.type === 'add' ? <AddIcon fontSize="small" sx={{color: "transaction.add"}}/> : <RemoveIcon fontSize="small" sx={{color: "transaction.drop"}}/>}
                                  <Typography variant="body2">{tran.players.player[0].name.full}</Typography>
                                </Stack>
                                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                                  {tran.players.player[1].transaction_data.type === 'add' ? <AddIcon fontSize="small" sx={{color: "transaction.add"}}/> : <RemoveIcon fontSize="small" sx={{color: "transaction.drop"}}/>}
                                  <Typography variant="body2">{tran.players.player[1].name.full}</Typography>
                                </Stack>
                              </React.Fragment>
                            ) : (
                              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                                {tran.players.player.transaction_data.type === 'add' ? <AddIcon fontSize="small" sx={{color: "transaction.add"}}/> : <RemoveIcon fontSize="small" sx={{color: "transaction.drop"}}/>}
                                <Typography variant="body2">{tran.players.player.name.full}</Typography>
                              </Stack>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{'&:last-child td, &:last-child th': { border: 0 }}}>
                        <TableCell align="right" sx={{fontWeight: 'bold'}}>Add</TableCell>
                        <TableCell align="left" sx={{fontWeight: 'bold'}}>{weekTransactions[team.team_id].filter(t => t.type !== 'drop').length}</TableCell>
                        <TableCell align="right" sx={{fontWeight: 'bold'}}>Drop</TableCell>
                        <TableCell align="left" sx={{fontWeight: 'bold'}}>{weekTransactions[team.team_id].filter(t => t.type !== 'add').length}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            ))}
          </Grid>
        )
      }

    </Container>
  )
}

export default LeagueTransaction;