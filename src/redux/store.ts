import { configureStore } from '@reduxjs/toolkit';
import modalReducer from './slices/modalSlice';
import dataReducer from './slices/dataSlice';


const store = configureStore({
  reducer: {
    modal: modalReducer,
    importData: dataReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
