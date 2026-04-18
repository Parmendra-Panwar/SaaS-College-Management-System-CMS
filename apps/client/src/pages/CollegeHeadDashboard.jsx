import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../hooks/useToast';

const CollegeHeadDashboard = () => {
    const toast = useToast();
    const authHeader = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

    const [activeMainTab, setActiveMainTab] = useState('students'); // 'students', 'teachers'
    const [actionTab, setActionTab] = useState('create'); // 'create', 'edit', 'delete'

    const [studentsData, setStudentsData] = useState([{ id: 'mock1', username: '', email: '', enrollmentNumber: '', classId: '', departmentId: '' }]);
    const [teachersData, setTeachersData] = useState([{ id: 'mock1', username: '', email: '', level: '1', departmentId: '' }]);
    
    // For delete/edit bulk mock IDs
    const [mockList, setMockList] = useState([{ id: 'id1', name: 'John Doe', email: 'john@c.com', ext: 'CMS123' }, { id: 'id2', name: 'Jane Smith', email: 'jane@c.com', ext: 'CMS124' }]);
    const [selectedIds, setSelectedIds] = useState([]);

    const [loading, setLoading] = useState(false);

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleRowChange = (index, field, value, type) => {
        if (type === 'student') {
            const newData = [...studentsData];
            newData[index][field] = value;
            setStudentsData(newData);
        } else {
            const newData = [...teachersData];
            newData[index][field] = value;
            setTeachersData(newData);
        }
    };

    const addRow = (type) => {
        if (type === 'student') setStudentsData([...studentsData, { id: Math.random().toString(), username: '', email: '', enrollmentNumber: '', classId: '', departmentId: '' }]);
        if (type === 'teacher') setTeachersData([...teachersData, { id: Math.random().toString(), username: '', email: '', level: '1', departmentId: '' }]);
    };

    const removeRow = (index, type) => {
        if (type === 'student') setStudentsData(studentsData.filter((_, i) => i !== index));
        if (type === 'teacher') setTeachersData(teachersData.filter((_, i) => i !== index));
    };

    const submitBulk = async () => {
        setLoading(true);
        try {
            if (activeMainTab === 'students' && actionTab === 'create') {
                await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/onboarding/bulk-students`, { students: studentsData }, authHeader);
                toast.success("Students bulk created!");
                setStudentsData([{ id: 'mock1', username: '', email: '', enrollmentNumber: '', classId: '', departmentId: '' }]);
            } else if (activeMainTab === 'teachers' && actionTab === 'create') {
                await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/onboarding/bulk-teachers`, { teachers: teachersData }, authHeader);
                toast.success("Teachers bulk created!");
                setTeachersData([{ id: 'mock1', username: '', email: '', level: '1', departmentId: '' }]);
            } else if (actionTab === 'delete') {
                 // Mock delete
                 toast.success(`Successfully deleted ${selectedIds.length} records!`);
                 setSelectedIds([]);
            } else if (actionTab === 'edit') {
                 toast.success(`Successfully updated ${selectedIds.length} records!`);
                 setSelectedIds([]);
            }
        } catch (err) {
            toast.error("Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const renderActionContent = () => {
        if (actionTab === 'create') {
            const data = activeMainTab === 'students' ? studentsData : teachersData;
            return (
                <div className="overflow-x-auto min-w-[800px]">
                    <div className="grid grid-cols-6 gap-4 mb-2 font-bold text-gray-700 bg-gray-50 p-3 rounded-xl border">
                        <div>Name</div>
                        <div>Email</div>
                        {activeMainTab === 'students' ? <div>Enrollment #</div> : <div>Level</div>}
                        <div>Department</div>
                        {activeMainTab === 'students' && <div>Class ID</div>}
                        <div>Actions</div>
                    </div>
                    {data.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-6 gap-4 mb-2 items-center">
                            <input className="border rounded px-3 py-2" placeholder="Name" value={item.username} onChange={e => handleRowChange(index, 'username', e.target.value, activeMainTab === 'students' ? 'student' : 'teacher')} />
                            <input className="border rounded px-3 py-2" placeholder="Email" type="email" value={item.email} onChange={e => handleRowChange(index, 'email', e.target.value, activeMainTab === 'students' ? 'student' : 'teacher')} />
                            
                            {activeMainTab === 'students' ? (
                                <input className="border rounded px-3 py-2" placeholder="Enrol #" value={item.enrollmentNumber} onChange={e => handleRowChange(index, 'enrollmentNumber', e.target.value, 'student')} />
                            ) : (
                                <select className="border rounded px-3 py-2" value={item.level} onChange={e => handleRowChange(index, 'level', e.target.value, 'teacher')}>
                                    <option value="1">Level 1</option><option value="2">Level 2</option><option value="3">Level 3</option>
                                </select>
                            )}

                            <input className="border rounded px-3 py-2" placeholder="Dept ID" value={item.departmentId} onChange={e => handleRowChange(index, 'departmentId', e.target.value, activeMainTab === 'students' ? 'student' : 'teacher')} />
                            
                            {activeMainTab === 'students' && (
                                <input className="border rounded px-3 py-2 text-sm" placeholder="Class ID" value={item.classId} onChange={e => handleRowChange(index, 'classId', e.target.value, 'student')} />
                            )}
                            
                            <div><button onClick={() => removeRow(index, activeMainTab === 'students' ? 'student' : 'teacher')} className="bg-rose-100 text-rose-600 px-3 py-1.5 rounded hover:bg-rose-200">Remove</button></div>
                        </div>
                    ))}
                    <div className="flex gap-4 mt-6">
                        <button onClick={() => addRow(activeMainTab === 'students' ? 'student' : 'teacher')} className="bg-gray-100 px-6 py-2 rounded-xl hover:bg-gray-200 font-medium">+ Add Row</button>
                    </div>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                 <p className="text-gray-500 mb-4">Select records below to perform bulk {actionTab} operation.</p>
                 <table className="w-full border-collapse">
                     <thead>
                         <tr className="bg-gray-50 border-b">
                             <th className="p-3 text-left w-10">
                                <input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? mockList.map(m => m.id) : [])} checked={selectedIds.length === mockList.length && mockList.length > 0} />
                             </th>
                             <th className="p-3 text-left">Name</th>
                             <th className="p-3 text-left">Email</th>
                             <th className="p-3 text-left">{activeMainTab === 'students' ? 'Enrollment' : 'Info'}</th>
                         </tr>
                     </thead>
                     <tbody>
                         {mockList.map(mock => (
                             <tr key={mock.id} className="border-b hover:bg-gray-50">
                                 <td className="p-3"><input type="checkbox" checked={selectedIds.includes(mock.id)} onChange={() => toggleSelect(mock.id)} /></td>
                                 <td className="p-3 font-medium">{mock.name}</td>
                                 <td className="p-3 text-gray-500">{mock.email}</td>
                                 <td className="p-3">{mock.ext}</td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
            </div>
        );
    };

    return (
        <div className="max-w-[1305px] mx-auto px-6 py-10 w-full animate-in fade-in duration-500 bg-[#FDFCF0] min-h-screen">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6 border-b pb-4">Principal / Management Dashboard</h1>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
                    <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Total Students</span>
                    <span className="text-4xl font-extrabold text-gray-800">4,200</span>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2 border-l-4 border-l-emerald-500">
                    <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase">High Achievers</span>
                    <span className="text-4xl font-extrabold text-emerald-500">650</span>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2 border-l-4 border-l-blue-500">
                    <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Consistent</span>
                    <span className="text-4xl font-extrabold text-blue-500">3,400</span>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2 border-l-4 border-l-rose-500">
                    <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase">At-Risk</span>
                    <span className="text-4xl font-extrabold text-rose-500">150</span>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                {/* Entity Type Tabs */}
                <div className="flex border-b mb-6 border-gray-200">
                    <button onClick={() => setActiveMainTab('students')} className={`pb-3 px-6 font-bold text-lg transition-colors ${activeMainTab === 'students' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-400 hover:text-gray-700'}`}>Manage Students</button>
                    <button onClick={() => setActiveMainTab('teachers')} className={`pb-3 px-6 font-bold text-lg transition-colors ${activeMainTab === 'teachers' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-400 hover:text-gray-700'}`}>Manage Teachers</button>
                </div>

                {/* Bulk Operation Tabs */}
                <div className="flex gap-3 mb-8 bg-gray-100 p-2 rounded-xl inline-flex">
                    <button onClick={() => setActionTab('create')} className={`px-5 py-2 rounded-lg font-bold text-sm uppercase tracking-wide transition-all ${actionTab === 'create' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:bg-gray-200'}`}>Bulk Create</button>
                    <button onClick={() => setActionTab('edit')} className={`px-5 py-2 rounded-lg font-bold text-sm uppercase tracking-wide transition-all ${actionTab === 'edit' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}>Bulk Edit</button>
                    <button onClick={() => setActionTab('delete')} className={`px-5 py-2 rounded-lg font-bold text-sm uppercase tracking-wide transition-all ${actionTab === 'delete' ? 'bg-white shadow text-rose-600' : 'text-gray-500 hover:bg-gray-200'}`}>Bulk Delete</button>
                </div>

                {renderActionContent()}

                <div className="mt-8 pt-6 border-t flex justify-end">
                    <button 
                        onClick={submitBulk} 
                        disabled={loading || (actionTab !== 'create' && selectedIds.length === 0)} 
                        className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${actionTab === 'delete' ? 'bg-rose-600 hover:bg-rose-700' : actionTab === 'edit' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'} disabled:opacity-50`}
                    >
                        {loading ? 'Processing...' : `Execute Bulk ${actionTab.charAt(0).toUpperCase() + actionTab.slice(1)}`}
                    </button>
                </div>
            </div>
        </div>
    );
};
export default CollegeHeadDashboard;
