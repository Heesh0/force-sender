import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import senderReducer from './slices/senderSlice';
import campaignReducer from './slices/campaignSlice';
import recipientReducer from './slices/recipientSlice';
import templateReducer from './slices/templateSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sender: senderReducer,
    campaign: campaignReducer,
    recipient: recipientReducer,
    template: templateReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 