import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

let _toastId = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timers = useRef({});

    const dismiss = useCallback((id) => {
        // Mark as exiting for animation
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        // Remove after animation completes
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 350);
        clearTimeout(timers.current[id]);
    }, []);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = ++_toastId;
        setToasts(prev => [...prev, { id, message, type, exiting: false }]);
        timers.current[id] = setTimeout(() => dismiss(id), duration);
        return id;
    }, [dismiss]);

    const toast = {
        success: (msg, opts) => addToast(msg, 'success', opts?.duration ?? 4000),
        error:   (msg, opts) => addToast(msg, 'error',   opts?.duration ?? 5000),
        info:    (msg, opts) => addToast(msg, 'info',    opts?.duration ?? 4000),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
    return ctx;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function SuccessIcon() {
    return (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="9" />
        </svg>
    );
}
function ErrorIcon() {
    return (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
            <circle cx="12" cy="12" r="9" />
        </svg>
    );
}
function InfoIcon() {
    return (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
    );
}

// ─── Per-type config ──────────────────────────────────────────────────────────
const CONFIG = {
    success: {
        icon: <SuccessIcon />,
        bg: 'bg-emerald-950',
        border: 'border-emerald-700/40',
        iconColor: 'text-emerald-400',
        bar: 'bg-emerald-500',
    },
    error: {
        icon: <ErrorIcon />,
        bg: 'bg-rose-950',
        border: 'border-rose-700/40',
        iconColor: 'text-rose-400',
        bar: 'bg-rose-500',
    },
    info: {
        icon: <InfoIcon />,
        bg: 'bg-slate-900',
        border: 'border-slate-700/40',
        iconColor: 'text-sky-400',
        bar: 'bg-sky-500',
    },
};

// ─── Toast item ───────────────────────────────────────────────────────────────
function ToastItem({ toast, onDismiss }) {
    const cfg = CONFIG[toast.type] || CONFIG.info;

    return (
        <div
            style={{
                animation: toast.exiting
                    ? 'toastSlideOut 0.35s cubic-bezier(0.4,0,1,1) forwards'
                    : 'toastSlideIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
            }}
            className={`
                relative w-[340px] max-w-[90vw] rounded-2xl border shadow-2xl overflow-hidden
                ${cfg.bg} ${cfg.border}
            `}
        >
            {/* Content */}
            <div className="flex items-center gap-3 px-4 py-3.5">
                <span className={cfg.iconColor}>{cfg.icon}</span>
                <p className="flex-1 text-sm font-medium text-white leading-snug">{toast.message}</p>
                <button
                    onClick={() => onDismiss(toast.id)}
                    className="ml-1 p-1 rounded-full text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors shrink-0"
                    aria-label="Dismiss"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>
            {/* Progress bar */}
            <div className={`absolute bottom-0 left-0 h-[2px] ${cfg.bar} w-full origin-left`}
                style={{ animation: `toastProgress ${toast.type === 'error' ? 5000 : 4000}ms linear forwards` }}
            />
        </div>
    );
}

// ─── Container ────────────────────────────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }) {
    if (!toasts.length) return null;
    return (
        <>
            <style>{`
                @keyframes toastSlideIn {
                   from { opacity: 0; transform: translateY(24px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0)    scale(1); }
                }
                @keyframes toastSlideOut {
                   from { opacity: 1; transform: translateY(0)    scale(1);    max-height: 80px; }
                    to   { opacity: 0; transform: translateY(12px) scale(0.95); max-height: 0;    margin: 0; }
                }
                @keyframes toastProgress {
                   from { transform: scaleX(1); }
                    to   { transform: scaleX(0); }
                }
            `}</style>
            <div
                className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none"
                aria-live="polite"
                aria-atomic="false"
            >
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem toast={t} onDismiss={onDismiss} />
                    </div>
                ))}
            </div>
        </>
    );
}
