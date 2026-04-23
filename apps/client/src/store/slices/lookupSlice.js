import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import academicService from '../../services/academicService';

export const fetchLookups = createAsyncThunk(
    'lookup/fetchLookups',
    async (_, { rejectWithValue }) => {
        try {
            const [departments, classes, accessibleColleges] = await Promise.all([
                academicService.getDepartments(),
                academicService.getClasses(),
                academicService.getAccessibleColleges()
            ]);
            return {
                departments: departments.data,
                classes: classes.data,
                accessibleColleges: accessibleColleges.data
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch lookups');
        }
    }
);

const lookupSlice = createSlice({
    name: 'lookup',
    initialState: {
        departments: [],
        classes: [],
        accessibleColleges: [],
        loading: false,
        error: null,
        loaded: false
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLookups.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLookups.fulfilled, (state, action) => {
                state.loading = false;
                state.departments = action.payload.departments;
                state.classes = action.payload.classes;
                state.accessibleColleges = action.payload.accessibleColleges;
                state.loaded = true;
            })
            .addCase(fetchLookups.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default lookupSlice.reducer;
