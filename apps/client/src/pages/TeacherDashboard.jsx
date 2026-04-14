import React from 'react';

const TeacherDashboard = () => {
    return (
        <div className="max-w-[1305px] mx-auto px-6 py-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Teacher Portal</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white flex flex-col gap-2">
                    <span className="text-sm font-semibold tracking-wide uppercase text-white/80">Assigned Classes</span>
                    <span className="text-5xl font-extrabold">4</span>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
                    <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Work Count (Performance)</span>
                    <span className="text-5xl font-extrabold text-orange-500">23</span>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
                    <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Exams to Grade</span>
                    <span className="text-5xl font-extrabold text-gray-800">2</span>
                </div>
            </div>
            
            <div className="mt-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Daily Operations</h2>
                <div className="flex flex-wrap gap-4">
                    <button className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition shadow hover:shadow-lg">Take Attendance</button>
                    <button className="bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700 transition shadow hover:shadow-lg">Fill Bi-Weekly Reports</button>
                    <button className="bg-gray-100 text-gray-800 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition">Input Exam Results</button>
                </div>
            </div>
        </div>
    );
};
export default TeacherDashboard;
