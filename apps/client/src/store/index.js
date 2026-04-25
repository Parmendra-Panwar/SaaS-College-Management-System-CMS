import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@store/slices/authSlice';
import toastReducer from '@store/slices/toastSlice';
import lookupReducer from '@store/slices/lookupSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        toast: toastReducer,
        lookup: lookupReducer,
    },
});

export default store;