import { configureStore } from '@reduxjs/toolkit';
import metadataReducer from './metadataSlice.js';

const store = configureStore({
  reducer: {
    metadata: metadataReducer,
  },
})

export default store;
