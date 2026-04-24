import React from 'react';
import { Link } from 'react-router-dom';

const AccessDenied = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
            <div className="w-20 h-20 bg-rose-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-500 font-medium mb-8 max-w-md">
                You don't have permission to view this page. Please contact your administrator if you believe this is an error.
            </p>
            <Link
                to="/dashboard"
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all"
            >
                Back to Dashboard
            </Link>
        </div>
    );
};

export default AccessDenied;
