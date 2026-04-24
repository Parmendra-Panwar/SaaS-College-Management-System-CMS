import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useNavigation } from '@hooks/useNavigation';

const NavIcon = ({ name, active }) => {
    const className = `w-5 h-5 ${active ? 'text-indigo-600' : 'text-gray-400'}`;
    if (name === 'colleges') return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
    if (name === 'managers') return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
    if (name === 'requests') return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    if (name === 'students' || name === 'attendance') return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
    if (name === 'teachers' || name === 'grades') return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
    if (name === 'discipline') return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
}

/**
 * Dashboard Sidebar.
 *
 * Active tab is now synced from the current URL via useLocation() — the URL is
 * the single source of truth instead of props passed down from DashboardRouter.
 *
 * navItems come from the useNavigation() hook based on the user's role.
 */
const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { navItems, user } = useNavigation();

    const activeTab = location.pathname.split('/dashboard/')[1]?.split('/')[0] || '';

    return (
        <>
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            <aside className={`z-50 fixed inset-y-0 left-0 bg-white border-r border-[#EBEBEB] w-[260px] flex flex-col shadow-xl md:shadow-none z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Mobile close button */}
                <button onClick={() => setSidebarOpen(false)} className="md:hidden absolute top-4 right-4 mt-2 text-gray-500 hover:text-gray-900">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                {/* Sidebar Header / Logo */}
                <div className="h-[70px] flex items-center px-6 border-b border-[#EBEBEB] shrink-0">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center transform group-hover:-rotate-3 transition-transform duration-300 shadow-md">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path>
                            </svg>
                        </div>
                        <span className="text-[20px] font-extrabold text-indigo-700 tracking-tight">Academia</span>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
                    <nav className="flex flex-col gap-1.5">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    navigate(`/dashboard/${item.path}`);
                                    setSidebarOpen(false);
                                }}
                                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-bold transition-all text-sm ${activeTab === item.path ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <NavIcon name={item.id} active={activeTab === item.path} />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {user && (
                    <div className="p-4 border-t border-[#EBEBEB] shrink-0 bg-gray-50/50">
                        <div className="flex items-center gap-3 bg-white p-2 border border-[#EBEBEB] rounded-xl shadow-sm">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700 font-extrabold text-lg uppercase shadow-sm">
                                {user.username.charAt(0)}
                            </div>
                            <div className="text-left overflow-hidden">
                                <p className="font-bold text-gray-900 text-sm truncate">{user.username}</p>
                                <p className="font-semibold text-gray-400 text-[11px] uppercase tracking-wider">{user.role}</p>
                            </div>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
};

export default Sidebar;