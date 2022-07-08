import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { apis } from './utils/apis.js';


export const fetchMetadata = createAsyncThunk('metadata/fetchMetadata', async () => {
  const game = await apis.getGame();
  const leagueKey = await apis.getLeagueKey(game.game_key);
  const league = await apis.getLeague(leagueKey);
  return {game: game, league: league};
});

const metadataSlice = createSlice({
  name: 'metadata',
  initialState: {
    isLoading: true,
    game: {},
    league: {},
  },
  reducers: {

  },
  extraReducers: (builder) => {
    builder.addCase(fetchMetadata.fulfilled, (state, action) => {
      state.game = action.payload.game;
      state.league = action.payload.league;
      state.isLoading = false;
    }).addCase(fetchMetadata.rejected, (state, action) => {
      console.error('fetch metadata rejected');
    })

  }
})

export const isLoading = (state) => state.metadata.isLoading;
export const selectGame = (state) => state.metadata.game;
export const selectLeague = (state) => state.metadata.league;
export const selectLeagueKey = (state) => state.metadata.league.league_key;
export const selectTeams = (state) => state.metadata.league.teams.team;
export const selectStatCate = (state) => state.metadata.league.settings.stat_categories.stats.stat;
export const selectStatCateFull = (state) => state.metadata.game.stat_categories.stats.stat;
export const selectGameWeeks = (state) => state.metadata.game.game_weeks.game_week;

export default metadataSlice.reducer;
