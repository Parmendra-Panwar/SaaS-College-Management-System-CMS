import { createSlice } from '@reduxjs/toolkit';

let nextId = 1;

const toastSlice = createSlice({
    name: 'toast',
    initialState: {
        toasts: [], // [{ id, message, type: 'success'|'error'|'info', exiting: false }]
    },
    reducers: {
        addToast: {
            reducer(state, action) {
                state.toasts.push(action.payload);
            },
            prepare(message, type = 'info') {
                return { payload: { id: nextId++, message, type, exiting: false } };
            },
        },
        beginExit(state, action) {
            const toast = state.toasts.find(t => t.id === action.payload);
            if (toast) toast.exiting = true;
        },
        removeToast(state, action) {
            state.toasts = state.toasts.filter(t => t.id !== action.payload);
        },
    },
});

export const { addToast, beginExit, removeToast } = toastSlice.actions;
export default toastSlice.reducer;
