import React from 'react';
import { useSelector } from 'react-redux';

import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Typography from '@mui/material/Typography';

import { selectLeague, selectStandings } from './metadataSlice.js';


function LeagueHome(props) {
  const league = useSelector(state => selectLeague(state));
  const standings = useSelector(state => selectStandings(state));

  return (
    <Container>
      <Grid container spacing={0} alignItems="center" sx={{mt: 4, mb: 6}}>
        {league.logo_url ? (
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <Box component="img" alt="league-logo" src={league.logo_url}
              sx={{width: '80%', display: 'flex'}}/>
          </Grid>
        ): null }
        <Grid item xs>
          <Typography variant="h3">{league.name}</Typography>
        </Grid>
      </Grid>

      <TableContainer sx={{my: 2}}>
        <Table size="small" sx={{'th': {fontWeight: 'bold'}}} aria-label="team-table">
          <TableHead>
            <TableRow>
              <TableCell align="center">Rank</TableCell>
              <TableCell align="center">Team</TableCell>
              <TableCell align="center" sx={{minWidth: 90}}>W-L-T</TableCell>
              <TableCell align="center" sx={{display: {xs: 'none', sm: 'table-cell'}}}>PCT</TableCell>
              <TableCell align="center" sx={{display: {xs: 'none', sm: 'table-cell'}}}>GB</TableCell>
              <TableCell align="center" sx={{display: {xs: 'none', md: 'table-cell'}}}>Waiver</TableCell>
              <TableCell align="center" sx={{display: {xs: 'none', lg: 'table-cell'}}}>Manager</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {standings.map(team => (
              <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 }}} key={team.team_id}>
                <TableCell align="center">{team.team_standings.rank}</TableCell>
                <TableCell align="left">
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-start">
                    <Avatar alt={team.name} src={team.team_logos.team_logo.url} />
                    <Typography variant="body">{team.name}</Typography>
                  </Stack>
                </TableCell>
                <TableCell align="center">{`${team.team_standings.outcome_totals.wins}-${team.team_standings.outcome_totals.losses}-${team.team_standings.outcome_totals.ties}`}</TableCell>
                <TableCell align="center" sx={{display: {xs: 'none', sm: 'table-cell'}}}>{team.team_standings.outcome_totals.percentage}</TableCell>
                <TableCell align="center" sx={{display: {xs: 'none', sm: 'table-cell'}}}>{team.team_standings.games_back}</TableCell>
                <TableCell align="center" sx={{display: {xs: 'none', md: 'table-cell'}}}>{team.waiver_priority}</TableCell>
                <TableCell align="left" sx={{display: {xs: 'none', lg: 'table-cell'}}}>
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-start">
                    <Avatar alt={team.managers.manager.nickname} src={team.managers.manager.image_url} />
                    <Typography variant="body">{team.managers.manager.nickname}</Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

    </Container>
  )
}

export default LeagueHome;
