import { configureStore, combineReducers } from '@reduxjs/toolkit';
import metadataReducer from './containers/metadataSlice.js';
import statsReducer from './containers/Stats/statsSlice.js';
import transactionsReducer from './containers/Transactions/transactionsSlice.js';
import playerRankingReducer from './containers/PlayerRanking/playerRankingSlice.js';
import teamsReducer from './containers/Teams/teamsSlice.js';

const combinedReducer = combineReducers({
  metadata: metadataReducer,
  stats: statsReducer,
  transactions: transactionsReducer,
  teams: teamsReducer,
  playerRanking: playerRankingReducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'metadata/setGameKey/pending' || action.type === 'metadata/setLeagueKey/pending') {
    const {metadata} = state;
    state = {metadata};
  }
  return combinedReducer(state, action);
};

const store = configureStore({
  reducer: rootReducer,
})

export default store;
