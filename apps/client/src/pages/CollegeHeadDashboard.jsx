import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../hooks/useToast';

const CollegeHeadDashboard = ({ activeMainTab }) => {
    const toast = useToast();
    const authHeader = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

    const [loading, setLoading] = useState(false);
    const [dataList, setDataList] = useState([]);
    const [pageMode, setPageMode] = useState('list'); // 'list', 'create', 'edit'
    const [editingId, setEditingId] = useState(null);

    // Form fields specific to active tab
    const [formDept, setFormDept] = useState({ name: '', description: '', classes: [] });
    const [formClass, setFormClass] = useState({ name: '', departmentId: '' });
    const [formTeacher, setFormTeacher] = useState({ username: '', email: '', level: '1' });
    const [formStudent, setFormStudent] = useState({ username: '', email: '', roll_number: '', class: '' });

    // Lookup contexts for dropdowns
    const [departments, setDepartments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [selectedCollegeId, setSelectedCollegeId] = useState('');

    const fetchLookups = async () => {
        try {
            const [deptRes, clsRes, colRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/academic/departments`, authHeader),
                axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/academic/classes`, authHeader),
                axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/academic/accessible-colleges`, authHeader),
            ]);
            setDepartments(deptRes.data.data);
            setClasses(clsRes.data.data);
            setColleges(colRes.data.data);
            if (colRes.data.data.length > 0 && !selectedCollegeId) {
                setSelectedCollegeId(colRes.data.data[0]._id);
            }
        } catch (e) { console.error("Failed to fetch lookups", e); }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/academic/${activeMainTab}`, authHeader);
            setDataList(res.data.data || []);
        } catch (e) {
            toast.error("Failed to fetch data");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLookups();
    }, []);

    useEffect(() => {
        if (activeMainTab) {
            setPageMode('list');
            setEditingId(null);
            fetchData();
        }
    }, [activeMainTab]);

    const handleDeptClassChange = (e) => {
        const options = e.target.options;
        const selectedValues = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }
        setFormDept({...formDept, classes: selectedValues});
    };

    const handleEditBtn = (item) => {
        setEditingId(item._id);
        setPageMode('edit');
        if (activeMainTab === 'departments') {
            setSelectedCollegeId(item.collegeId?._id || item.collegeId);
            const classIds = classes.filter(c => c.departmentId && (c.departmentId._id === item._id || c.departmentId === item._id)).map(c => c._id);
            setFormDept({ name: item.name, description: item.description, classes: item.classes?.map(c => c._id || c) || classIds });
        }
        else if (activeMainTab === 'classes') {
            setSelectedCollegeId(item.collegeId?._id || item.collegeId);
            setFormClass({ name: item.name, departmentId: item.departmentId?._id || item.departmentId || '' });
        }
        else if (activeMainTab === 'teachers') {
            setSelectedCollegeId(item.collegeId?._id || item.collegeId);
            setFormTeacher({ username: item.user?.username || '', email: item.user?.email || '', level: item.level || '1' });
        }
        else if (activeMainTab === 'students') {
            setSelectedCollegeId(item.collegeId?._id || item.collegeId);
            setFormStudent({ username: item.user?.username || '', email: item.user?.email || '', roll_number: item.roll_number || '', class: item.class?._id || item.class || '' });
        }
    };

    const handleSubmitSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let payload = {};
            if (activeMainTab === 'departments') payload = { ...formDept, collegeId: selectedCollegeId };
            else if (activeMainTab === 'classes') payload = { ...formClass, collegeId: selectedCollegeId };
            else if (activeMainTab === 'teachers') payload = { ...formTeacher, collegeId: selectedCollegeId };
            else if (activeMainTab === 'students') payload = { ...formStudent, collegeId: selectedCollegeId };

            if (pageMode === 'edit') {
                await axios.put(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/academic/${activeMainTab}/${editingId}`, payload, authHeader);
                toast.success("Updated successfully");
            } else {
                await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/academic/${activeMainTab}`, payload, authHeader);
                toast.success("Created successfully");
            }
            
            setPageMode('list');
            setEditingId(null);
            fetchData();

            // Reset forms
            setFormDept({ name: '', description: '', classes: [] });
            setFormClass({ name: '', departmentId: '' });
            setFormTeacher({ username: '', email: '', level: '1' });
            setFormStudent({ username: '', email: '', roll_number: '', class: '' });

            if (activeMainTab === 'departments' || activeMainTab === 'classes') fetchLookups();
        } catch (err) {
            toast.error(err.response?.data?.error || "Operation failed");
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this record?")) return;
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/academic/${activeMainTab}/${id}`, authHeader);
            toast.success("Deleted");
            fetchData();
            if (activeMainTab === 'departments' || activeMainTab === 'classes') fetchLookups();
        } catch (e) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="max-w-[1305px] mx-auto px-6 py-10 w-full animate-in fade-in duration-500 bg-[#FDFCF0] min-h-screen">
            {/* <h1 className="text-2xl font-extrabold text-gray-900 mb-6 border-b pb-4">Academic Administration</h1> */}

            {/* Top Metric Cards */}
            {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
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
            </div> */}

            <div className="flex gap-4 mb-6">
                <button onClick={() => { setPageMode('list'); setEditingId(null); }} className={`px-5 py-2 font-bold rounded-xl transition ${pageMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>All Records</button>
                <button onClick={() => { setPageMode('create'); setEditingId(null); 
                    setFormDept({ name: '', description: '', classes: [] });
                    setFormClass({ name: '', departmentId: '' });
                    setFormTeacher({ username: '', email: '', level: '1' });
                    setFormStudent({ username: '', email: '', roll_number: '', class: '' });
                }} className={`px-5 py-2 font-bold rounded-xl transition ${pageMode === 'create' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>+ Create New</button>
            </div>

            {(pageMode === 'create' || pageMode === 'edit') && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-10 animate-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold capitalize">{pageMode === 'edit' ? 'Edit' : 'Create New'} {activeMainTab?.slice(0, -1)}</h2>
                    {colleges.length > 1 && pageMode === 'create' && (
                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                            <label className="text-sm font-bold text-gray-500 whitespace-nowrap">Target College:</label>
                            <select
                                className="bg-transparent text-sm font-semibold text-indigo-700 outline-none cursor-pointer"
                                value={selectedCollegeId}
                                onChange={e => setSelectedCollegeId(e.target.value)}
                            >
                                {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmitSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">

                    {activeMainTab === 'departments' && (
                        <>
                            <div className="col-span-1"><label className="block text-sm font-semibold text-gray-700 mb-1">Dept Name</label><input required className="w-full border px-4 py-2 rounded-xl" value={formDept.name} onChange={e => setFormDept({ ...formDept, name: e.target.value })} /></div>
                            <div className="col-span-1"><label className="block text-sm font-semibold text-gray-700 mb-1">Description</label><input className="w-full border px-4 py-2 rounded-xl" value={formDept.description} onChange={e => setFormDept({ ...formDept, description: e.target.value })} /></div>
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Assign Classes (Multiple)</label>
                                <select multiple className="w-full border px-4 py-2 rounded-xl h-24" value={formDept.classes} onChange={handleDeptClassChange}>
                                    {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                                <p className="text-xs text-gray-400 mt-1">Hold CTRL/CMD to select multiple classes.</p>
                            </div>
                        </>
                    )}

                    {activeMainTab === 'classes' && (
                        <>
                            <div className="col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-1">Class Name</label><input required className="w-full border px-4 py-2 rounded-xl" value={formClass.name} onChange={e => setFormClass({ ...formClass, name: e.target.value })} /></div>
                            <div className="col-span-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Department (Optional)</label>
                                <select className="w-full border px-4 py-2 rounded-xl" value={formClass.departmentId} onChange={e => setFormClass({ ...formClass, departmentId: e.target.value })}>
                                    <option value="">None</option>
                                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    {activeMainTab === 'teachers' && (
                        <>
                            <div className="col-span-1"><label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label><input required className="w-full border px-4 py-2 rounded-xl" value={formTeacher.username} onChange={e => setFormTeacher({ ...formTeacher, username: e.target.value })} /></div>
                            <div className="col-span-1"><label className="block text-sm font-semibold text-gray-700 mb-1">Email</label><input required type="email" className="w-full border px-4 py-2 rounded-xl" value={formTeacher.email} onChange={e => setFormTeacher({ ...formTeacher, email: e.target.value })} /></div>
                            <div className="col-span-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Level</label>
                                <select className="w-full border px-4 py-2 rounded-xl" value={formTeacher.level} onChange={e => setFormTeacher({ ...formTeacher, level: e.target.value })}>
                                    <option value="1">Level 1</option><option value="2">Level 2</option><option value="3">Level 3</option>
                                </select>
                            </div>
                        </>
                    )}

                    {activeMainTab === 'students' && (
                        <>
                            <div className="col-span-1"><label className="block text-sm font-semibold text-gray-700 mb-1">Name</label><input required className="w-full border px-4 py-2 rounded-xl" value={formStudent.username} onChange={e => setFormStudent({ ...formStudent, username: e.target.value })} /></div>
                            <div className="col-span-1"><label className="block text-sm font-semibold text-gray-700 mb-1">Email</label><input required type="email" className="w-full border px-4 py-2 rounded-xl" value={formStudent.email} onChange={e => setFormStudent({ ...formStudent, email: e.target.value })} /></div>
                            <div className="col-span-1"><label className="block text-sm font-semibold text-gray-700 mb-1">Roll Number</label><input required className="w-full border px-4 py-2 rounded-xl" value={formStudent.roll_number} onChange={e => setFormStudent({ ...formStudent, roll_number: e.target.value })} /></div>
                            <div className="col-span-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Class (Must Select)</label>
                                <select required className="w-full border px-4 py-2 rounded-xl" value={formStudent.class} onChange={e => setFormStudent({ ...formStudent, class: e.target.value })}>
                                    <option value="">Select Class</option>
                                    {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    <div className="col-span-1 md:col-span-4 mt-4 flex gap-3">
                        <button type="submit" disabled={loading} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition w-full md:w-auto shadow-md">
                            {loading ? 'Processing...' : pageMode === 'edit' ? `Update ${activeMainTab?.slice(0, -1)}` : `Create ${activeMainTab?.slice(0, -1)}`}
                        </button>
                        {pageMode === 'edit' && (
                            <button type="button" onClick={() => { setPageMode('list'); setEditingId(null); }} className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
            )}

            {pageMode === 'list' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-in slide-in-from-bottom-4">
                <h2 className="text-xl font-bold mb-6 capitalize">{activeMainTab} Directory</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-gray-100">
                                {activeMainTab === 'departments' && <><th className="pb-3">Name</th><th className="pb-3">Description</th></>}
                                {activeMainTab === 'classes' && <><th className="pb-3">Name</th><th className="pb-3">Department</th></>}
                                {activeMainTab === 'teachers' && <><th className="pb-3">Name</th><th className="pb-3">Email</th><th className="pb-3">Level</th><th className="pb-3 text-red-600">Password</th></>}
                                {activeMainTab === 'students' && <><th className="pb-3">Name</th><th className="pb-3">Roll Number</th><th className="pb-3">Email</th><th className="pb-3">Class</th></>}
                                <th className="pb-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataList.map(item => (
                                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50">
                                    {activeMainTab === 'departments' && <><td className="py-4 font-bold">{item.name}</td><td className="py-4 text-gray-500">{item.description}</td></>}

                                    {activeMainTab === 'classes' && <><td className="py-4 font-bold">{item.name}</td><td className="py-4">{item.departmentId?.name || 'N/A'}</td></>}

                                    {activeMainTab === 'teachers' && (
                                        <>
                                            <td className="py-4 font-bold">{item.user?.username}</td>
                                            <td className="py-4 text-gray-500">{item.user?.email}</td>
                                            <td className="py-4">{item.level}</td>
                                            <td className="py-4 font-mono text-sm text-red-600">{item.user?.tempPassword || '***'}</td>
                                        </>
                                    )}

                                    {activeMainTab === 'students' && (
                                        <>
                                            <td className="py-4 font-bold">{item.user?.username}</td>
                                            <td className="py-4">{item.roll_number}</td>
                                            <td className="py-4 text-gray-500">{item.user?.email}</td>
                                            <td className="py-4">{item.class?.name || 'N/A'}</td>
                                        </>
                                    )}

                                    <td className="py-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditBtn(item)} className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-bold">Edit</button>
                                            <button onClick={() => handleDelete(item._id)} className="text-sm bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-100 font-bold">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {dataList.length === 0 && <tr><td colSpan="5" className="py-8 text-center text-gray-500">No {activeMainTab} found. Create one above!</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            )}
        </div>
    );
};
export default CollegeHeadDashboard;
