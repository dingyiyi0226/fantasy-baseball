import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import html2canvas from 'html2canvas';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';

import FetchingText from '../../components/FetchingText.js';
import PageTitle from '../../components/PageTitle.js';
import ShareModal from '../../components/ShareModal.js';
import { selectTeams } from '../metadataSlice.js';
import { setTeam, fetchMatchups, selectMatchups, matchupsIsLoading as isLoading } from './teamsSlice.js';


function TeamMatchups(props) {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const { team } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const teams = useSelector(state => selectTeams(state));
  const fetching = useSelector(state => isLoading(state));
  const matchups = useSelector(state => selectMatchups(state));

  const [modalOpen, setModalOpen] = useState(false);
  const [canvasURL, setCanvasURL] = useState('');

  useEffect(() => {
    if (isNaN(parseInt(team)) || parseInt(team) > teams.length || parseInt(team) === 0) {
      navigate('/teams/1/matchups');
    }
  }, [team, teams, navigate])


  useEffect(() => {
    if (isNaN(parseInt(team)) || parseInt(team) > teams.length || parseInt(team) === 0) {
      return;
    }
    dispatch(setTeam(team));
    dispatch(fetchMatchups(team));
  }, [team, teams, dispatch])

  const getOpponent = (matchup, field='team_id') => {
    const opponent = matchup.teams.team.find(t => t.team_id !== parseInt(team));
    return opponent[field];
  }

  const getStatus = (matchup) => {
    if (matchup.status !== 'postevent') {
      return undefined;
    }

    const myTeamKey = teams.find(t => t.team_id === parseInt(team)).team_key;
    if (matchup.is_tied) {
      return 'T';
    } else if (matchup.winner_team_key === myTeamKey) {
      return 'W';
    } else {
      return 'L';
    }
  }

  const getScore = (matchup, toStr=false) => {
    if (matchup.status === 'preevent') {
      return undefined;
    }

    const myTeamKey = teams.find(t => t.team_id === parseInt(team)).team_key;
    let result = {'win': 0, 'lose': 0, 'tie': 0};
    matchup.stat_winners.stat_winner.forEach(stat => {
      if (stat.is_tied) {
        result.tie += 1;
      } else if (stat.winner_team_key === myTeamKey) {
        result.win += 1;
      } else {
        result.lose += 1;
      }
    })
    return toStr ? `${result.win}-${result.lose}-${result.tie}` : result;
  }

  const onSelectTeam = (e) => {
    if (fetching) {
      return;
    }
    navigate(`/teams/${e.target.value}/matchups`);
  }

  const onShare = async () => {
    const canvas = await html2canvas(canvasRef.current, {backgroundColor: theme.palette.background.default, windowWidth: 1400});
    const image = canvas.toDataURL("image/png", 1.0);
    setCanvasURL(image);
    setModalOpen(true);
  }

  const handleModalClose = () => setModalOpen(false);

  const matchupsTable = (matchups) => (
    <TableContainer component={Paper}>
      <Table size="small" sx={{minWidth: 300, 'th': {fontWeight: 'bold'}}} aria-label="matchup-table">
        <TableHead>
          <TableRow>
            <TableCell sx={{minWidth: 80, maxWidth: 90}}> </TableCell>
            <TableCell align="right" sx={{minWidth: 70}}>Opponent</TableCell>
            <TableCell align="center" sx={{minWidth: 60, maxWidth: 90}}>Status</TableCell>
            <TableCell align="center" sx={{minWidth: 70, maxWidth: 100}}>W-L-T</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {matchups.map(matchup => (
            <TableRow
              key={matchup.week}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="right" component="th" scope="row">
                {`Week ${matchup.week}`}
              </TableCell>
              <TableCell align="right">
                {getOpponent(matchup, 'name')}
              </TableCell>
              <TableCell align="center">
                {getStatus(matchup)}
              </TableCell>
              <TableCell align="center">
                {getScore(matchup, true)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  const title = "Matchups";
  const subtitle = `Season matchups of team ${teams.find(t => t.team_id === Number(team)).name}`;

  return (
    <React.Fragment>
      <ShareModal title={title} canvasURL={canvasURL} open={modalOpen} onClose={handleModalClose} />
      <Container ref={canvasRef} sx={{py: 2}}>
        <PageTitle title={title} subtitle={subtitle}/>
        <Stack direction="row" spacing={2} alignItems="center" data-html2canvas-ignore>
          <FormControl variant="filled" sx={{ minWidth: 160 }}>
            <InputLabel id="team-label">Team</InputLabel>
            <Select
              labelId="team-label"
              id="team-selector"
              value={team}
              onChange={onSelectTeam}
            >
              {teams.map(t => (
                <MenuItem value={t.team_id} key={t.team_id}>{t.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{display: 'flex', flexGrow: 1}}></Box>
          <Button variant="contained" disableElevation size="large" sx={{bgcolor: "primary.main"}}
            onClick={onShare}>
            Export
          </Button>
        </Stack>

        {fetching ?
          <FetchingText /> :
          <Grid container spacing={2} justifyContent="center" sx={{py: 2}}>
            <Grid item xs={12} sm={10} md={8} sx={{display: {lg: 'none'}}}>
              {matchupsTable(matchups)}
            </Grid>
            {matchups.length > 13 ? (
              <React.Fragment>
                <Grid item lg={6} sx={{display: {xs: 'none', lg: 'block'}}}>
                  {matchupsTable(matchups.slice(0, 13))}
                </Grid>
                <Grid item lg={6} sx={{display: {xs: 'none', lg: 'block'}}}>
                  {matchupsTable(matchups.slice(13))}
                </Grid>
              </React.Fragment>
            ) : (
              <Grid item lg={6} sx={{display: {xs: 'none', lg: 'block'}}}>
                {matchupsTable(matchups)}
              </Grid>
            )}
            
          </Grid>
        }
      </Container>
    </React.Fragment>
  )
}

export default TeamMatchups;
