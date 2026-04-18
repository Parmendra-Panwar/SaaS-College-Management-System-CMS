import React, { useState } from 'react';

const TeacherDashboard = ({ activeTab }) => {
    const [mockStudents, setMockStudents] = useState([
        { id: 1, name: 'Alex Johnson', enrollment: 'CMS-401', attendance: 'Present', grade: 'A', status: 'Good' },
        { id: 2, name: 'Beverly Hills', enrollment: 'CMS-402', attendance: 'Present', grade: 'B', status: 'Warning' },
        { id: 3, name: 'Charlie Davis', enrollment: 'CMS-403', attendance: 'Absent', grade: 'C', status: 'Good' },
    ]);

    const handleStudentChange = (id, field, value) => {
        setMockStudents(students => students.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    console.log("activeTab>>> ", activeTab)

    return (
        <div className="max-w-[1305px] mx-auto px-6 py-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 bg-[#FDFCF0] min-h-screen">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6 border-b pb-4">Teacher Portal</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-3xl shadow-lg text-white flex flex-col gap-2">
                    <span className="text-sm font-semibold tracking-wide uppercase text-white/80">Assigned Classes</span>
                    <span className="text-5xl font-extrabold">4</span>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-2">
                    <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Work Count (Performance)</span>
                    <span className="text-5xl font-extrabold text-orange-500">23</span>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-2">
                    <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Exams to Grade</span>
                    <span className="text-5xl font-extrabold text-gray-800">2</span>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-2 border-l-4 border-l-emerald-500">
                    <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Total Students</span>
                    <span className="text-5xl font-extrabold text-emerald-500">124</span>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 tracking-tight">Class Roster - <span className="text-indigo-600">Computer Science 101</span></h2>
                    <select className="border border-gray-200 rounded-xl px-4 py-2 font-medium bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>CS 101 - Section A</option>
                        <option>CS 101 - Section B</option>
                        <option>Math 202 - Section A</option>
                    </select>
                </div>

                <div className="overflow-x-auto min-w-[800px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="p-4 font-bold text-gray-500 rounded-tl-xl rounded-bl-xl border-y border-l">Student Name</th>
                                <th className="p-4 font-bold text-gray-500 border-y">Enrollment #</th>
                                <th className="p-4 font-bold text-gray-500 rounded-tr-xl rounded-br-xl border-y border-r">Action / Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockStudents.map(student => (
                                <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                    <td className="p-4 font-bold text-gray-800">{student.name}</td>
                                    <td className="p-4 font-mono text-sm text-gray-500">{student.enrollment}</td>
                                    <td className="p-4">
                                        {activeTab === 'attendance' && (
                                            <select
                                                className={`px-4 py-2 rounded-xl font-bold outline-none cursor-pointer ${student.attendance === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                                                value={student.attendance}
                                                onChange={e => handleStudentChange(student.id, 'attendance', e.target.value)}
                                            >
                                                <option value="Present">Present</option>
                                                <option value="Absent">Absent</option>
                                                <option value="Late">Late</option>
                                            </select>
                                        )}
                                        {activeTab === 'grades' && (
                                            <input
                                                type="text"
                                                className="border border-gray-200 rounded-lg w-20 px-3 py-1 font-bold text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={student.grade}
                                                onChange={e => handleStudentChange(student.id, 'grade', e.target.value)}
                                            />
                                        )}
                                        {activeTab === 'discipline' && (
                                            <input
                                                type="text"
                                                className="border border-gray-200 rounded-lg w-full px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 placeholder-gray-400"
                                                value={student.status}
                                                onChange={e => handleStudentChange(student.id, 'status', e.target.value)}
                                                placeholder="Add a note..."
                                            />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 pt-6 border-t flex justify-end">
                    <button className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all">
                        Save {activeTab?.charAt(0).toUpperCase() + activeTab?.slice(1)} Records
                    </button>
                </div>
            </div>
        </div>
    );
};
export default TeacherDashboard;
