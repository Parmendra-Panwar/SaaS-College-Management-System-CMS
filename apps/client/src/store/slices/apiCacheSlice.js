import { createSlice } from '@reduxjs/toolkit';

const apiCacheSlice = createSlice({
    name: 'apiCache',
    initialState: {},
    reducers: {
        setCache: (state, action) => {
            const { key, data } = action.payload;
            state[key] = {
                data,
                timestamp: Date.now()
            };
        },
        invalidateGroup: (state, action) => {
            const prefix = action.payload;
            Object.keys(state).forEach(key => {
                if (key.startsWith(prefix)) {
                    delete state[key];
                }
            });
        },
        clearCache: () => {
            return {};
        }
    }
});

export const { setCache, invalidateGroup, clearCache } = apiCacheSlice.actions;

export default apiCacheSlice.reducer;
