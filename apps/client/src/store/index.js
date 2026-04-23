import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import toastReducer from './slices/toastSlice';
import lookupReducer from './slices/lookupSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        toast: toastReducer,
        lookup: lookupReducer,
    },
});

export default store;