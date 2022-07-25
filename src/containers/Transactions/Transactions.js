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

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { to_local_date } from '../../utils/timezone.js';
import FetchingText from '../../components/FetchingText.js';
import PageTitle from '../../components/PageTitle.js';
import ShareModal from '../../components/ShareModal.js';
import { selectGameWeeks, selectLeague, selectTeams } from '../metadataSlice.js';
import { fetchTransactions, selectTransactions, isLoading } from './transactionsSlice.js';


function Transactions(props) {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const dispatch = useDispatch();
  const gameWeeks = useSelector(state => selectGameWeeks(state));
  const league = useSelector(state => selectLeague(state));
  const teams = useSelector(state => selectTeams(state));

  const fetching = useSelector(state => isLoading(state));
  const transactionsRaw = useSelector(state => selectTransactions(state));  // [transactions]

  const [week, setWeek] = useState(league.current_week);
  const [modalOpen, setModalOpen] = useState(false);
  const [canvasURL, setCanvasURL] = useState('');

  useEffect(() => {
    dispatch(fetchTransactions(teams.length));
  }, [teams, dispatch])

  const transactions = useMemo(() => {
    // {[team]: transactions}

    if (fetching) {
      return undefined;
    }

    const result = {};
    teams.forEach(team => {
      result[team.team_id] = [];
    })

    transactionsRaw.forEach(trans => {
      switch (trans.type) {
        case 'add':
          if (trans.players.player.transaction_data.destination_type === 'team') {
            result[trans.players.player.transaction_data.destination_team_key.split('.').pop()].push(trans);
          }
          break;
        case 'drop':
          if (trans.players.player.transaction_data.source_type === 'team') {
            result[trans.players.player.transaction_data.source_team_key.split('.').pop()].push(trans);
          }
          break;
        case 'add/drop':
          if (trans.players.player[0].transaction_data.source_type === 'team') {
            result[trans.players.player[0].transaction_data.source_team_key.split('.').pop()].push(trans);
          } else {
            result[trans.players.player[1].transaction_data.source_team_key.split('.').pop()].push(trans);
          }
          break;
        case 'trade':
          result[trans.players.player[0].transaction_data.source_team_key.split('.').pop()].push(trans);
          result[trans.players.player[0].transaction_data.destination_team_key.split('.').pop()].push(trans);
          break;
        default:
          break;
      }
    })
    return result;

  }, [fetching, transactionsRaw, teams])


  const weekTransactions = useMemo(() => {
    // {[team]: transactions}

    if (transactions === undefined) {
      return undefined;
    }

    const result = {};
    let gameWeek, start, end;
    if (week === 0) { // preseason
      end = new Date(league.start_date.split('-')[0], league.start_date.split('-')[1]-1, league.start_date.split('-')[2]);
    }
    else {
      gameWeek = gameWeeks.find(w => w.week === week);
      start = new Date(gameWeek.start.split('-')[0], gameWeek.start.split('-')[1]-1, gameWeek.start.split('-')[2]);
      end = new Date(gameWeek.end.split('-')[0], gameWeek.end.split('-')[1]-1, parseInt(gameWeek.end.split('-')[2])+1); // next week's start
      start = to_local_date(start);
      end = to_local_date(end);
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
  }, [transactions, week, gameWeeks, league])

  const transactionSum = (trans) => {
    let sum = {'add': 0, 'drop': 0};
    trans.forEach(tran => {
      if (tran.type === 'add') {
        sum.add += 1;
      } else if (tran.type === 'drop') {
        sum.drop += 1;
      } else if (tran.type === 'add/drop') {
        sum.add += 1;
        sum.drop += 1;
      } else if (tran.type === 'trade' && tran.status === 'successful') {
        sum.add += 1;
        sum.drop += 1;
      }
    })
    return sum;
  }

  const dateString = (timestamp) => {
    const date = new Date(timestamp*1000);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2,'0')} ${date.getMonth()+1}/${date.getDate()}`
  }

  const transactionCell = (tran, teamKey) => {
    switch (tran.type) {
      case 'add':
      case 'drop':
        return (
          <React.Fragment>
          <Typography align="right" variant="caption" display="block" color="transaction.timestamp" sx={{fontWeight: 'bold'}}>{dateString(tran.timestamp)}</Typography>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              {tran.players.player.transaction_data.type === 'add' ?
                <AddIcon fontSize="small" sx={{color: "transaction.add"}}/> :
                <RemoveIcon fontSize="small" sx={{color: "transaction.drop"}}/>
              }
              <Typography variant="body2">{tran.players.player.name.full}</Typography>
            </Stack>
          </React.Fragment>
        )
      case 'add/drop':
        return (
          <React.Fragment>
            <Typography align="right" variant="caption" display="block" color="transaction.timestamp" sx={{fontWeight: 'bold'}}>{dateString(tran.timestamp)}</Typography>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              {tran.players.player[0].transaction_data.type === 'add' ?
                <AddIcon fontSize="small" sx={{color: "transaction.add"}}/> :
                <RemoveIcon fontSize="small" sx={{color: "transaction.drop"}}/>
              }
              <Typography variant="body2">{tran.players.player[0].name.full}</Typography>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              {tran.players.player[1].transaction_data.type === 'add' ?
                <AddIcon fontSize="small" sx={{color: "transaction.add"}}/> :
                <RemoveIcon fontSize="small" sx={{color: "transaction.drop"}}/>
              }
              <Typography variant="body2">{tran.players.player[1].name.full}</Typography>
            </Stack>
          </React.Fragment>
        )
      case 'trade':
        return (
          <React.Fragment>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between"
              sx={{'& :only-child': {marginLeft: 'auto'}}}>
              {tran.status === 'vetoed' &&
                <Typography align="right" variant="subtitle2" display="block">Vetoed</Typography>
              }
              <Typography align="right" variant="caption" display="block" color="transaction.timestamp" sx={{fontWeight: 'bold'}}>{dateString(tran.timestamp)}</Typography>
            </Stack>
            {tran.players.player[0].transaction_data.destination_team_key === teamKey ? (
              <React.Fragment>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                  <ArrowForwardIcon fontSize="small" sx={{color: "transaction.add"}}/>
                  <Typography variant="body2">{tran.players.player[0].name.full}</Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                  <ArrowBackIcon fontSize="small" sx={{color: "transaction.drop"}}/>
                  <Typography variant="body2">{tran.players.player[1].name.full}</Typography>
                </Stack>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                  <ArrowForwardIcon fontSize="small" sx={{color: "transaction.add"}}/>
                  <Typography variant="body2">{tran.players.player[1].name.full}</Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                  <ArrowBackIcon fontSize="small" sx={{color: "transaction.drop"}}/>
                  <Typography variant="body2">{tran.players.player[0].name.full}</Typography>
                </Stack>
              </React.Fragment>
            )}
          </React.Fragment>
        )
      default:
        return null;
    }
  }

  const onSelectWeek = (e) => {
    setWeek(e.target.value);
  }

  const onShare = async () => {
    const canvas = await html2canvas(canvasRef.current, {backgroundColor: theme.palette.background.default, windowWidth: 1400});
    const image = canvas.toDataURL("image/png", 1.0);
    setCanvasURL(image);
    setModalOpen(true);
  }

  const handleModalClose = () => setModalOpen(false);

  const title = "Transactions";
  const subtitle = week === 0 ? "All transactions before the season start": `All transactions of week ${week}`;

  return (
    <React.Fragment>
      <ShareModal title={title} canvasURL={canvasURL} open={modalOpen} onClose={handleModalClose} />
      <Container ref={canvasRef} sx={{py: 2}}>
        <PageTitle title={title} subtitle={subtitle}/>
        <Stack direction="row" spacing={2} alignItems="center" data-html2canvas-ignore>
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

          <Box sx={{display: 'flex', flexGrow: 1}}></Box>
          <Button variant="contained" disableElevation size="large" sx={{bgcolor: "primary.main"}}
            onClick={onShare}>
            Export
          </Button>
        </Stack>

        {fetching ?
          <FetchingText /> : (
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
                            <TableCell align="center" colSpan={4} sx={{bgcolor: tran.status === 'vetoed' ? `background.paperDark` : null}}>
                              {transactionCell(tran, team.team_key)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{'&:last-child td, &:last-child th': { border: 0 }}}>
                          <TableCell align="right" sx={{fontWeight: 'bold'}}>Add</TableCell>
                          <TableCell align="left" sx={{fontWeight: 'bold'}}>{transactionSum(weekTransactions[team.team_id]).add}</TableCell>
                          <TableCell align="right" sx={{fontWeight: 'bold'}}>Drop</TableCell>
                          <TableCell align="left" sx={{fontWeight: 'bold'}}>{transactionSum(weekTransactions[team.team_id]).drop}</TableCell>
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

export default Transactions;
