import { configureStore } from '@reduxjs/toolkit';
import metadataReducer from './containers/metadataSlice.js';
import statsReducer from './containers/Stats/statsSlice.js';
import transactionsReducer from './containers/Transactions/transactionsSlice.js';
import playerRankingReducer from './containers/PlayerRanking/playerRankingSlice.js';
import teamsReducer from './containers/Teams/teamsSlice.js';

const store = configureStore({
  reducer: {
    metadata: metadataReducer,
    stats: statsReducer,
    transactions: transactionsReducer,
    teams: teamsReducer,
    playerRanking: playerRankingReducer,
  },
})

export default store;
