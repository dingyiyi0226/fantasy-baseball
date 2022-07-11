import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { apis } from '../../utils/apis.js';


export const fetchMatchupsByWeek = createAsyncThunk('stats/fetchMatchupsByWeek', async (week) => {
  const matchups = await apis.getMatchupsByWeek(week);
  return matchups;
});

export const fetchStatsByDate = createAsyncThunk('stats/fetchStatsByDate', async (payload) => {
  // payload: {teamNum:, date:}
  const stats = await apis.getTeamsStatsByDate(payload.teamNum, payload.date);
  return stats;
});

export const fetchStatsByWeek = createAsyncThunk('stats/fetchStatsByWeek', async (payload) => {
  // payload: {teamNum:, week:}
  const stats = await apis.getTeamsStatsByWeek(payload.teamNum, payload.week);
  return stats;
});

export const fetchStatsBySeason = createAsyncThunk('stats/fetchStatsBySeason', async (teamNum) => {
  const stats = await apis.getTeamsStatsBySeason(teamNum);
  return stats;
});

export const fetchMatchupsUntilWeek = createAsyncThunk('stats/fetchMatchupsUntilWeek', async (payload) => {
  // payload: {teamIDs:, week:}
  const allMatchups = {};
  await Promise.all(payload.teamIDs.map(async team => {
    const matchup = await apis.getTeamMatchupsUntilWeek(team, payload.week);
    allMatchups[team] = matchup;
  }))
  return allMatchups;
});


const statsSlice = createSlice({
  name: 'stats',
  initialState: {
    matchups: undefined,
    dailyIsLoading: true,
    weeklyIsLoading: true,
    seasonalIsLoading: true,
    allMatchupsIsLoading: true,
    daily: undefined,
    weekly: undefined,
    seasonal: undefined,
    allMatchups: undefined,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchMatchupsByWeek.fulfilled, (state, action) => {
      state.matchups = action.payload;
    }).addCase(fetchMatchupsByWeek.rejected, (state, action) => {
      console.error('fetch matchups rejected');
    })

    builder.addCase(fetchStatsByDate.fulfilled, (state, action) => {
      state.daily = action.payload;
      state.dailyIsLoading = false;
    }).addCase(fetchStatsByDate.pending, (state, action) => {
      state.dailyIsLoading = true;
    }).addCase(fetchStatsByDate.rejected, (state, action) => {
      console.error('fetch daily stats rejected');
    })

    builder.addCase(fetchStatsByWeek.fulfilled, (state, action) => {
      state.weekly = action.payload;
      state.weeklyIsLoading = false;
    }).addCase(fetchStatsByWeek.pending, (state, action) => {
      state.weeklyIsLoading = true;
    }).addCase(fetchStatsByWeek.rejected, (state, action) => {
      console.error('fetch weekly stats rejected');
    })

    builder.addCase(fetchStatsBySeason.fulfilled, (state, action) => {
      state.seasonal = action.payload;
      state.seasonalIsLoading = false;
    }).addCase(fetchStatsBySeason.pending, (state, action) => {
      state.seasonalIsLoading = true;
    }).addCase(fetchStatsBySeason.rejected, (state, action) => {
      console.error('fetch seasonal stats rejected');
    })

    builder.addCase(fetchMatchupsUntilWeek.fulfilled, (state, action) => {
      state.allMatchups = action.payload;
      state.allMatchupsIsLoading = false;
    }).addCase(fetchMatchupsUntilWeek.pending, (state, action) => {
      state.allMatchupsIsLoading = true;
    }).addCase(fetchMatchupsUntilWeek.rejected, (state, action) => {
      console.error('fetch all matchups rejected');
    })
  }
})

export const selectMatchups = (state) => state.stats.matchups;
export const dailyIsLoading = (state) => state.stats.dailyIsLoading;
export const weeklyIsLoading = (state) => state.stats.weeklyIsLoading;
export const seasonalIsLoading = (state) => state.stats.seasonalIsLoading;
export const allMatchupsIsLoading = (state) => state.stats.allMatchupsIsLoading;
export const selectDailyStats = (state) => state.stats.daily;
export const selectWeeklyStats = (state) => state.stats.weekly;
export const selectSeasonalStats = (state) => state.stats.seasonal;
export const selectAllMatchups = (state) => state.stats.allMatchups;


export default statsSlice.reducer;
