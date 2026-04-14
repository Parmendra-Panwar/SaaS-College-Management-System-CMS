import React from 'react';

const CollegeHeadDashboard = () => {
    return (
        <div className="max-w-[1305px] mx-auto px-6 py-10 w-full animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">College Head Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
                    <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Total Students</span>
                    <span className="text-4xl font-extrabold text-gray-800">4,200</span>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2 border-l-4 border-l-emerald-500">
                    <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase">High Achievers (AI)</span>
                    <span className="text-4xl font-extrabold text-emerald-500">650</span>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2 border-l-4 border-l-blue-500">
                    <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Consistent (AI)</span>
                    <span className="text-4xl font-extrabold text-blue-500">3,400</span>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2 border-l-4 border-l-rose-500">
                    <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase">At-Risk (AI)</span>
                    <span className="text-4xl font-extrabold text-rose-500">150</span>
                </div>
            </div>
            
            <div className="mt-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4">Administrative Actions</h2>
                <p className="text-gray-500 mb-6">Manage high-level operations across your institution.</p>
                <div className="flex flex-wrap gap-4">
                    <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition shadow hover:shadow-lg">Bulk Onboard Semester</button>
                    <button className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition shadow hover:shadow-lg">Create Exam Template</button>
                    <button className="bg-gray-100 text-gray-800 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition">View K-Means Clusters</button>
                </div>
            </div>
        </div>
    );
};
export default CollegeHeadDashboard;
