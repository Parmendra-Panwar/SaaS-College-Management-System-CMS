import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi, signupApi, profileApi } from '../../services/authService';

// --- Thunks ---
export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
    try { return (await loginApi(data)).data; }
    catch (err) { return rejectWithValue(err.response?.data?.error || "Login Failed"); }
});

export const signupUser = createAsyncThunk('auth/signup', async (data, { rejectWithValue }) => {
    try { return (await signupApi(data)).data; }
    catch (err) { return rejectWithValue(err.response?.data?.error || "Signup Failed"); }
});

export const getProfile = createAsyncThunk('auth/profile', async (_, { rejectWithValue }) => {
    try { return (await profileApi()).data; }
    catch (err) { return rejectWithValue("Session Expired"); }
});

const safeGetUser = () => {
    try {
        const user = localStorage.getItem('user');
        // Check karo ki user null na ho aur valid JSON ho
        return user && user !== "undefined" ? JSON.parse(user) : null;
    } catch (e) {
        return null;
    }
};

// --- Slice ---
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: safeGetUser(),
        // user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.clear();
        },
        clearError: (state) => { state.error = null; }
    },
    extraReducers: (builder) => {
        builder
            // 1. Individually handle success (Zyaada stable hai)
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            })
            .addCase(signupUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            })
            .addCase(getProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            })
            // 2. Generic Matchers (Bina variables ke string pattern use karo)
            .addMatcher(
                (action) => action.type.startsWith('auth/') && action.type.endsWith('/pending'),
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                (action) => action.type.startsWith('auth/') && action.type.endsWith('/rejected'),
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            );
    }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;