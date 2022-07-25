import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import html2canvas from 'html2canvas';

import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';


import FetchingText from '../../components/FetchingText.js';
import PageTitle from '../../components/PageTitle.js';
import ShareModal from '../../components/ShareModal.js';
import { selectStatCate, selectTeams } from '../metadataSlice.js';
import { fetchTeamsAll, selectTeamsAll, isLoading } from './teamCompareSlice.js';


const SmallAvatar = styled(Avatar)(({ theme }) => ({
  width: 50,
  height: 50,
  border: `2px solid ${theme.palette.background.default}`,
}));


function TeamCompare(props) {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const dispatch = useDispatch();
  const teams = useSelector(state => selectTeams(state));
  const statCate = useSelector(state => selectStatCate(state));

  const fetching = useSelector(state => isLoading(state));
  const teamsAll = useSelector(state => selectTeamsAll(state));

  const [myTeamID, setMyTeamID] = useState(teams[0].team_id);
  const [opTeamID, setOpTeamID] = useState(teams[1].team_id);
  const [matchupsOpen, setMatchupsOpen] = useState(false);
  const [statOpen, setStatOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [canvasURL, setCanvasURL] = useState('');

  useEffect(() => {
    dispatch(fetchTeamsAll(teams.length));
  }, [teams, dispatch])

  const myTeam = useMemo(() => {
    if (fetching) {
      return teams.find(t => t.team_id === myTeamID);
    } else {
      return teamsAll.find(t => t.team_id === myTeamID);
    }
  }, [fetching, myTeamID, teamsAll, teams])

  const opTeam = useMemo(() => {
    if (fetching) {
      return teams.find(t => t.team_id === opTeamID);
    } else {
      return teamsAll.find(t => t.team_id === opTeamID);
    }
  }, [fetching, opTeamID, teamsAll, teams])

  const matchups = useMemo(() => {
    // {total: {myTeam:, opTeam:}, matchups: [{week: , outcome: {myTeam:, opTeam:}},]}

    if (fetching) {
      return undefined;
    }

    let matchups = {
      total: {myTeam: 0, opTeam: 0},
      matchups: []
    };

    const myTeam = teamsAll.find(t => t.team_id === myTeamID);
    const opTeam = teamsAll.find(t => t.team_id === opTeamID);

    myTeam.matchups.matchup
      .filter(m => m.teams.team.map(t => t.team_id).includes(opTeamID))
      .forEach(m => {
        let outcome = {myTeam: 0, opTeam: 0};
        if (m.status === 'postevent') {
          m.stat_winners.stat_winner.forEach(s => {
            if (s.winner_team_key === myTeam.team_key) {
              outcome.myTeam += 1;
            } else if (s.winner_team_key === opTeam.team_key) {
              outcome.opTeam += 1;
            }
          })
          if (m.winner_team_key === myTeam.team_key) {
            matchups.total.myTeam += 1;
          } else if (m.winner_team_key === opTeam.team_key) {
            matchups.total.opTeam += 1;
          }
        } else {
          outcome = {myTeam: undefined, opTeam: undefined};
        }

        matchups.matchups.push({
          week: m.week,
          outcome: outcome
        })
      })

    return matchups;

  }, [fetching, myTeamID, opTeamID, teamsAll])


  const teamProfile = (team) => (
    <Stack spacing={1} alignItems="center">
      <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={<SmallAvatar alt={team.managers.manager.nickname} src={team.managers.manager.image_url} />}
      >
        <Avatar alt="myteam-logo" src={team.team_logos.team_logo.url} sx={{width: 150, height: 150}}/>
      </Badge>
      <Typography variant="h6">{team.name}</Typography>
    </Stack>
  )

  const tableRowTemplate = (name, left, right) => (
    <TableRow key={name}>
      <TableCell align="center" sx={{width: '40%'}}>{left}</TableCell>
      <TableCell align="center" sx={{fontWeight: 'bold', width: '20%'}}>{name}</TableCell>
      <TableCell align="center" sx={{width: '40%'}}>{right}</TableCell>
    </TableRow>
  )

  const tableRowCollapseTemplate = (name, left, right, open, setOpen) => (
    <TableRow >
      <TableCell align="center" sx={{width: '40%'}}>{left}</TableCell>
      <TableCell align="center" sx={{width: '20%'}}>
        <Stack direction="row" alignItems="center" justifyContent="center">
          <Typography variant="body2" sx={{fontWeight: 'bold'}}>{name}</Typography>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon fontSize="small"/> : <KeyboardArrowDownIcon fontSize="small"/>}
          </IconButton>
        </Stack>
      </TableCell>
      <TableCell align="center" sx={{width: '40%'}}>{right}</TableCell>
    </TableRow>
  )

  const onSelectMyTeamID = (e) => {
    if (e.target.value === opTeamID) {
      setOpTeamID(myTeamID);
      setMyTeamID(e.target.value);
    } else {
      setMyTeamID(e.target.value);
    }
  }

  const onSelectOpTeamID = (e) => {
    if (e.target.value === myTeamID) {
      return;
    }
    setOpTeamID(e.target.value);
  }

  const onShare = async () => {
    const canvas = await html2canvas(canvasRef.current, {backgroundColor: theme.palette.background.default, windowWidth: 1400, useCORS: true});
    const image = canvas.toDataURL("image/png", 1.0);
    setCanvasURL(image);
    setModalOpen(true);
  }

  const handleModalClose = () => setModalOpen(false);

  const title = "Team Compare";
  const subtitle = `Compare Team ${myTeam.name} and Team ${opTeam.name}`;

  return (
    <React.Fragment>
      <ShareModal title={title} canvasURL={canvasURL} open={modalOpen} onClose={handleModalClose} />
      <Container ref={canvasRef} sx={{py: 2}}>
        <PageTitle title={title} subtitle={subtitle}/>
        <Stack direction="row" spacing={2} alignItems="center" data-html2canvas-ignore>
          <FormControl variant="filled" sx={{ minWidth: 80 }}>
            <InputLabel id="myTeamID-label">Team 1</InputLabel>
            <Select
              labelId="myTeamID-label"
              id="myTeamID-selector"
              value={myTeamID}
              onChange={onSelectMyTeamID}
            >
              {teams.map(t => (
                <MenuItem value={t.team_id} key={t.team_id}>{t.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl variant="filled" sx={{ minWidth: 80 }}>
            <InputLabel id="opTeamID-label">Team 2</InputLabel>
            <Select
              labelId="opTeamID-label"
              id="opTeamID-selector"
              value={opTeamID}
              onChange={onSelectOpTeamID}
            >
              {teams.filter(t => t.team_id !== myTeamID).map(t => (
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
          <FetchingText /> : (
            <TableContainer sx={{width: '70%', m: 'auto', mt: 2}}>
              <Table size="small" sx={{'th': {fontWeight: 'bold'}}} aria-label="comparison-table">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{width: '40%'}}>
                      {teamProfile(myTeam)}
                    </TableCell>
                    <TableCell sx={{width: '20%'}}></TableCell>
                    <TableCell align="center" sx={{width: '40%'}}>
                      {teamProfile(opTeam)}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableRowTemplate('Standings', myTeam.team_standings.rank, opTeam.team_standings.rank)}
                  {tableRowTemplate('W-L-T',
                    `${myTeam.team_standings.outcome_totals.wins}-${myTeam.team_standings.outcome_totals.losses}-${myTeam.team_standings.outcome_totals.ties}`,
                    `${opTeam.team_standings.outcome_totals.wins}-${opTeam.team_standings.outcome_totals.losses}-${opTeam.team_standings.outcome_totals.ties}`)}
                  {tableRowTemplate('Waiver', myTeam.waiver_priority, opTeam.waiver_priority)}
                  {tableRowTemplate('Moves', myTeam.number_of_moves, opTeam.number_of_moves)}
                  {tableRowTemplate('Trades', myTeam.number_of_trades, opTeam.number_of_trades)}

                  {tableRowCollapseTemplate('Matchups', matchups.total.myTeam, matchups.total.opTeam, matchupsOpen, setMatchupsOpen)}
                  {matchupsOpen ? (
                    matchups.matchups.map(m =>
                      tableRowTemplate(`Week ${m.week}`, m.outcome.myTeam || 'N/A', m.outcome.opTeam || 'N/A')
                    )
                  ): null}

                  {tableRowCollapseTemplate('Seasonal Stats', '', '', statOpen, setStatOpen)}
                  {statOpen ? (
                    statCate.filter(s => !s.is_only_display_stat).map(s =>
                      tableRowTemplate(s.display_name,
                        myTeam.team_stats.stats.stat.find(ms => ms.stat_id === s.stat_id).value,
                        opTeam.team_stats.stats.stat.find(ms => ms.stat_id === s.stat_id).value)
                    )
                  ): null}

                  <TableRow sx={{'&:last-child td, &:last-child th': { border: 0 }}}>
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )
        }

      </Container>
    </React.Fragment>
  )
}

export default TeamCompare;
