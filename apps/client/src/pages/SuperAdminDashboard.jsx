import React from 'react';

const SuperAdminDashboard = () => {
    return (
        <div className="max-w-[1305px] mx-auto px-6 py-10 w-full">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Super Admin Command Center</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2 transition hover:shadow-md">
                    <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Total Colleges</span>
                    <span className="text-5xl font-extrabold text-blue-600">42</span>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2 transition hover:shadow-md">
                    <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Active Subscriptions</span>
                    <span className="text-5xl font-extrabold text-emerald-500">38</span>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2 transition hover:shadow-md">
                    <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Monthly Revenue</span>
                    <span className="text-5xl font-extrabold text-indigo-600">$120k</span>
                </div>
            </div>
            
            <div className="mt-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4">Onboard New Tenant</h2>
                <div className="flex gap-4">
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition shadow hover:shadow-lg">Create New College</button>
                    <button className="bg-gray-100 text-gray-800 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition">View System Logs</button>
                </div>
            </div>
        </div>
    );
};
export default SuperAdminDashboard;
