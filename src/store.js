import { configureStore, combineReducers } from '@reduxjs/toolkit';
import metadataReducer from './containers/metadataSlice';
import statsReducer from './containers/Stats/statsSlice';
import teamCompareReducer from './containers/TeamCompare/teamCompareSlice';
import transactionsReducer from './containers/Transactions/transactionsSlice';
import playerRankingReducer from './containers/PlayerRanking/playerRankingSlice';
import teamsReducer from './containers/Teams/teamsSlice';

const combinedReducer = combineReducers({
  metadata: metadataReducer,
  stats: statsReducer,
  teamCompare: teamCompareReducer,
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
