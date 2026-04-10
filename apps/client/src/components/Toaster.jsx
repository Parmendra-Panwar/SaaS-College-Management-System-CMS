const Toaster = ({ message }) => {
    return (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100]">
            <div className="bg-[#222222] shadow-[0_8px_28px_rgba(0,0,0,0.28)] rounded-full px-6 py-3.5 flex items-center gap-3 backdrop-blur-md w-max mx-auto">
                <div className="w-[18px] h-[18px] border-[2px] border-white/20 border-t-white rounded-full animate-spin"></div>
                <p className="text-[14px] font-[600] text-white tracking-wide">{message}</p>
            </div>
        </div>
    );
};
export default Toaster;