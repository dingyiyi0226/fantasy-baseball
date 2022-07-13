import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { apis } from '../utils/apis.js';


export const fetchMetadata = createAsyncThunk('metadata/fetchMetadata', async () => {
  let games = await apis.getUserGames();
  if (!Array.isArray(games)) {
    games = [games];
  }
  const currentGame = games[games.length-1];

  let leagues = games[games.length-1].leagues.league;
  if (!Array.isArray(leagues)) {
    leagues = [leagues];
  }
  const currentLeague = await apis.getLeague(leagues[0].league_key);

  return {game: currentGame, league: currentLeague, games: games, leagues: leagues};
});

export const setGameKey = createAsyncThunk('metadata/setGameKey', async (gameKey, thunkAPI) => {
  const { getState } = thunkAPI;
  let currentGame = getState().metadata.games.find(g => g.game_key === gameKey);
  let leagues = currentGame.leagues.league;
  if (!Array.isArray(leagues)) {
    leagues = [leagues];
  }

  const currentLeague = await apis.getLeague(leagues[0].league_key);
  return {league: currentLeague, leagues: leagues, game: currentGame};
})


export const setLeagueKey = createAsyncThunk('metadata/setLeagueKey', async (leagueKey) => {
  const currentLeague = await apis.getLeague(leagueKey);
  return currentLeague;
})

const metadataSlice = createSlice({
  name: 'metadata',
  initialState: {
    isLoading: true,
    currentGameKey: '',
    currentLeagueKey: '',
    game: {},
    league: {},
    games: {},
    leagues: {},
  },
  reducers: {

  },
  extraReducers: (builder) => {
    builder.addCase(fetchMetadata.fulfilled, (state, action) => {
      state.games = action.payload.games;
      state.leagues = action.payload.leagues;

      state.game = action.payload.game;
      state.league = action.payload.league;
      state.currentGameKey = action.payload.game.game_key;
      state.currentLeagueKey = action.payload.league.league_key;

      state.isLoading = false;
    }).addCase(fetchMetadata.pending, (state, action) => {
      state.isLoading = true;
    }).addCase(fetchMetadata.rejected, (state, action) => {
      console.error('fetch metadata rejected');
    })

    builder.addCase(setLeagueKey.fulfilled, (state, action) => {
      state.league = action.payload;
      state.currentLeagueKey = action.payload.league_key;

      state.isLoading = false;
    }).addCase(setLeagueKey.pending, (state, action) => {
      state.isLoading = true;
    }).addCase(setLeagueKey.rejected, (state, action) => {
      console.error('setLeagueKey rejected');
    })

    builder.addCase(setGameKey.fulfilled, (state, action) => {
      state.game = action.payload.game;
      state.currentGameKey = action.payload.game.game_key;
      state.leagues = action.payload.leagues;
      state.league = action.payload.league;
      state.currentLeagueKey = action.payload.league.league_key;

      state.isLoading = false;
    }).addCase(setGameKey.pending, (state, action) => {
      state.isLoading = true;
    }).addCase(setGameKey.rejected, (state, action) => {
      console.error('setGameKey rejected');
    })

  }
})

export const isLoading = (state) => state.metadata.isLoading;
export const selectGame = (state) => state.metadata.game;
export const selectLeague = (state) => state.metadata.league;
export const selectGameKey = (state) => state.metadata.currentGameKey;
export const selectLeagueKey = (state) => state.metadata.currentLeagueKey;
export const selectGames = (state) => state.metadata.games;
export const selectLeagues = (state) => state.metadata.leagues;

export const selectTeams = (state) => state.metadata.league.teams.team;
export const selectStatCate = (state) => state.metadata.league.settings.stat_categories.stats.stat;
export const selectStandings = (state) => state.metadata.league.standings.teams.team;
export const selectStatCateFull = (state) => state.metadata.game.stat_categories.stats.stat;
export const selectGameWeeks = (state) => state.metadata.game.game_weeks.game_week;

export default metadataSlice.reducer;
