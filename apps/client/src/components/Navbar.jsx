import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '@store/slices/authSlice';

const Navbar = (showLogo = true) => {
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
        `text-[15px] font-[600] tracking-tight transition-all duration-300 ${location.pathname.includes('/dashboard') ? 'text-indigo-600' : 'text-[#717171] hover:text-indigo-600'
        }`;

    return (
        <nav className="bg-white/90 backdrop-blur-xl border-b border-[#EBEBEB] sticky top-0 z-40">
            <div className={`px-6 md:px-10 mx-auto w-full flex ${showLogo.showLogo ? 'justify-between' : 'justify-end'} items-center h-[70px]`}>

                {/* Logo */}
                {showLogo.showLogo && (
                    <Link to="/" className="flex items-center gap-2.5 group">
                        {/* <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center transform group-hover:-rotate-3 transition-transform duration-300 shadow-md">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path>
                            </svg>
                        </div> */}
                        <div className="font-black text-2xl tracking-tighter text-gray-900">
                            Academia<span className="text-blue-600">.</span>
                        </div>
                    </Link>
                )}

                <div className="flex items-center gap-4 sm:gap-6">
                    {user ? (
                        <div className="flex items-center gap-6">

                            {/* Desktop Quick Links */}
                            <div className="hidden md:flex items-center gap-6 pr-2">
                                <Link to={`/${user.role.toLowerCase()}/dashboard`} className={linkStyle(`/${user.role.toLowerCase()}/dashboard`) + " cursor-pointer"}>Dashboard</Link>
                                <span className="text-gray-300">|</span>
                                <span className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2 tracking-widest"><div className="w-2 h-2 rounded-full bg-green-500"></div>{user.role}</span>
                            </div>

                            {/* CMS Profile Action */}
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
                                            e.stopPropagation();
                                            navigate(`/profile/${user.username}`);
                                        }}
                                        className="w-[34px] h-[34px] rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm hover:opacity-90 transition-opacity"
                                    >
                                        {user.username?.charAt(0).toUpperCase()}
                                    </div>
                                </div>

                                {/* Dropdown Modal */}
                                {showMenu && (
                                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-2 z-50 overflow-hidden">
                                        <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                            <button onClick={() => { setShowMenu(false); navigate(`/profile/${user.username}`); }} className="cursor-pointer w-full text-left py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">My Profile</button>
                                        </div>

                                        <div className="flex md:hidden flex-col items-center pr-2">
                                            <button onClick={() => { setShowMenu(false); navigate(`/${user.role.toLowerCase()}/dashboard`); }} className="cursor-pointer w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Dashboard</button>
                                        </div>

                                        <div className="h-[1px] bg-gray-100 my-1"></div>
                                        <button onClick={handleLogout} className="cursor-pointer w-full text-left px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors">Sign out</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-[15px] font-[600] shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all">Log in</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;