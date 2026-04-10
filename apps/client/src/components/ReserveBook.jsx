
const ReserveBook = ({ price, buttonText }) => {
    return (
        <div className="relative">
            <div className="sticky top-28 p-8 border border-slate-200 rounded-3xl shadow-lg bg-white z-10">
                <div className="flex items-end gap-1 mb-6">
                    <span className="text-3xl font-black text-slate-900">₹{price?.toLocaleString('en-IN')}</span>
                    <span className="text-base text-slate-500 font-medium mb-1">/ night</span>
                </div>
                <button className="cursor-pointer w-full py-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl font-bold text-lg shadow-md transition-all active:scale-95">
                    {buttonText}
                </button>
                <div className="flex justify-center mt-4">
                    <span className="text-sm font-medium text-slate-400">You won't be charged yet</span>
                </div>
            </div>
        </div>
    )
}

export default ReserveBook;