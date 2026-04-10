import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';

const Navbar = () => {
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);
    const location = useLocation();
    const navigate = useNavigate();

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const isBusiness = user?.roles?.includes('BUSINESS');
    // const isNormal = user?.roles?.includes('NORMAL');

    // Outside click handler to close modal
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const linkStyle = (path) =>
        `text-[15px] font-[600] tracking-tight transition-all duration-300 ${location.pathname === path ? 'text-[#222222]' : 'text-[#717171] hover:text-[#222222]'
        }`;

    return (
        <nav className="bg-white/90 backdrop-blur-xl border-b border-[#EBEBEB] sticky top-0 z-50">
            <div className="max-w-[1305px] px-6 md:px-10 mx-auto w-full flex justify-between items-center h-[80px]">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 bg-rose-600 rounded-full flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <span className="text-[22px] font-[800] text-[#FF385C] tracking-tighter">SaaS CMS</span>
                </Link>

                <div className="flex items-center gap-4 sm:gap-6">
                    {user ? (
                        <div className="flex items-center gap-6">

                            {/* Desktop Quick Links */}
                            <div className="hidden md:flex items-center gap-6 pr-2">
                                <Link to="/listings" className={linkStyle('/listings') + " cursor-pointer"}>Explore Properties</Link>
                            </div>

                            {/* Airbnb-style Profile Pill with Modal */}
                            <div className="relative" ref={menuRef}>
                                <div
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="flex items-center gap-3 pl-3.5 pr-1.5 py-1.5 border border-[#DDDDDD] rounded-full hover:shadow-md transition-shadow bg-white duration-300 cursor-pointer"
                                >
                                    <svg className="w-4 h-4 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                    </svg>

                                    {/* Circle Avatar: Click redirects to profile */}
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevents modal from opening
                                            navigate(`/profile/${user.username}`);
                                        }}
                                        className="w-[34px] h-[34px] rounded-full bg-[#222222] text-white flex items-center justify-center font-bold text-sm hover:opacity-90 transition-opacity"
                                    >
                                        {user.username?.charAt(0).toUpperCase()}
                                    </div>
                                </div>

                                {/* Dropdown Modal */}
                                {showMenu && (
                                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-2 z-50 overflow-hidden">
                                        <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                            <button onClick={() => navigate(`/profile/${user.username}`)} className="cursor-pointer w-full text-left py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Profile</button>
                                        </div>

                                        <div className="flex md:hidden flex-col items-center pr-2">
                                            <button onClick={() => navigate('/listings')} className="cursor-pointer w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Explore Properties</button>
                                        </div>

                                        {isBusiness && (
                                            <>
                                                <button onClick={() => navigate('/createlisting')} className="cursor-pointer w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">List Property</button>
                                            </>
                                        )}

                                        <div className="h-[1px] bg-gray-100 my-1"></div>
                                        <button onClick={handleLogout} className="cursor-pointer w-full text-left px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors">Logout</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="px-5 py-2.5 text-[15px] font-[600] text-[#222222] hover:bg-[#F7F7F7] rounded-full transition-colors">Log in</Link>
                            <Link to="/signup" className="bg-[#FF385C] text-white px-6 py-2.5 rounded-full text-[15px] font-[600] hover:bg-[#D90B38] transition-colors">Sign up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;