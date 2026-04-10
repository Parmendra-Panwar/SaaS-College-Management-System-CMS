import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createListingApi } from '../../services/listingService';

export const submitNewListing = createAsyncThunk(
    'createListing/submit',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await createListingApi(formData);
            return response.data;
        } catch (err) {
            console.error("API Error:", err.response?.data);
            return rejectWithValue(err.response?.data?.error || "Failed to publish listing");
        }
    }
);

const createListingSlice = createSlice({
    name: 'createListing',
    initialState: {
        uploading: false,
        success: false,
        error: null,
    },
    reducers: {
        resetCreateState: (state) => {
            state.uploading = false;
            state.success = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitNewListing.pending, (state) => {
                state.uploading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(submitNewListing.fulfilled, (state) => {
                state.uploading = false;
                state.success = true;
            })
            .addCase(submitNewListing.rejected, (state, action) => {
                state.uploading = false;
                state.error = action.payload;
            });
    }
});

export const { resetCreateState } = createListingSlice.actions;
export default createListingSlice.reducer;