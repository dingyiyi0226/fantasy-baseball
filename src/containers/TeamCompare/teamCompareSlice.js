import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { apis } from '../../utils/apis.js';

export const fetchTeamsAll = createAsyncThunk('teamCompare/fetchTeamsAll', async (teamNum) => {
  const teams = await apis.getTeamsAll(teamNum);
  return teams;
});


const teamCompareSlice = createSlice({
  name: 'teamCompare',
  initialState: {
    isLoading: true,
    teamsAll: undefined,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTeamsAll.fulfilled, (state, action) => {
      state.teamsAll = action.payload;
      state.isLoading = false;
    }).addCase(fetchTeamsAll.pending, (state, action) => {
      state.isLoading = true;
    }).addCase(fetchTeamsAll.rejected, (state, action) => {
      console.error('fetch teamsAll rejected');
    })
  }
})

export const isLoading = (state) => state.teamCompare.isLoading;
export const selectTeamsAll = (state) => state.teamCompare.teamsAll;

export default teamCompareSlice.reducer;
