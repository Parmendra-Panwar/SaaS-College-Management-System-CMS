import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import SuperAdminDashboard from './SuperAdminDashboard';
import CollegeHeadDashboard from './CollegeHeadDashboard';
import TeacherDashboard from './TeacherDashboard';
import AttendanceModule from './AttendanceModule';
import { logout } from '../store/slices/authSlice';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar'; // Import the new Sidebar

const DashboardRouter = () => {
    const { user } = useSelector(state => state.auth);
    const { section } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (user && user.role && !section) {
            const defaultTab = user.role === 'Admin' ? 'colleges' :
                (user.role === 'Principal' || user.role === 'Manager') ? 'departments' :
                    'attendance';
            navigate(`/dashboard/${defaultTab}`, { replace: true });
        }
    }, [user, section, navigate]);

    if (!user || !user.role) {
        return <div className="p-10 text-center text-xl font-bold">Unrecognized Role. Please contact Admin.</div>;
    }

    const activeTab = section;

    let navItems = [];
    if (user.role === 'Admin') navItems = [
        { id: 'colleges', label: 'Colleges' },
        { id: 'managers', label: 'Managers' },
        { id: 'requests', label: 'College Requests' },
        { id: 'departments', label: 'Departments' },
        { id: 'classes', label: 'Classes' },
        { id: 'students', label: 'Manage Students' },
        { id: 'teachers', label: 'Manage Teachers' },
        { id: 'attendance', label: 'Attendance' }
    ];
    else if (user.role === 'Principal' || user.role === 'Manager') navItems = [
        { id: 'departments', label: 'Departments' },
        { id: 'classes', label: 'Classes' },
        { id: 'students', label: 'Manage Students' },
        { id: 'teachers', label: 'Manage Teachers' },
        { id: 'attendance', label: 'Attendance' }
    ];
    else if (user.role === 'Teacher') navItems = [
        { id: 'attendance', label: 'Attendance' },
        { id: 'grades', label: 'Input Grades' },
        { id: 'discipline', label: 'Discipline / Notes' }
    ];

    const renderContent = () => {
        if (activeTab === 'attendance') return <AttendanceModule user={user} />;

        switch (user.role) {
            case 'Admin':
                if (['colleges', 'managers', 'requests'].includes(activeTab)) return <SuperAdminDashboard activeTab={activeTab} />;
                return <CollegeHeadDashboard activeMainTab={activeTab} />;
            case 'Principal':
            case 'Manager': return <CollegeHeadDashboard activeMainTab={activeTab} />;
            case 'Teacher': return <TeacherDashboard activeTab={activeTab} />;
            case 'Student': return <div className="p-10 text-center text-xl font-bold text-gray-800">Student Dashboard (Coming Soon)</div>;
            default: return <div className="p-10 text-center text-xl font-bold text-red-500">Access Denied</div>;
        }
    }

    return (
        <div className="flex w-full h-screen bg-[#FDFCF0] overflow-hidden">
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                navItems={navItems}
                activeTab={activeTab}
                user={user}
            />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Changed to flex-row and aligned items horizontally for mobile fix */}
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

                <main className="flex-1 overflow-y-auto bg-[#FDFCF0]">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default DashboardRouter;