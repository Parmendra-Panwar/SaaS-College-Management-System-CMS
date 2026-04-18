import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../hooks/useToast';

const SuperAdminDashboard = () => {
    const toast = useToast();
    const [colleges, setColleges] = useState([]);
    const [formData, setFormData] = useState({ name: '', principalName: '', principalEmail: '' });
    const [loading, setLoading] = useState(false);
    
    // Authorization header
    const authHeader = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }};

    const fetchColleges = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/base/superadmin/colleges`, authHeader);
            setColleges(res.data.data);
        } catch (error) {
            toast.error("Failed to load colleges");
        }
    };

    useEffect(() => {
        fetchColleges();
    }, []);

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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[1305px] mx-auto px-6 py-10 w-full animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Super Admin Command Center</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* ONBOARD FORM */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4">Onboard New Institute</h2>
                    <form onSubmit={handleOnboard} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
                            <input required type="text" className="w-full border rounded-xl px-4 py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Principal Full Name</label>
                            <input required type="text" className="w-full border rounded-xl px-4 py-2" value={formData.principalName} onChange={e => setFormData({...formData, principalName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Principal Email</label>
                            <input required type="email" className="w-full border rounded-xl px-4 py-2" value={formData.principalEmail} onChange={e => setFormData({...formData, principalEmail: e.target.value})} />
                        </div>
                        <button disabled={loading} type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
                            {loading ? "Generating..." : "Onboard Institute & Generate Credentials"}
                        </button>
                    </form>
                </div>

                {/* TRACK MULTIPLE COLLEGES & ID PASS */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4">Institutes Index</h2>
                    <div className="overflow-y-auto max-h-[400px] space-y-4">
                        {colleges.map(c => (
                            <div key={c._id} className="border p-4 rounded-xl flex flex-col gap-2">
                                <h3 className="font-bold text-lg">{c.name}</h3>
                                {c.principalAuth ? (
                                    <div className="bg-slate-100 p-3 rounded-lg text-sm font-mono text-gray-700">
                                        <p>Principal: {c.principalAuth.username}</p>
                                        <p>Email: {c.principalAuth.email}</p>
                                        <p>Temp Pass: <span className="text-rose-600 font-bold">{c.principalAuth.password}</span></p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400">No Principal Assigned</p>
                                )}
                            </div>
                        ))}
                        {colleges.length === 0 && <p className="text-gray-400 text-sm italic">No colleges onboarded yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SuperAdminDashboard;
