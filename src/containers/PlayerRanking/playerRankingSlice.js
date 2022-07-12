import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { apis } from '../../utils/apis.js';

const genBatch = (playerNum) => {
  const full = Math.floor(playerNum/25);
  const last = playerNum%25;
  const batch = [];

  for (let i=0;i<full;i++) {
    batch.push({start: i*25, count: 25});
  }
  if (last > 0) {
    batch.push({start: full*25, count: last});
  }

  return batch;
}

export const fetchPlayerRanking = createAsyncThunk('stats/fetchPlayerRanking', async (playerNum) => {
  const batch = genBatch(playerNum);
  const players = {};
  await Promise.all(batch.map(async (b) => {
    const results = await apis.getPlayersByActualRanking(b.start, b.count);
    results.forEach((player, idx) => {
      players[b.start+idx+1] = player;
    })
  }))
  return players;
});


const playerRankingSlice = createSlice({
  name: 'playerRanking',
  initialState: {
    isLoading: true,
    playerRanking: undefined,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchPlayerRanking.fulfilled, (state, action) => {
      state.playerRanking = action.payload;
      state.isLoading = false;
    }).addCase(fetchPlayerRanking.pending, (state, action) => {
      state.isLoading = true;
    }).addCase(fetchPlayerRanking.rejected, (state, action) => {
      console.error('fetch playerRanking rejected');
    })
  }
})

export const isLoading = (state) => state.playerRanking.isLoading;
export const selectPlayerRanking = (state) => state.playerRanking.playerRanking;

export default playerRankingSlice.reducer;