import { configureStore } from '@reduxjs/toolkit';
import metadataReducer from './containers/metadataSlice.js';

const store = configureStore({
  reducer: {
    metadata: metadataReducer,
  },
})

export default store;
