import { useEffect, lazy, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom';

import Navbar from '@components/Navbar';
import ToastContainer from '@components/ToastContainer';
import { SpinnerIcon } from '@components/icons';

// ─── Public Pages ────────────────────────────────────────────────────────────
import Home from '@pages/Home';
import Login from '@pages/Login';
import Signup from '@pages/Signup';
import SuperAdminLogin from '@pages/SuperAdminLogin';
import NotFound from '@pages/NotFound';
import ProfilePage from '@pages/ProfilePage';

// ─── Dashboard Infrastructure ────────────────────────────────────────────────
import DashboardLayout from '@components/DashboardLayout';
import ProtectedRoute from '@components/ProtectedRoute';
import RoleRedirect from '@components/RoleRedirect';
import AccessDenied from '@components/AccessDenied';

// ─── Admin Pages ─────────────────────────────────────────────────────────────
import ShowColleges from '@pages/admin/colleges/ShowColleges';
import ShowManagers from '@pages/admin/managers/ShowManagers';
import ShowRequests from '@pages/admin/requests/ShowRequests';

// ─── Shared Pages (Admin + Principal + Manager) ──────────────────────────────
import ShowDepartments from '@pages/principal/departments/ShowDepartments';
import ShowClasses from '@pages/principal/classes/ShowClasses';
import ShowTeachers from '@pages/principal/teachers/ShowTeachers';
import ShowStudents from '@pages/principal/students/ShowStudents';

// ─── Attendance (shared across all management roles + Teacher) ───────────────
import AttendancePage from '@pages/shared/AttendancePage';

// ─── Teacher Pages ───────────────────────────────────────────────────────────
import TeacherGradesPage from '@pages/teacher/grades/TeacherGradesPage';
import TeacherDisciplinePage from '@pages/teacher/discipline/TeacherDisciplinePage';

import { getProfile } from '@store/slices/authSlice';
import { useToast } from '@hooks/useToast';

// ─── Public Layout ───────────────────────────────────────────────────────────
const GlobalLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  if (isDashboard) {
    return <Outlet />;
  }

  return (
    <div className="min-h-[100dvh] bg-[#FDFCF0] flex flex-col">
      <Navbar showLogo={true} />
      <main className="flex-1 w-full flex flex-col pt-1">
        <Outlet />
      </main>
    </div>
  );
};

// ─── Router ──────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    path: '/',
    element: <GlobalLayout />,
    children: [
      // ── Public routes ──────────────────────────────────────────────────
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'superadminlogin', element: <SuperAdminLogin /> },
      { path: 'profile/:username', element: <ProfilePage /> },

      // ── Dashboard (nested routes with persistent layout) ───────────────
      {
        path: 'dashboard',
        element: <DashboardLayout />,
        children: [
          // Index redirect → role-appropriate default tab
          { index: true, element: <RoleRedirect /> },

          // Access Denied page
          { path: 'access-denied', element: <AccessDenied /> },

          // ── Admin-only routes ────────────────────────────────────────
          {
            element: <ProtectedRoute allowedRoles={['Admin']} />,
            children: [
              { path: 'colleges', element: <ShowColleges /> },
              { path: 'managers', element: <ShowManagers /> },
              { path: 'requests', element: <ShowRequests /> },
            ],
          },

          // ── Shared: Admin + Principal + Manager ─────────────────────
          {
            element: <ProtectedRoute allowedRoles={['Admin', 'Principal', 'Manager']} />,
            children: [
              { path: 'departments', element: <ShowDepartments /> },
              { path: 'classes',     element: <ShowClasses /> },
              { path: 'students',    element: <ShowStudents /> },
              { path: 'teachers',    element: <ShowTeachers /> },
            ],
          },

          // ── Attendance: Admin + Principal + Manager + Teacher ───────
          {
            element: <ProtectedRoute allowedRoles={['Admin', 'Principal', 'Manager', 'Teacher']} />,
            children: [
              { path: 'attendance', element: <AttendancePage /> },
            ],
          },

          // ── Teacher-only routes ─────────────────────────────────────
          {
            element: <ProtectedRoute allowedRoles={['Teacher']} />,
            children: [
              { path: 'grades',     element: <TeacherGradesPage /> },
              { path: 'discipline', element: <TeacherDisciplinePage /> },
            ],
          },

          // ── Student routes (future) ─────────────────────────────────
          {
            element: <ProtectedRoute allowedRoles={['Student']} />,
            children: [
              {
                path: 'home',
                element: (
                  <div className="p-10 text-center text-xl font-bold text-gray-800">
                    Student Dashboard (Coming Soon)
                  </div>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const dispatch = useDispatch();
  const toast = useToast();

  const { token, user, loading: authLoading } = useSelector(s => s.auth);

  // ── Auth: fetch profile on cold load when token exists but user isn't loaded
  useEffect(() => {
    if (token && !user) dispatch(getProfile());
  }, [token, user, dispatch]);


  return (
    <>
      {/* Full-screen auth spinner — only while bootstrapping session */}
      {authLoading && token && !user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FDFCF0]">
          <SpinnerIcon className="w-10 h-10 text-blue-600" />
        </div>
      )}

      {/* Global toasts — reads from Redux state, no Provider needed */}
      <ToastContainer />

      <RouterProvider router={router} />
    </>
  );
}