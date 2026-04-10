import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import listingReducer from './slices/listingSlice';
import createListingReducer from './slices/createListingSlice';
import profileReducer from './slices/profileSlice';
import toastReducer from './slices/toastSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        listings: listingReducer,
        createListing: createListingReducer,
        profile: profileReducer,
        toast: toastReducer,
    },
});

export default store;