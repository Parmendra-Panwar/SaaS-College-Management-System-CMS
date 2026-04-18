import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../hooks/useToast';

const CollegeHeadDashboard = () => {
    const toast = useToast();
    const authHeader = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }};

    const [studentsData, setStudentsData] = useState([{ username: '', email: '', enrollmentNumber: '', classId: '' }]);
    const [teachersData, setTeachersData] = useState([{ username: '', email: '', level: '1' }]);
    const [loading, setLoading] = useState(false);

    // Students Handlers
    const handleAddRow = () => setStudentsData([...studentsData, { username: '', email: '', enrollmentNumber: '', classId: '' }]);
    const handleRemoveRow = (index) => setStudentsData(studentsData.filter((_, i) => i !== index));
    const handleChange = (index, field, value) => {
        const newData = [...studentsData];
        newData[index][field] = value;
        setStudentsData(newData);
    };

    // Teachers Handlers
    const handleAddTeacherRow = () => setTeachersData([...teachersData, { username: '', email: '', level: '1' }]);
    const handleRemoveTeacherRow = (index) => setTeachersData(teachersData.filter((_, i) => i !== index));
    const handleTeacherChange = (index, field, value) => {
        const newData = [...teachersData];
        newData[index][field] = value;
        setTeachersData(newData);
    };

    const submitBulkStudents = async () => {
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/onboarding/bulk-students`, { students: studentsData }, authHeader);
            toast.success("Students bulk onboarded successfully");
            setStudentsData([{ username: '', email: '', enrollmentNumber: '', classId: '' }]);
        } catch (err) {
            toast.error("Failed to onboard students");
        } finally {
            setLoading(false);
        }
    };

    const submitBulkTeachers = async () => {
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/onboarding/bulk-teachers`, { teachers: teachersData }, authHeader);
            toast.success("Teachers bulk onboarded successfully");
            setTeachersData([{ username: '', email: '', level: '1' }]);
        } catch (err) {
            toast.error("Failed to onboard teachers");
        } finally {
            setLoading(false);
        }
    };

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
            
            <div className="mt-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                <h2 className="text-xl font-bold mb-4">Bulk Student Onboarding Table</h2>
                <div className="min-w-[800px]">
                    <div className="grid grid-cols-5 gap-4 mb-2 font-bold text-gray-700 bg-gray-50 p-3 rounded-xl border">
                        <div>Username</div>
                        <div>Email</div>
                        <div>Enrollment #</div>
                        <div>Class Object ID</div>
                        <div>Actions</div>
                    </div>
                    {studentsData.map((student, index) => (
                        <div key={index} className="grid grid-cols-5 gap-4 mb-2 items-center">
                            <input className="border rounded px-3 py-2" placeholder="John Doe" value={student.username} onChange={e => handleChange(index, 'username', e.target.value)} />
                            <input className="border rounded px-3 py-2" placeholder="john@student.com" type="email" value={student.email} onChange={e => handleChange(index, 'email', e.target.value)} />
                            <input className="border rounded px-3 py-2" placeholder="CMS2001" value={student.enrollmentNumber} onChange={e => handleChange(index, 'enrollmentNumber', e.target.value)} />
                            <input className="border rounded px-3 py-2 text-xs" placeholder="MongoDB ID" value={student.classId} onChange={e => handleChange(index, 'classId', e.target.value)} />
                            <div>
                                <button onClick={() => handleRemoveRow(index)} className="bg-rose-100 text-rose-600 px-3 py-1.5 rounded hover:bg-rose-200">Remove</button>
                            </div>
                        </div>
                    ))}
                    
                    <div className="flex gap-4 mt-6">
                        <button onClick={handleAddRow} className="bg-gray-100 px-6 py-2 rounded-xl hover:bg-gray-200 font-medium">+ Add Student</button>
                        <button onClick={submitBulkStudents} disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium shadow hover:shadow-lg">{loading ? 'Uploading...' : 'Submit Bulk Roster'}</button>
                    </div>
                </div>
            </div>

            {/* TEACHERS TABLE */}
            <div className="mt-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                <h2 className="text-xl font-bold mb-4">Bulk Teacher Onboarding Table</h2>
                <div className="min-w-[800px]">
                    <div className="grid grid-cols-4 gap-4 mb-2 font-bold text-gray-700 bg-gray-50 p-3 rounded-xl border">
                        <div>Full Name</div>
                        <div>Email</div>
                        <div>Level (1-3)</div>
                        <div>Actions</div>
                    </div>
                    {teachersData.map((teacher, index) => (
                        <div key={index} className="grid grid-cols-4 gap-4 mb-2 items-center">
                            <input className="border rounded px-3 py-2" placeholder="Mr. Smith" value={teacher.username} onChange={e => handleTeacherChange(index, 'username', e.target.value)} />
                            <input className="border rounded px-3 py-2" placeholder="smith@faculty.com" type="email" value={teacher.email} onChange={e => handleTeacherChange(index, 'email', e.target.value)} />
                            <select className="border rounded px-3 py-2" value={teacher.level} onChange={e => handleTeacherChange(index, 'level', e.target.value)}>
                                <option value="1">Level 1</option>
                                <option value="2">Level 2</option>
                                <option value="3">Level 3</option>
                            </select>
                            <div>
                                <button onClick={() => handleRemoveTeacherRow(index)} className="bg-rose-100 text-rose-600 px-3 py-1.5 rounded hover:bg-rose-200">Remove</button>
                            </div>
                        </div>
                    ))}
                    
                    <div className="flex gap-4 mt-6">
                        <button onClick={handleAddTeacherRow} className="bg-gray-100 px-6 py-2 rounded-xl hover:bg-gray-200 font-medium">+ Add Teacher</button>
                        <button onClick={submitBulkTeachers} disabled={loading} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-medium shadow hover:shadow-lg">{loading ? 'Uploading...' : 'Submit Teaching Staff'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CollegeHeadDashboard;
