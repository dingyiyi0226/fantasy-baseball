import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

import FetchingText from '../../components/FetchingText.js';
import PageTitle from '../../components/PageTitle.js';
import { selectTeams } from '../metadataSlice.js';
import { fetchPlayerRanking, selectPlayerRanking, isLoading } from './playerRankingSlice.js';

function PlayerRanking(props) {
  const dispatch = useDispatch();
  const teams = useSelector(state => selectTeams(state));

  const fetching = useSelector(state => isLoading(state));
  const players = useSelector(state => selectPlayerRanking(state)); // {<rank>: player}

  const [playerNum, setPlayerNum] = useState(50);

  useEffect(() => {
    dispatch(fetchPlayerRanking(playerNum));
  }, [dispatch, playerNum])

  const teamPlayers = useMemo(() => {
    // {[team]: {[rank]: player}}

    if (fetching){
      return undefined;
    }
    const result = {};
    teams.forEach(team => {
      result[team.team_id] = {};
    })

    Object.keys(players).forEach(rank => {
      if (players[rank].ownership.ownership_type === 'team') {
        result[players[rank].ownership.teams.team.team_id][rank] = players[rank];
      }
    })

    return result;
  }, [fetching, players, teams])


  const onSelectPlayerNum = (e) => {
    setPlayerNum(e.target.value);
  }


  return (
    <Container>
      <PageTitle title="Player Ranking" subtitle={`Top ${playerNum} players in this season`}/>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-start">
        <FormControl variant="filled" sx={{ minWidth: 120 }}>
          <InputLabel id="playerNum-label">Max Ranking</InputLabel>
          <Select
            labelId="playerNum-label"
            id="playerNum-selector"
            value={playerNum}
            onChange={onSelectPlayerNum}
          >
            <MenuItem value={25} key={25}>{25}</MenuItem>
            <MenuItem value={50} key={50}>{50}</MenuItem>
            <MenuItem value={100} key={100}>{100}</MenuItem>
            <MenuItem value={200} key={200}>{200}</MenuItem>
            <MenuItem value={400} key={400}>{400}</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {fetching ?
        <FetchingText /> : (
          <Grid container spacing={2} sx={{my: 1}}>
            {[...teams].sort((a, b) => Object.keys(teamPlayers[b.team_id]).length - Object.keys(teamPlayers[a.team_id]).length).map(team => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={team.team_id}>
                <TableContainer component={Paper}>
                  <Table size="small" sx={{'th': {fontWeight: 'bold'}}} aria-label="team-table">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" colSpan={2}>{team.name}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell align="center">Rank</TableCell>
                        <TableCell align="left">Player</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.keys(teamPlayers[team.team_id]).map(rank => (
                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 }}} key={rank}>
                          <TableCell align="center">{rank}</TableCell>
                          <TableCell align="left">{teamPlayers[team.team_id][rank].name.full}</TableCell>

                        </TableRow>
                      ))}
                      <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 }}}>
                        <TableCell align="center" sx={{fontWeight: 'bold'}}>Total</TableCell>
                        <TableCell align="left" sx={{fontWeight: 'bold'}}>{Object.keys(teamPlayers[team.team_id]).length}</TableCell>
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

export default PlayerRanking;
