import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchProfileApi } from '../../services/profileService';

export const fetchUserProfile = createAsyncThunk(
    'profile/fetch',
    async ({ username, page = 1 }, { rejectWithValue }) => {
        try {
            const response = await fetchProfileApi(username, page);
            return response.data;
        } catch (err) {
            return rejectWithValue("Failed to load profile");
        }
    }
);

const profileSlice = createSlice({
    name: 'profile',
    initialState: {
        userData: null,
        stats: { followers: 0, following: 0 },
        posts: { trips: [], activities: [], listings: [] },
        pagination: { currentPage: 1 },
        loading: false,
        hasNext: { trips: false, activities: false, listings: false },
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserProfile.pending, (state) => { state.loading = true; })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.userData = action.payload.user;
                state.stats = { followers: action.payload.followers, following: action.payload.following };

                // Save ONLY first load data in Redux to reduce RAM usage
                if (action.payload.currentPage === 1) {
                    state.posts.trips = action.payload.trips;
                    state.posts.activities = action.payload.activities;
                    state.posts.listings = action.payload.listings;

                    state.hasNext = action.payload.hasNext;
                }
                state.pagination.currentPage = action.payload.currentPage;
            });
    }
});

export default profileSlice.reducer;