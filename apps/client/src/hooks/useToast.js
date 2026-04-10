import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { addToast, beginExit, removeToast } from '../store/slices/toastSlice';

const DURATIONS = { success: 4000, error: 10000, info: 4000 };

export function useToast() {
    const dispatch = useDispatch();

    const show = useCallback((message, type, customDuration) => {
        const id = dispatch(addToast(message, type)).payload.id;
        const duration = customDuration ?? (DURATIONS[type] ?? 5000);

        setTimeout(() => dispatch(beginExit(id)), duration);
        setTimeout(() => dispatch(removeToast(id)), duration + 350);

        return id;
    }, [dispatch]);

    return {
        success: (msg, duration) => show(msg, 'success', duration),
        error: (msg, duration) => show(msg, 'error', duration),
        info: (msg, duration) => show(msg, 'info', duration),
        dismiss: (id) => {
            dispatch(beginExit(id));
            setTimeout(() => dispatch(removeToast(id)), 350);
        },
    };
}