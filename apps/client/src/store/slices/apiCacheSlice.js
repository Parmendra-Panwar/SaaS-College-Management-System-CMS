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
        }
    }
}
);

export const { setCache, invalidateGroup } = apiCacheSlice.actions;

export default apiCacheSlice.reducer;
