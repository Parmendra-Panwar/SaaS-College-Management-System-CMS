import AllListing from '../components/AllListing';
import { useNavigate } from 'react-router-dom';
import FallbackImage from '../components/FallbackImage';

const Home = () => {
    const navigate = useNavigate();
    return (
        <div className="pb-32 min-h-screen bg-white">
            {/* Massive Brand Statement Hero */}
            <div className="max-w-[1305px] mx-auto px-6 md:pt-8 md:pb-10 pt-8 pb-16">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <div className="flex-1 w-full relative z-10 pt-3">
                        <span className="text-[#FF385C] font-extrabold tracking-widest text-[11px] mb-4 block uppercase flex items-center gap-2">
                            <span className="w-6 h-[2px] bg-[#FF385C] rounded-full"></span> Save Time and money with
                        </span>
                        <h1 className="text-[42px] lg:text-[60px] font-[800] leading-[1.05] tracking-tighter text-[#222222] mb-6">
                            Smart routes <br className="hidden lg:block" /> On budget..
                        </h1>
                        <p className="text-[#717171] text-[14px] lg:text-[18px] leading-relaxed max-w-lg mb-4 font-light">
                            Enter your budget and destination. Our system calculates the optimal route, stopovers, and stays so you never overspend.
                        </p>

                        {/* Redirect Button Element */}

                        <div onClick={() => navigate('/')} className="cursor-pointer bg-white border border-[#EBEBEB] pl-6 rounded-full shadow-[0_6px_16px_rgba(0,0,0,0.06)] flex items-center max-w-xl w-full transition-shadow duration-300 hover:shadow-[0_6px_20px_rgba(255,56,92,0.25)]">
                            <div className="flex-1">
                                <p className="text-[16px] font-[800] text-[#808080] uppercase tracking-wide">Let's Plan Your Next</p>
                            </div>
                            <button

                                className="bg-[#FF385C] cursor-pointer text-white px-8 py-4 border border-[#EBEBEB] rounded-r-full shadow-[0_6px_16px_rgba(255,56,92,0.3)] flex items-center gap-3 hover:shadow-[0_6px_20px_rgba(255,56,92,0.5)] transition-all duration-300 font-bold text-[16px]"
                            >
                                ITINERARY
                                {/* <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> */}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 w-full relative">
                        <div className="relative aspect-[6/4] rounded-[1rem] overflow-hidden shadow-xl z-10">
                            <FallbackImage
                                src="https://images.unsplash.com/photo-1615966192539-f1731963b19a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                className="w-full h-full object-cover"
                                alt="Travel Destination"
                                type="trip"
                            />
                            <div className="absolute bottom-2 right-2 bg-white/10 backdrop-blur-xl text-white p-3 rounded-3xl shadow-xl max-w-xs border border-white/10">
                                <p className="text-sm leading-relaxed text-gray-200">
                                    Sikkim, India
                                </p>
                            </div>
                        </div>
                        {/* Abstract Decorators */}
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#FF385C]/10 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute -top-10 -right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
                    </div>
                </div>
            </div>

            {/* Feeds Section */}
            <div className="bg-[#FAFAFA] pt-2">
                <div className="max-w-[1305px] mx-auto px-6 md:px-10 space-y-12">
                    <AllListing />
                </div>
            </div>
        </div >
    );
};

export default Home;