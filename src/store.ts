// src/store.ts
import { configureStore } from '@reduxjs/toolkit';
import flowchartReducer from './components/flowchartSlice';

const store = configureStore({
  reducer: {
    flowchart: flowchartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
