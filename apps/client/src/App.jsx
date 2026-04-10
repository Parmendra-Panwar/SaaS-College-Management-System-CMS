import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';
import { SpinnerIcon } from './components/icons';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';

import SingleListing from './pages/SingleListing';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';

import ProfilePage from './pages/ProfilePage';
import Listings from './pages/Listings';
import SavedItems from './pages/SavedItems';

import { getProfile } from './store/slices/authSlice';
import { fetchListings } from './store/slices/listingSlice';
import { resetCreateState } from './store/slices/createListingSlice';
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

      { path: 'listings', element: <Listings /> },

      { path: 'listing/:id', element: <SingleListing /> },
      { path: 'createlisting', element: <CreateListing /> },
      { path: 'edit-listing/:id', element: <EditListing /> },

      { path: 'profile/:username', element: <ProfilePage /> },
      { path: 'saved', element: <SavedItems /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const dispatch = useDispatch();
  const toast = useToast();

  const { token, user, loading: authLoading } = useSelector(s => s.auth);
  const { uploading: listingUploading, success: listingSuccess, error: listingError } = useSelector(s => s.createListing);

  // ── Auth: fetch profile on cold load when token exists but user isn't loaded
  useEffect(() => {
    if (token && !user) dispatch(getProfile());
  }, [token, user, dispatch]);

  // ── Upload side-effects: ONE effect handles all three create flows
  useEffect(() => {
    if (listingSuccess) {
      toast.success('Listing published successfully!');
      dispatch(fetchListings(''));
      dispatch(resetCreateState());
    } else if (listingError) {
      toast.error(`Listing failed: ${listingError}`);
      dispatch(resetCreateState());
    }
  }, [listingSuccess, listingError]);

  const isUploading = listingUploading;

  return (
    <>
      {/* Full-screen auth spinner — only while bootstrapping session */}
      {authLoading && token && !user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FDFCF0]">
          <SpinnerIcon className="w-10 h-10 text-blue-600" />
        </div>
      )}

      {/* Background upload indicator — bottom-left, non-blocking */}
      {isUploading && (
        <div className="fixed bottom-6 left-6 z-[9998] flex items-center gap-3 bg-slate-900 border border-slate-700/40 text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-2xl">
          <SpinnerIcon className="w-4 h-4 text-white" />
          Uploading your memory…
        </div>
      )}

      {/* Global toasts — reads from Redux state, no Provider needed */}
      <ToastContainer />

      <RouterProvider router={router} />
    </>
  );
}