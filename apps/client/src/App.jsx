import { useEffect, lazy, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom';

import Navbar from '@components/Navbar';
import ToastContainer from '@components/ToastContainer';
import { SpinnerIcon } from '@components/icons';

// ─── Public Pages ────────────────────────────────────────────────────────────
import Home from '@pages/Home';
import Login from '@pages/Login';
// import SuperAdminLogin from '@pages/SuperAdminLogin';
import NotFound from '@pages/NotFound';
import ProfilePage from '@pages/ProfilePage';

// ─── Dashboard Infrastructure ────────────────────────────────────────────────
import DashboardLayout from '@components/DashboardLayout';
import ProtectedRoute from '@components/ProtectedRoute';
import RoleRedirect from '@components/RoleRedirect';
import AccessDenied from '@components/AccessDenied';

// ─── Admin Pages ─────────────────────────────────────────────────────────────
import ShowCollegesAdmin from '@/pages/admin/colleges/ShowCollegesAdmin';
import ShowManagersAdmin from '@/pages/admin/managers/ShowManagersAdmin';
import ShowRequestsAdmin from '@/pages/admin/requests/ShowRequestsAdmin';

// ─── Manager Pages ─────────────────────────────────────────────────────────────
import ShowCollegesManager from '@/pages/manager/colleges/ShowCollegesManager';

// ─── Principal Pages ──────────────────────────────

// ─── Teacher Pages ──────────────────────────────

// ─── Attendance (shared across all management roles + Teacher) ───────────────
import AttendancePage from '@pages/shared/AttendancePage';
import ReportPage from '@pages/shared/ReportPage';
import FeesPage from '@pages/shared/FeesPage';

import { getProfile } from '@store/slices/authSlice';
import { useToast } from '@hooks/useToast';
import ManageClasses from './pages/ManageClasses/ManageClasses';
import ManageDepartment from './pages/ManageDepartment/ManageDepartment';
import ManageStudent from './pages/ManageStudent/ManageStudent';
import ManageTeacher from './pages/ManageTeacher/ManageTeacher';

// ─── Public Layout ───────────────────────────────────────────────────────────
const GlobalLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard'); // FIXED

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
      // { path: 'superadminlogin', element: <SuperAdminLogin /> },
      { path: 'profile/:username', element: <ProfilePage /> },
    ],
  },
  // FIXED: Removed invalid wrapping object
  {
    path: 'admin/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <RoleRedirect /> },
      { path: 'access-denied', element: <AccessDenied /> },
      {
        element: <ProtectedRoute allowedRoles={['Admin']} />,
        children: [
          { path: 'colleges', element: <ShowCollegesAdmin /> },
          { path: 'managers', element: <ShowManagersAdmin /> },
          { path: 'requests', element: <ShowRequestsAdmin /> },
          { path: 'departments', element: <ManageDepartment /> },
          { path: 'classes', element: <ManageClasses /> },
          { path: 'students', element: <ManageStudent /> },
          { path: 'teachers', element: <ManageTeacher /> },
          { path: 'attendance', element: <AttendancePage /> },
          { path: 'fees', element: <FeesPage /> },
          { path: 'reports', element: <ReportPage /> },
        ],
      },
    ],
  },
  {
    path: 'manager/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <RoleRedirect /> },
      { path: 'access-denied', element: <AccessDenied /> },
      {
        element: <ProtectedRoute allowedRoles={['Manager']} />,
        children: [
          { path: 'colleges', element: <ShowCollegesManager /> },
          { path: 'departments', element: <ManageDepartment /> },
          { path: 'classes', element: <ManageClasses /> },
          { path: 'students', element: <ManageStudent /> },
          { path: 'teachers', element: <ManageTeacher /> },
          { path: 'attendance', element: <AttendancePage /> },
          { path: 'fees', element: <FeesPage /> },
          { path: 'reports', element: <ReportPage /> },
        ],
      },
    ],
  },
  {
    path: 'principal/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <RoleRedirect /> },
      { path: 'access-denied', element: <AccessDenied /> },
      {
        element: <ProtectedRoute allowedRoles={['Principal']} />,
        children: [
          { path: 'departments', element: <ManageDepartment /> },
          { path: 'classes', element: <ManageClasses /> },
          { path: 'students', element: <ManageStudent /> },
          { path: 'teachers', element: <ManageTeacher /> },
          { path: 'attendance', element: <AttendancePage /> },
          { path: 'fees', element: <FeesPage /> },
          { path: 'reports', element: <ReportPage /> },
        ],
      },
    ],
  },
  {
    path: 'teacher/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <RoleRedirect /> },
      { path: 'access-denied', element: <AccessDenied /> },
      {
        element: <ProtectedRoute allowedRoles={['Teacher']} />,
        children: [
          { path: 'classes', element: <ManageClasses /> },
          { path: 'students', element: <ManageStudent /> },
          { path: 'attendance', element: <AttendancePage /> },
          { path: 'fees', element: <FeesPage /> },
          { path: 'reports', element: <ReportPage /> },
        ],
      },
    ],
  },
  // FIXED: Added missing comma above and removed invalid closing brace
  { path: '*', element: <NotFound /> }
]);

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const dispatch = useDispatch();
  const toast = useToast();

  const { token, user, loading: authLoading } = useSelector(s => s.auth);

  useEffect(() => {
    if (token && !user) dispatch(getProfile());
  }, [token, user, dispatch]);

  return (
    <>
      {authLoading && token && !user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FDFCF0]">
          <SpinnerIcon className="w-10 h-10 text-blue-600" />
        </div>
      )}
      <ToastContainer />
      <RouterProvider router={router} />
    </>
  );
}