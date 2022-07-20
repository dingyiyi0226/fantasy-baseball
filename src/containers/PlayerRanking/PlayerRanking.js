import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Typography from '@mui/material/Typography';

import FetchingText from '../../components/FetchingText.js';
import PageTitle from '../../components/PageTitle.js';
import ShareModal from '../../components/ShareModal.js';
import { selectTeams, selectStatCate } from '../metadataSlice.js';
import { fetchPlayerRanking, selectPlayerRanking, isLoading } from './playerRankingSlice.js';

function PlayerRanking(props) {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const dispatch = useDispatch();
  const teams = useSelector(state => selectTeams(state));
  const statCate = useSelector(state => selectStatCate(state));

  const fetching = useSelector(state => isLoading(state));
  const players = useSelector(state => selectPlayerRanking(state)); // {<rank>: player}

  const [playerNum, setPlayerNum] = useState(50);
  const [sortStat, setSortStat] = useState('AR');  // 'AR', <stat_id>
  const [sortType, setSortType] = useState('season');  // 'season', 'lastweek', 'lastmonth'
  const [modalOpen, setModalOpen] = useState(false);
  const [canvasURL, setCanvasURL] = useState('');

  useEffect(() => {
    dispatch(fetchPlayerRanking({sort: sortStat, type: sortType, playerNum: playerNum}));
  }, [dispatch, sortStat, sortType, playerNum])

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

  const onSelectSortStat = (e) => {
    setSortStat(e.target.value);
  }

  const onSelectSortType = (e) => {
    setSortType(e.target.value);
  }

  const onShare = async () => {
    const canvas = await html2canvas(canvasRef.current, {backgroundColor: theme.palette.background.default, windowWidth: 1400});
    const image = canvas.toDataURL("image/png", 1.0);
    setCanvasURL(image);
    setModalOpen(true);
  }

  const handleModalClose = () => setModalOpen(false);

  const sortStatName = sortStat !== 'AR' ? statCate.find(s => s.stat_id === sortStat).display_name : undefined;
  const sortStatDisplay = sortStat === 'AR' ? 'players' : `${statCate.find(s => s.stat_id === sortStat).display_name} leaders`;
  const sortTypeDisplay = () => {
    if (sortType === 'season') {
      return 'in this season';
    } else if (sortType === 'lastweek') {
      return 'last week';
    } else {
      return 'last month';
    }
  }

  const title = "Player Ranking";
  const subtitle = `Top ${playerNum} ${sortStatDisplay} ${sortTypeDisplay()}`;

  return (
    <React.Fragment>
      <ShareModal title={title} canvasURL={canvasURL} open={modalOpen} onClose={handleModalClose} />
      <Container ref={canvasRef} sx={{py: 2}}>
        <PageTitle title={title} subtitle={subtitle}/>
        <Stack direction="row" spacing={2} alignItems="center" data-html2canvas-ignore>
          <FormControl variant="filled" sx={{ minWidth: 120 }}>
            <InputLabel id="playerNum-label">Max Ranking</InputLabel>
            <Select
              labelId="playerNum-label"
              id="playerNum-selector"
              value={playerNum}
              onChange={onSelectPlayerNum}
            >
              <MenuItem value={25}>{25}</MenuItem>
              <MenuItem value={50}>{50}</MenuItem>
              <MenuItem value={100}>{100}</MenuItem>
              <MenuItem value={200}>{200}</MenuItem>
            </Select>
          </FormControl>

          <FormControl variant="filled" sx={{ minWidth: 120 }}>
            <InputLabel id="stat-label">Stat</InputLabel>
            <Select
              labelId="stat-label"
              id="stat-selector"
              value={sortStat}
              onChange={onSelectSortStat}
            >
              <MenuItem value='AR'>Season Rank</MenuItem>
              {statCate.map(s =>
                <MenuItem value={s.stat_id} key={s.stat_id}>{s.display_name}</MenuItem>
              )}
            </Select>
          </FormControl>

          <FormControl variant="filled" sx={{ minWidth: 120 }}>
            <InputLabel id="type-label">Sort Type</InputLabel>
            <Select
              labelId="type-label"
              id="type-selector"
              value={sortType}
              onChange={onSelectSortType}
            >
              <MenuItem value="season">Season</MenuItem>
              <MenuItem value="lastweek">Last Week</MenuItem>
              <MenuItem value="lastmonth">Last Month</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{display: 'flex', flexGrow: 1}}></Box>
          <Button variant="contained" disableElevation size="large" sx={{bgcolor: "primary.main"}}
            onClick={onShare}>
            Export
          </Button>
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
                          <TableCell align="center" sx={{pr: 1}}>Rank</TableCell>
                          <TableCell align="left" sx={{p: 1}}>Player</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.keys(teamPlayers[team.team_id]).map(rank => (
                          <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 }}} key={rank}>
                            <TableCell align="center" sx={{fontSize: '0.8rem', pr: 1}}>{rank}</TableCell>
                            <TableCell align="left" sx={{fontSize: '0.7rem', p: 1}}>{teamPlayers[team.team_id][rank].name.full}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 }}}>
                          <TableCell align="center" colSpan={2} sx={{fontWeight: 'bold'}}>
                            <Stack direction="row" spacing={4} alignItems="center" justifyContent="center">
                              <Typography variant="body">Total</Typography>
                              <Typography variant="body">{Object.keys(teamPlayers[team.team_id]).length}</Typography>
                            </Stack>
                          </TableCell>
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
    </React.Fragment>
  )
}

export default PlayerRanking;
