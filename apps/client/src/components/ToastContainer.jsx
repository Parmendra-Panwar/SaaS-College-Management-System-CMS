import { useSelector, useDispatch } from 'react-redux';
import { beginExit, removeToast } from '@store/slices/toastSlice';
import { CheckCircleIcon, XCircleIcon, InfoIcon, XIcon } from '@components/icons';

// Per-type visual config
const CONFIG = {
    success: {
        Icon: CheckCircleIcon,
        bg: 'bg-emerald-950',
        border: 'border-emerald-700/40',
        iconCls: 'text-emerald-400',
        bar: 'bg-emerald-500',
        duration: 4000,
    },
    error: {
        Icon: XCircleIcon,
        bg: 'bg-rose-950',
        border: 'border-rose-700/40',
        iconCls: 'text-rose-400',
        bar: 'bg-rose-500',
        duration: 5000,
    },
    info: {
        Icon: InfoIcon,
        bg: 'bg-slate-900',
        border: 'border-slate-700/40',
        iconCls: 'text-sky-400',
        bar: 'bg-sky-500',
        duration: 4000,
    },
};

function ToastItem({ toast }) {
    const dispatch = useDispatch();
    const cfg = CONFIG[toast.type] ?? CONFIG.info;
    const { Icon } = cfg;

    const dismiss = () => {
        dispatch(beginExit(toast.id));
        setTimeout(() => dispatch(removeToast(toast.id)), 350);
    };

    return (
        <div
            role="alert"
            aria-live="assertive"
            style={{
                animation: toast.exiting
                    ? 'toastOut 0.35s cubic-bezier(0.4,0,1,1) forwards'
                    : 'toastIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
            }}
            className={`relative w-[340px] max-w-[90vw] rounded-2xl border shadow-2xl overflow-hidden ${cfg.bg} ${cfg.border}`}
        >
            <div className="flex items-center gap-3 px-4 py-3.5">
                <Icon className={`w-5 h-5 shrink-0 ${cfg.iconCls}`} />
                <p className="flex-1 text-sm font-medium text-white leading-snug">{toast.message}</p>
                <button
                    onClick={dismiss}
                    aria-label="Dismiss notification"
                    className="ml-1 p-1 rounded-full text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors shrink-0"
                >
                    <XIcon className="w-4 h-4" />
                </button>
            </div>

            {/* Shrinking progress bar */}
            <div
                className={`absolute bottom-0 left-0 h-[2px] ${cfg.bar} w-full`}
                style={{ animation: `toastProgress ${cfg.duration}ms linear forwards` }}
            />
        </div>
    );
}

export default function ToastContainer() {
    const toasts = useSelector(state => state.toast.toasts);

    if (!toasts.length) return null;

    return (
        <>
            <style>{`
                @keyframes toastIn {
                   from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes toastOut {
                   from { opacity: 1; transform: translateY(0) scale(1); }
                    to   { opacity: 0; transform: translateY(10px) scale(0.95); }
                }
                @keyframes toastProgress {
                   from { transform: scaleX(1); transform-origin: left; }
                    to   { transform: scaleX(0); transform-origin: left; }
                }
            `}</style>
            <div
                className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none"
                aria-label="Notifications"
            >
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem toast={t} />
                    </div>
                ))}
            </div>
        </>
    );
}
