import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import html2canvas from 'html2canvas';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CircleIcon from '@mui/icons-material/Circle';

import FetchingText from '../../components/FetchingText.js';
import PageTitle from '../../components/PageTitle.js';
import PageSubtitle from '../../components/PageSubtitle.js';
import ShareModal from '../../components/ShareModal.js';
import { selectTeams, selectStatCate } from '../metadataSlice.js';
import { fetchStatsBySeason, selectSeasonalStats, seasonalIsLoading as isLoading } from './statsSlice.js';
import { statsPreprocessing, statsH2H, statsRankAvg, statsH2HSum } from './statsHelper.js';


function SeasonalStats(props) {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const dispatch = useDispatch();
  const teams = useSelector(state => selectTeams(state));
  const statCate = useSelector(state => selectStatCate(state));

  const fetching = useSelector(state => isLoading(state));
  const seasonalStatsRaw = useSelector(state => selectSeasonalStats(state));

  const [type, setType] = useState('value');  // 'value'|'rank'
  const [modalOpen, setModalOpen] = useState(false);
  const [canvasURL, setCanvasURL] = useState('');

  useEffect(() => {
    dispatch(fetchStatsBySeason(teams.length));
  }, [teams, dispatch])

  const seasonalStats = useMemo(() => {  // {<team_id>: [{stat_id:, value:, rank:}, ]}
    if (fetching) {
      return undefined;
    }
    return statsPreprocessing(seasonalStatsRaw, statCate);
  }, [fetching, seasonalStatsRaw, statCate])

  const h2h = useMemo(() => {
    if (seasonalStats === undefined) {
      return undefined;
    }
    return statsH2H(seasonalStats, statCate, teams);
  }, [seasonalStats, statCate, teams])

  const rankAvg = useMemo(() => {
    if (seasonalStats === undefined) {
      return undefined;
    }
    return statsRankAvg(seasonalStats);
  }, [seasonalStats])

  const h2hSum = useMemo(() => {
    if (h2h === undefined) {
      return undefined;
    }
    return statsH2HSum(h2h);
  }, [h2h])

  const onSelectType = (e) => {
    setType(e.target.value);
  }

  const onShare = async () => {
    const canvas = await html2canvas(canvasRef.current, {backgroundColor: theme.palette.background.default, windowWidth: 1400});
    const image = canvas.toDataURL("image/png", 1.0);
    setCanvasURL(image);
    setModalOpen(true);
  }

  const handleModalClose = () => setModalOpen(false);

  const title = "Seasonal Stats";
  const subtitle = `Seasonal stats summary by ${type}`;

  return (
    <React.Fragment>
      <ShareModal title={title} canvasURL={canvasURL} open={modalOpen} onClose={handleModalClose} />
      <Container ref={canvasRef} sx={{py: 2}}>
        <PageTitle title={title} subtitle={subtitle}/>
        <Stack direction="row" spacing={2} alignItems="center" data-html2canvas-ignore>
          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={onSelectType}
            aria-label="type-selector"
          >
            <ToggleButton value="value" aria-label="value">Value</ToggleButton>
            <ToggleButton value="rank" aria-label="rank">Rank</ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{display: 'flex', flexGrow: 1}}></Box>
          <Button variant="contained" disableElevation size="large" sx={{bgcolor: "primary.main"}}
            onClick={onShare}>
            Export
          </Button>
        </Stack>

        {fetching ?
          <FetchingText /> : (
            <React.Fragment>
              <TableContainer component={Paper} sx={{ my: 2 }}>
                <Table sx={{minWidth: 700, 'th': {fontWeight: 'bold'}}} size="small" aria-label="stat-table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{minWidth: 70, maxWidth: 100}}> </TableCell>
                      {teams.map((team) => (
                        <TableCell align="right" sx={{minWidth: 70}} key={team.team_id}>
                          {team.name}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statCate.map((stat) => (
                      <TableRow
                        key={stat.stat_id}
                        sx={{'&:last-child td, &:last-child th': { border: 0 }, bgcolor: stat.is_only_display_stat ? `background.paperDark` : null}}
                      >
                        <TableCell align="right" component="th" scope="row">
                          {stat.display_name}
                        </TableCell>
                        {type === 'value' ?
                          Object.keys(seasonalStats).map((teamID) => (
                          <TableCell align="right" key={teamID}>
                            {seasonalStats[teamID].find(s => s.stat_id === Number(stat.stat_id)).value}
                          </TableCell>
                          )) :
                          Object.keys(seasonalStats).map((teamID) => (
                          <TableCell align="right" key={teamID}>
                            {seasonalStats[teamID].find(s => s.stat_id === Number(stat.stat_id)).rank}
                          </TableCell>
                          ))
                        }
                      </TableRow>
                    ))}
                    {type === 'rank' ? (
                      <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell align="right" component="th" scope="row">
                          Avg. Rank
                        </TableCell>
                        {teams.map(team =>
                          <TableCell align="right" key={team.team_id}>
                            {rankAvg[team.team_id]}
                          </TableCell>
                        )}
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </TableContainer>

              <PageSubtitle title="Matchup Results" subtitle={`Matchup results between teams of the season`}/>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Chip icon={<CircleIcon sx={{ "&&": { color: "status.win" }}}/>} label="Win" variant="outlined" size="small"/>
                <Chip icon={<CircleIcon sx={{ "&&": { color: "status.lose" }}}/>} label="Lose" variant="outlined" size="small"/>
                <Chip icon={<CircleIcon sx={{ "&&": { color: "status.tie" }}}/>} label="Tie" variant="outlined" size="small"/>
              </Stack>

              <TableContainer component={Paper} sx={{ my: 2 }}>
                <Table sx={{ minWidth: 700, 'th': {fontWeight: 'bold'}}} size="small" aria-label="h2h-table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{minWidth: 70, maxWidth: 100}}> </TableCell>
                      {teams.map((team) => (
                        <TableCell align="right" sx={{minWidth: 70}} key={team.team_id}>
                          {team.name}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teams.map(team => (
                      <TableRow
                        key={team.team_id}
                        sx={{'&:last-child td, &:last-child th': { border: 0 }}}
                      >
                        <TableCell align="right" component="th" scope="row">
                          {team.name}
                        </TableCell>
                        {teams.map(teamRow => {
                          if (team.team_id === teamRow.team_id) {
                            return <TableCell align="right" key={teamRow.team_id}></TableCell>;
                          }
                          else {
                            let result = h2h[team.team_id][teamRow.team_id];
                            let colorType; // reverse win/lose color
                            if (result.status === 'win') {colorType = 'lose';}
                            else if (result.status === 'lose') {colorType = 'win';}
                            else {colorType = result.status;}

                            return <TableCell align="right" sx={{bgcolor: `status.${colorType}`}} key={teamRow.team_id}>{`${result.lose.length}-${result.win.length}`}</TableCell>;
                          }
                        })}
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell align="right" component="th" scope="row">W-L-T</TableCell>
                      {teams.map((team) => (
                        <TableCell align="right" key={team.team_id}>
                          {`${h2hSum[team.team_id].win}-${h2hSum[team.team_id].lose}-${h2hSum[team.team_id].tie}`}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </React.Fragment>
          )
        }
      </Container>
    </React.Fragment>
  )
}

export default SeasonalStats;
