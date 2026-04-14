import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';
import { SpinnerIcon } from './components/icons';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SuperAdminLogin from './pages/SuperAdminLogin';
import NotFound from './pages/NotFound';
import ProfilePage from './pages/ProfilePage';

import { getProfile } from './store/slices/authSlice';
import { useToast } from './hooks/useToast';

// ─── Layout ──────────────────────────────────────────────────────────────────
const Layout = () => (
  <div className="min-h-[100dvh] bg-[#FDFCF0] flex flex-col">
    <Navbar />
    <main className="flex-1 w-full flex flex-col pt-1">
      <Outlet />
    </main>
  </div>
);

// ─── Router ───────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'superadminlogin', element: <SuperAdminLogin /> },
      { path: 'profile/:username', element: <ProfilePage /> },
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