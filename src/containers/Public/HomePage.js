import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Toolbar from '@mui/material/Toolbar';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

import dailyMatchupImg from './daily_matchup.png';
import dailyStatImg from './daily_stat.png';
import playerHrImg from './player_hr.png';
import playerRankImg from './player_rank.png';
import seasonalMatchupImg from './seasonal_matchup.png';
import seasonalStatImg from './seasonal_stat.png';
import teamWeeklyImg from './team_weekly.png';
import transactionImg from './transaction.png';
import weeklyMatchupImg from './weekly_matchup.png';
import weeklyStatImg from './weekly_stat.png';
import yahooLogin from './yahoo_login.png';

const oauth_link = `https://api.login.yahoo.com/oauth2/request_auth?client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&response_type=code`;

function HomePage(props) {

  const [statType, setStatType] = useState('daily');  // 'daily' | 'weekly' | 'seasonal'
  const [statRankingType, setStatRankingType] = useState('rank');  // 'rank' | 'hr'

  const onSelectStatType = (e) => {
    setStatType(e.target.value);
  }

  const onSelectStatRankingType = (e) => {
    setStatRankingType(e.target.value);
  }

  return (
    <Container>
      <Toolbar variant="dense"/>
      <Grid container spacing={2} alignItems="start" sx={{mt: 2, mb: 16}}>
        <Grid item xs={12} sm={8}>
          <Typography variant="h2" sx={{mb: 2, fontWeight: 'bold'}}>Yahoo Fantasy Baseball Helper</Typography>
          <Typography variant="h4" sx={{mb: 2}}>Compare the stats of your league and team</Typography>
          <a href={oauth_link}>
            <Box component="img" sx={{width: 250, mt: 2}} alt="yahoo-login" src={yahooLogin}/>
          </a>
        </Grid>
      </Grid>

      <Divider sx={{mt: 8, mb: 2}}/>

      <Typography variant="h4" align="center" sx={{mb: 4}}>
        {"Display "}
        <Typography variant="h4" component="span" sx={{fontWeight: "bold", color: "primary.dark"}}>
          {statType} stats
        </Typography>
        {" and matchups in your league"}
      </Typography>
      <Grid container spacing={{ xs: 5, md: 4 }} alignItems="center" justifyContent="center">
        <Grid item xs={12} sm={10} md={9} lg={8}>
          <ToggleButtonGroup
            value={statType}
            exclusive
            onChange={onSelectStatType}
            aria-label="type-selector"
            sx={{display: 'block', mx: 0}}
          >
            <ToggleButton value="daily" aria-label="daily">Daily</ToggleButton>
            <ToggleButton value="weekly" aria-label="weekly">Weekly</ToggleButton>
            <ToggleButton value="seasonal" aria-label="seasonal">Seasonal</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid item xs={12} sm={10} md={9} lg={8}>
          <Box component="img" alt="stat-img"
            src={statType === 'daily' ? dailyStatImg : statType === 'weekly' ? weeklyStatImg : seasonalStatImg}
            sx={{width: '100%',borderRadius: 2, boxShadow: 4}}/>
          <Box component="img" alt="matchup-img"
            src={statType === 'daily' ? dailyMatchupImg : statType === 'weekly' ? weeklyMatchupImg : seasonalMatchupImg}
            sx={{width: '100%',borderRadius: 2, boxShadow: 4}}/>
        </Grid>
      </Grid>

      <Divider sx={{mt: 8, mb: 2}}/>

      <Typography variant="h4" align="center" sx={{mb: 4}}>
        {"Display "}
        <Typography variant="h4" component="span" sx={{fontWeight: "bold", color: "primary.dark"}}>
          player stat/overall rankings
        </Typography>
        {" by teams"}
      </Typography>
      <Grid container spacing={{ xs: 5, md: 4 }} alignItems="center" justifyContent="center">
        <Grid item xs={12} sm={10} md={9} lg={8}>
          <ToggleButtonGroup
            value={statRankingType}
            exclusive
            onChange={onSelectStatRankingType}
            aria-label="stat-ranking-selector"
            sx={{display: 'block', mx: 0}}
          >
            <ToggleButton value="rank" aria-label="rank">Rank</ToggleButton>
            <ToggleButton value="hr" aria-label="hr">HR</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid item xs={12} sm={10} md={9} lg={8}>
          <Box component="img" alt="player-rank-img" src={statRankingType === 'rank' ? playerRankImg : playerHrImg}
            sx={{width: '100%',borderRadius: 2, boxShadow: 4}}/>
        </Grid>
      </Grid>

      <Divider sx={{mt: 8, mb: 2}}/>

      <Typography variant="h4" align="center" sx={{mb: 4}}>
        {"Display "}
        <Typography variant="h4" component="span" sx={{fontWeight: "bold", color: "primary.dark"}}>
          weekly transactions
        </Typography>
        {" by teams"}
      </Typography>
      <Grid container spacing={{ xs: 5, md: 4 }} alignItems="center" justifyContent="center">
        <Grid item xs={12} sm={10} md={9} lg={8}>
          <Box component="img" alt="transaction-img" src={transactionImg}
            sx={{width: '100%',borderRadius: 2, boxShadow: 4}}/>
        </Grid>
      </Grid>

      <Divider sx={{mt: 8, mb: 2}}/>

      <Typography variant="h4" align="center" sx={{mb: 4}}>
        {"Display weekly stats including "}
        <Typography variant="h4" component="span" sx={{fontWeight: "bold", color: "primary.dark"}}>
          BN/NA/IL players
        </Typography>
        {" in your team"}
      </Typography>
      <Grid container spacing={{ xs: 5, md: 4 }} alignItems="center" justifyContent="center">
        <Grid item xs={12} sm={10} md={9} lg={8}>
          <Box component="img" alt="team-weekly-img" src={teamWeeklyImg}
            sx={{width: '100%',borderRadius: 2, boxShadow: 4}}/>
        </Grid>
      </Grid>

    </Container>
  )
}

export default HomePage;
