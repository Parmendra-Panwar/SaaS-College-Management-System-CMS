import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardRouter from './DashboardRouter';
import axios from 'axios';

const Home = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ collegeName: '', principalName: '', principalEmail: '', contactNumber: '' });
    const [loading, setLoading] = useState(false);

    const handleRequestDemo = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/onboarding/request-college`, formData);
            alert("Request submitted successfully! Our team will contact you.");
            setIsModalOpen(false);
            setFormData({ collegeName: '', principalName: '', principalEmail: '', contactNumber: '' });
        } catch (err) {
            alert("Failed to submit request.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    console.log(">user after > Login > ", user)
    if (user) {
        return <DashboardRouter user={user} />;
    }

    return (
        <div className="min-h-screen bg-[#FDFCF0]">
            {/* Massive Brand Statement Hero */}
            <div className="max-w-[1305px] mx-auto px-6 md:pt-16 pb-16">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <div className="flex-1 w-full relative z-10 pt-3">
                        <span className="text-indigo-600 font-extrabold tracking-widest text-[11px] mb-4 uppercase flex items-center gap-2">
                            <span className="w-6 h-[2px] bg-indigo-600 rounded-full"></span> Next-Generation Infrastructure
                        </span>
                        <h1 className="text-[42px] lg:text-[70px] font-[800] leading-[1.05] tracking-tighter text-[#222222] mb-6">
                            Scalable. <br className="hidden lg:block" /> Analytics-Driven. <br /> CMS.
                        </h1>
                        <p className="text-[#555] text-[16px] lg:text-[20px] leading-relaxed max-w-lg mb-10 font-light">
                            Empower your institution with K-Means predictive clustering, hyper-fast onboarding, and high-frequency operational tracking.
                        </p>

                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-indigo-600 text-white px-8 py-4 rounded-full shadow-[0_6px_16px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.5)] transition-all duration-300 font-bold text-[16px]"
                            >
                                Enter Dashboard
                            </button>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-white border border-gray-200 text-gray-800 px-8 py-4 rounded-full hover:bg-gray-50 transition-all duration-300 font-bold text-[16px]"
                            >
                                Request Demo
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 w-full relative">
                        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl z-10 border-8 border-white/50 backdrop-blur-md">
                            <img
                                src="https://amazingarchitecture.com/storage/files/1/Articles/building/university_of_vrginia.jpeg"
                                className="w-full h-full object-cover"
                                alt="Modern College Campus"
                            />
                            <div className="absolute bottom-6 right-6 bg-white/20 backdrop-blur-xl text-white p-4 rounded-2xl shadow-xl border border-white/10">
                                <p className="text-sm font-semibold tracking-wider uppercase drop-shadow-md">
                                    Predictive AI Powered
                                </p>
                            </div>
                        </div>
                        {/* Abstract Decorators */}
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute -top-10 -right-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl -z-10"></div>
                    </div>
                </div>
            </div>

            <div className="bg-white py-24">
                <div className="max-w-[1305px] mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Everything you need to manage your institution</h2>
                        <p className="mt-4 text-lg text-gray-500">Strict tenant isolation built right into the Mongoose level.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Feature 1 */}
                        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition">
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Tenant Core</h3>
                            <p className="text-gray-600">Gatekeeper middleware safely intercepts and injects tenant constraints to prevent cross-institution data leaks.</p>
                        </div>
                        {/* Feature 2 */}
                        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Onboarding</h3>
                            <p className="text-gray-600">Instantly provision departments, subjects, and massive student rosters via automated bulk inserts.</p>
                        </div>
                        {/* Feature 3 */}
                        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition">
                            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">AI Intelligence</h3>
                            <p className="text-gray-600">Bi-weekly K-Means jobs compute feature vectors across attendance and performance to group high-achievers and at-risk students.</p>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-gray-900">Request College Onboarding</h2>
                        <form onSubmit={handleRequestDemo} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
                                <input required type="text" value={formData.collegeName} onChange={e => setFormData({ ...formData, collegeName: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Principal Name</label>
                                <input required type="text" value={formData.principalName} onChange={e => setFormData({ ...formData, principalName: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Principal Email</label>
                                <input required type="email" value={formData.principalEmail} onChange={e => setFormData({ ...formData, principalEmail: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                <input type="text" value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition">
                                {loading ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;