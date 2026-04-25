import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '@components/Navbar';
import Sidebar from '@components/Sidebar';

/**
 * Persistent dashboard shell.
 * Renders Sidebar + Navbar that stay mounted while <Outlet /> swaps the page content.
 */
const DashboardLayout = () => {
    const { user } = useSelector(state => state.auth);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // If no user, still render the layout shell — the child <ProtectedRoute>
    // and <RoleRedirect> components will handle redirecting to /login.

    return (
        <div className="flex w-full h-screen bg-[#FDFCF0] overflow-hidden">
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header with mobile hamburger + Navbar */}
                <header className="bg-white/90 border-b border-[#EBEBEB] flex items-center w-full relative">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden ml-4 p-2 text-gray-600 hover:text-indigo-600 transition"
                    >
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                    <div className="flex-1">
                        <Navbar showLogo={false} />
                    </div>
                </header>

                {/* Page content — swapped by React Router */}
                <main className="flex-1 overflow-y-auto bg-[#FDFCF0]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
