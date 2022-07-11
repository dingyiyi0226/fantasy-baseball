import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { apis } from '../../utils/apis.js';

export const fetchMatchups = createAsyncThunk('teams/fetchMatchups', async (team) => {
  const matchups = await apis.getTeamMatchupsUntilWeek(team);
  return matchups;
});

export const fetchDailyStats = createAsyncThunk('teams/fetchDailyStats', async (payload) => {
  const { team, dates } = payload;

  let dailyStats = {};
  let dailyRoster = {};
  await Promise.all(dates.map(async (date) => {
    const roster = await apis.getTeamRosterByDate(team, date);
    let stat;
    if (roster.length > 25) {
      const [stat1, stat2] =  await Promise.all([
        apis.getPlayerAllStatsByDate(roster.slice(0, 25).map(p => p.player_key), date),
        apis.getPlayerAllStatsByDate(roster.slice(25).map(p => p.player_key), date)
      ]);
      stat = stat1.concat(stat2);
    }
    else {
      stat = await apis.getPlayerAllStatsByDate(roster.map(p => p.player_key), date);
    }
    dailyStats[date] = stat;
    dailyRoster[date] = roster;
  }))

  return {stats: dailyStats, roster: dailyRoster};
});

export const fetchSeasonalStats = createAsyncThunk('teams/fetchSeasonalStats', async (payload) => {
  const { team, weeks } = payload;
  let weeklyStats = {};
  const fetchWeeklyStats = async () => {
    await Promise.all(weeks.map(async (week) => {
      const stat = await apis.getTeamStatsByWeek(team, week);
      weeklyStats[week] = stat;
    }))
  }
  const [seasonalStats] = await Promise.all([apis.getTeamStatsBySeason(team), fetchWeeklyStats()])
  return {weekly: weeklyStats, seasonal: seasonalStats};
});

const teamsSlice = createSlice({
  name: 'teams',
  initialState: {
    team: 1,
    matchupIsLoading: true,
    dailyStatsIsLoading: true,
    seasonalStatsIsLoading: true,
    matchups: undefined,
    dailyRoster: undefined,
    dailyStats: undefined,
    weeklyStats: undefined,
    seasonalStats: undefined,
  },
  reducers: {
    setTeam: (state, action) => {
      state.team = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMatchups.fulfilled, (state, action) => {
      state.matchups = action.payload;
      state.matchupIsLoading = false;
    }).addCase(fetchMatchups.pending, (state, action) => {
      state.matchupIsLoading = true;
    }).addCase(fetchMatchups.rejected, (state, action) => {
      console.error('fetch matchups rejected');
    })

    builder.addCase(fetchDailyStats.fulfilled, (state, action) => {
      state.dailyStats = action.payload.stats;
      state.dailyRoster = action.payload.roster;
      state.dailyStatsIsLoading = false;
    }).addCase(fetchDailyStats.pending, (state, action) => {
      state.dailyStatsIsLoading = true;
    }).addCase(fetchDailyStats.rejected, (state, action) => {
      console.error('fetch dailyStats rejected');
    })

    builder.addCase(fetchSeasonalStats.fulfilled, (state, action) => {
      state.weeklyStats = action.payload.weekly;
      state.seasonalStats = action.payload.seasonal;
      state.seasonalStatsIsLoading = false;
    }).addCase(fetchSeasonalStats.pending, (state, action) => {
      state.seasonalStatsIsLoading = true;
    }).addCase(fetchSeasonalStats.rejected, (state, action) => {
      console.error('fetch seasonalStats rejected');
    })
  }
})

export const { setTeam } = teamsSlice.actions;

export const selectTeam = (state) => state.teams.team;
export const matchupsIsLoading = (state) => state.teams.matchupIsLoading;
export const dailyStatsIsLoading = (state) => state.teams.dailyStatsIsLoading;
export const seasonalStatsIsLoading = (state) => state.teams.seasonalStatsIsLoading;
export const selectMatchups = (state) => state.teams.matchups;
export const selectDailyStats = (state) => state.teams.dailyStats;
export const selectDailyRoster = (state) => state.teams.dailyRoster;
export const selectWeeklyStats = (state) => state.teams.weeklyStats;
export const selectSeasonalStats = (state) => state.teams.seasonalStats;

export default teamsSlice.reducer;
