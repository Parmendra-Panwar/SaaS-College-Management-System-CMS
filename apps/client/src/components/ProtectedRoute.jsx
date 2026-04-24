import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Role-based route guard.
 *
 * @param {Object}   props
 * @param {string[]} props.allowedRoles - Roles permitted to access child routes.
 * @param {string}   [props.redirectTo='/login'] - Where to send unauthorized users.
 *
 * Usage in router config:
 *   { element: <ProtectedRoute allowedRoles={['Admin']} />, children: [...] }
 */
const ProtectedRoute = ({ allowedRoles, redirectTo }) => {
    const { user, token } = useSelector(state => state.auth);

    // Not logged in at all → login page
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // Logged in but wrong role → Access Denied
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={redirectTo || '/dashboard/access-denied'} replace />;
    }

    // Authorized → render child routes
    return <Outlet />;
};

export default ProtectedRoute;
