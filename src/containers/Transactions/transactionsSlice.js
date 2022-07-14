import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { apis } from '../../utils/apis.js';

export const fetchTransactions = createAsyncThunk('stats/fetchTransactions', async (teamIDs) => {
  const transactions = await apis.getTransactions();
  return transactions || [];
});


const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: {
    isLoading: true,
    transactions: undefined,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTransactions.fulfilled, (state, action) => {
      state.transactions = action.payload;
      state.isLoading = false;
    }).addCase(fetchTransactions.pending, (state, action) => {
      state.isLoading = true;
    }).addCase(fetchTransactions.rejected, (state, action) => {
      console.error('fetch transactions rejected');
    })
  }
})

export const isLoading = (state) => state.transactions.isLoading;
export const selectTransactions = (state) => state.transactions.transactions;

export default transactionsSlice.reducer;
