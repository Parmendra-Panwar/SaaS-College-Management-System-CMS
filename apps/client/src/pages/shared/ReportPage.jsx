import React from 'react';
import { useSelector } from 'react-redux';
import ReportModule from '@pages/ReportModule';

/**
 * Thin wrapper that reads user from Redux and passes it to ReportModule.
 * Mirrors the same pattern used by AttendancePage.
 */
const ReportPage = () => {
    const { user } = useSelector(state => state.auth);
    return <ReportModule user={user} />;
};

export default ReportPage;
