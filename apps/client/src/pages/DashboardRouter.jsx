import React from 'react';
import SuperAdminDashboard from './SuperAdminDashboard';
import CollegeHeadDashboard from './CollegeHeadDashboard';
import TeacherDashboard from './TeacherDashboard';

const DashboardRouter = ({ user }) => {
  if (!user || !user.role) {
     return <div className="p-10 text-center text-xl font-bold">Unrecognized Role. Please contact Admin.</div>;
  }

  switch (user.role) {
    case 'Admin':
      return <SuperAdminDashboard />;
    case 'Principal':
    case 'Manager':
      return <CollegeHeadDashboard />;
    case 'Teacher':
      return <TeacherDashboard />;
    case 'Student':
      return <div className="p-10 text-center text-xl font-bold text-gray-800">Student Dashboard (Coming Soon)</div>;
    default:
      return <div className="p-10 text-center text-xl font-bold text-red-500">Access Denied</div>;
  }
};

export default DashboardRouter;
