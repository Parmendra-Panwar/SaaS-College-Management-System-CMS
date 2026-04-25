import React from 'react';
import { useSelector } from 'react-redux';
import AttendanceModule from '@pages/AttendanceModule';

/**
 * Thin wrapper that reads the user from Redux and passes it to AttendanceModule.
 * This avoids the old pattern where DashboardRouter had to pass `user` as a prop.
 */
const AttendancePage = () => {
    const { user } = useSelector(state => state.auth);
    return <AttendanceModule user={user} />;
};

export default AttendancePage;
