import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDefaultPath } from '@hooks/useNavigation';

/**
 * Index route for /dashboard.
 * Reads the user's role from Redux and redirects to their default tab.
 * Uses `replace: true` so the browser back button skips this intermediate redirect.
 */
const RoleRedirect = () => {
    const { user } = useSelector(state => state.auth);

    if (!user || !user.role) {
        return <Navigate to="/login" replace />;
    }

    return <Navigate to={`/dashboard/${getDefaultPath(user.role)}`} replace />;
};

export default RoleRedirect;
