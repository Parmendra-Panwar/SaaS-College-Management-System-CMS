import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../hooks/useToast';

const SuperAdminDashboard = () => {
    const toast = useToast();
    const [activeTab, setActiveTab] = useState('colleges');
    const [colleges, setColleges] = useState([]);
    const [managers, setManagers] = useState([]);
    const [requests, setRequests] = useState([]);
    
    // Form States
    const [formData, setFormData] = useState({ name: '', principalName: '', principalEmail: '' });
    const [managerForm, setManagerForm] = useState({ username: '', email: '', assignedColleges: [] });
    const [loading, setLoading] = useState(false);
    
    const authHeader = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }};

    useEffect(() => {
        if (activeTab === 'colleges') fetchColleges();
        if (activeTab === 'managers') fetchManagers();
        if (activeTab === 'requests') fetchRequests();
    }, [activeTab]);

    const fetchColleges = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/base/superadmin/colleges`, authHeader);
            setColleges(res.data.data);
        } catch (error) { toast.error("Failed to load colleges"); }
    };

    const fetchManagers = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/base/superadmin/managers`, authHeader);
            setManagers(res.data.data);
        } catch (error) { toast.error("Failed to load managers"); }
    };

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/base/superadmin/college-requests`, authHeader);
            setRequests(res.data.data);
        } catch (error) { toast.error("Failed to load requests"); }
    };

    const handleOnboard = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/base/superadmin/onboard-college`, formData, authHeader);
            toast.success("College onboarded and Principle credentials generated!");
            setFormData({ name: '', principalName: '', principalEmail: '' });
            fetchColleges();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to onboard college");
        } finally { setLoading(false); }
    };

    const handleCreateManager = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/base/superadmin/create-manager`, managerForm, authHeader);
            toast.success("Manager created successfully!");
            setManagerForm({ username: '', email: '', assignedColleges: [] });
            fetchManagers();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to create manager");
        } finally { setLoading(false); }
    };

    const handleDeleteManager = async (id) => {
        if(!window.confirm('Are you sure?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/base/superadmin/manager/${id}`, authHeader);
            toast.success("Manager deleted");
            fetchManagers();
        } catch (err) { toast.error("Failed to delete"); }
    };

    const handleApproveRequest = async (id) => {
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/base/superadmin/college-requests/${id}/approve`, {}, authHeader);
            toast.success("Request approved and College created!");
            fetchRequests();
        } catch (err) { toast.error("Failed to approve"); }
    };

    return (
        <div className="max-w-[1305px] mx-auto px-6 py-10 w-full animate-in fade-in duration-500 bg-[#FDFCF0] min-h-screen">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b pb-4">Admin Command Center</h1>
            
            <div className="flex gap-4 mb-8">
                {['colleges', 'managers', 'requests'].map(tab => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 rounded-xl font-bold uppercase tracking-wide text-sm transition-all duration-300 ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        {tab} {tab === 'requests' && requests.length > 0 && <span className="ml-2 bg-rose-500 text-white px-2 py-0.5 rounded-full text-xs">{requests.length}</span>}
                    </button>
                ))}
            </div>

            {activeTab === 'colleges' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Onboard Direct Institute</h2>
                        <form onSubmit={handleOnboard} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">College Name</label>
                                <input required type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Principal Full Name</label>
                                <input required type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500" value={formData.principalName} onChange={e => setFormData({...formData, principalName: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Principal Email</label>
                                <input required type="email" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500" value={formData.principalEmail} onChange={e => setFormData({...formData, principalEmail: e.target.value})} />
                            </div>
                            <button disabled={loading} type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md">
                                {loading ? "Generating..." : "Onboard Institute & Generate Credentials"}
                            </button>
                        </form>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Institutes Index</h2>
                        <div className="overflow-y-auto max-h-[500px] space-y-4 pr-2">
                            {colleges.map(c => (
                                <div key={c._id} className="border border-gray-100 bg-gray-50 p-5 rounded-2xl flex flex-col gap-3 hover:shadow-md transition">
                                    <h3 className="font-extrabold text-xl text-indigo-900">{c.name}</h3>
                                    {c.principalAuth ? (
                                        <div className="bg-white p-4 rounded-xl text-sm font-mono text-gray-700 border border-gray-100">
                                            <p className="mb-1"><span className="text-gray-400">Principal:</span> {c.principalAuth.username}</p>
                                            <p className="mb-1"><span className="text-gray-400">Email:</span> {c.principalAuth.email}</p>
                                            <p><span className="text-gray-400">Temp Pass:</span> <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">{c.principalAuth.password}</span></p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">No Principal Assigned</p>
                                    )}
                                </div>
                            ))}
                            {colleges.length === 0 && <p className="text-gray-400 text-md italic p-4 text-center">No colleges onboarded yet.</p>}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'managers' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="md:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Manager</h2>
                        <form onSubmit={handleCreateManager} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Manager Name</label>
                                <input required type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500" value={managerForm.username} onChange={e => setManagerForm({...managerForm, username: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Manager Email</label>
                                <input required type="email" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500" value={managerForm.email} onChange={e => setManagerForm({...managerForm, email: e.target.value})} />
                            </div>
                            {/* In a real app we'd multi-select colleges here */}
                            <button disabled={loading} type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition shadow-md mt-4">
                                Create Manager
                            </button>
                        </form>
                    </div>

                    <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 w-full overflow-x-auto">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Manager Directory</h2>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-100">
                                    <th className="pb-3 text-gray-500 font-semibold">Name</th>
                                    <th className="pb-3 text-gray-500 font-semibold">Email</th>
                                    <th className="pb-3 text-gray-500 font-semibold">Assigned Colleges</th>
                                    <th className="pb-3 text-gray-500 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {managers.map(m => (
                                    <tr key={m._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="py-4 font-bold">{m.username}</td>
                                        <td className="py-4 text-gray-600">{m.email}</td>
                                        <td className="py-4 text-sm"><span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">{m.assignedColleges?.length || 0} colleges</span></td>
                                        <td className="py-4">
                                            <button onClick={() => handleDeleteManager(m._id)} className="text-sm bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-200 font-bold">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                                {managers.length === 0 && <tr><td colSpan="4" className="text-center py-6 text-gray-400 italic">No managers found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'requests' && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Pending College Requests</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {requests.map(req => (
                            <div key={req._id} className="border border-gray-200 bg-white p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-extrabold text-2xl text-indigo-900">{req.collegeName}</h3>
                                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">{req.status}</span>
                                    </div>
                                    <p className="text-gray-600 mb-1"><span className="font-semibold text-gray-800">Principal:</span> {req.principalName}</p>
                                    <p className="text-gray-600 mb-1"><span className="font-semibold text-gray-800">Email:</span> {req.principalEmail}</p>
                                    <p className="text-gray-600"><span className="font-semibold text-gray-800">Contact:</span> {req.contactNumber || 'N/A'}</p>
                                </div>
                                <div className="mt-6">
                                    <button onClick={() => handleApproveRequest(req._id)} className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition">
                                        Approve & Onboard
                                    </button>
                                </div>
                            </div>
                        ))}
                        {requests.length === 0 && <div className="col-span-full p-10 text-center text-gray-400 italic text-xl">No pending requests at the moment.</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
