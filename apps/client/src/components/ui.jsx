import { SpinnerIcon } from './icons';

/**
 * Full-page centered loader used while data is fetching.
 * Replaces all the ad-hoc `flex justify-center mt-20` + spinner divs.
 */
export function PageLoader() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
            <SpinnerIcon className="w-8 h-8 text-[#FF385C]" />
        </div>
    );
}

/**
 * Full-page centered error state.
 */
export function PageError({ message = 'Something went wrong.' }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 px-6 text-center">
            <svg className="w-10 h-10 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4M12 16h.01" />
            </svg>
            <p className="text-slate-600 font-medium text-sm max-w-xs">{message}</p>
        </div>
    );
}

/**
 * Inline mini spinner for buttons (disabled state).
 */
export function ButtonSpinner() {
    return (
        <svg className="animate-spin w-4 h-4 inline-block mr-2" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}

export function InputField({ label, ...props }) {
    return (
        <div>
            {label && <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>}
            <input
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none bg-white"
                {...props}
            />
        </div>
    );
}

export function SelectField({ label, children, ...props }) {
    return (
        <div>
            {label && <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>}
            <select
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none"
                {...props}
            >
                {children}
            </select>
        </div>
    );
}

export function PrimaryButton({ loading, children, ...props }) {
    return (
        <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md disabled:opacity-70 flex justify-center items-center"
            {...props}
        >
            {loading && <ButtonSpinner />}
            {children}
        </button>
    );
}
