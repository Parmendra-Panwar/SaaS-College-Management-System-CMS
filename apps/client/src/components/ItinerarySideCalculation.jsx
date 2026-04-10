export default function ItinerarySideCalculation({ totalDistance, budget, totalSpent, remainingBudget, loading, onSave }) {
    return (
        <div className="lg:w-[380px] w-full shrink-0 mt-8 md:mt-24">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-8 md:top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-5 pb-4 border-b border-gray-100">Trip Summary</h2>

                <div className="space-y-4 mb-6 text-sm">
                    <div className="flex justify-between items-center text-gray-600">
                        <span>Total Distance</span>
                        <span className="font-medium text-gray-900">{totalDistance} km</span>
                    </div>

                    <div className="flex justify-between items-center text-gray-600">
                        <span>Total Budget</span>
                        <span className="font-medium text-gray-900">₹{budget?.toLocaleString()}</span>
                    </div>

                    <div className="pt-2">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Spent</span>
                            <span className="font-semibold text-gray-900 text-base">₹{totalSpent?.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${totalSpent > budget ? 'bg-red-500' : 'bg-[#FF385C]'}`}
                                style={{ width: `${Math.min((totalSpent / budget) * 100, 100)}%` }}
                            />
                        </div>
                        {totalSpent > budget && (
                            <p className="text-red-500 text-xs mt-2 text-right">Over budget by ₹{(totalSpent - budget)?.toLocaleString()}</p>
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <span className="text-gray-900 font-medium">Remaining</span>
                        <span className={`font-semibold text-lg ${remainingBudget < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            ₹{remainingBudget?.toLocaleString()}
                        </span>
                    </div>
                </div>

                <button
                    onClick={onSave}
                    disabled={loading}
                    className="w-full bg-[#FF385C] hover:bg-[#E33153] text-white py-3.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm shadow-sm"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        'Confirm Booking'
                    )}
                </button>
                <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Secure Checkout
                </p>
            </div>
        </div>
    );
}