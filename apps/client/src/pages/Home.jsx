import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import onboardingService from '@services/onboardingService';
import { InputField, PrimaryButton } from '@components/ui';

const FeatureCard = ({ title, description, icon }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group">
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
);

const TechBadge = ({ children }) => (
    <span className="px-3 py-1 bg-gray-800 text-gray-300 border border-gray-700 rounded-full text-[10px] font-bold tracking-wider uppercase">
        {children}
    </span>
);

const Home = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ collegeName: '', principalName: '', principalEmail: '', contactNumber: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) navigate(`/${user.role.toLowerCase()}/dashboard`);
    }, [user, navigate]);

    const handleRequestDemo = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onboardingService.requestCollege(formData);
            alert("Demo request logged. Our team will provision your tenant.");
            setIsModalOpen(false);
        } catch {
            alert("Failed to submit request.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert(`Copied: ${text}`);
    };

    const coreFeatures = [
        {
            title: "Student Productivity",
            description: "Tracking of assignment completion and attendance to help monitor academic progress.",
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
        },
        {
            title: "Attendance Management",
            description: "Bulk attendance logging with role-based access control based on hierarchy.",
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        },
        {
            title: "Fees Management",
            description: "Automate dynamic fee structures, track outstanding balances, and generate instant clearance invoices across departments.",
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        },
        {
            title: "Role-Based Access",
            description: "Ensures secure data handling and limited access between Admins, Principals, and Teachers.",
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        },
        {
            title: "Bi-weekly Reports",
            description: "Consolidated report management system for tracking student activity and performance.",
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        },
        {
            title: "Department Routing",
            description: "Relational mapping that directs faculty to their specific departments and student cohorts.",
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        }
    ];

    return (
        <div className="min-h-screen bg-[#fafafa] font-sans selection:bg-blue-200">
            <header className="relative pt-12 pb-16 flex flex-col items-center text-center px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[300px] bg-gradient-to-b from-blue-100/60 to-transparent blur-3xl -z-10 rounded-full"></div>

                <div className="max-w-5xl mx-auto z-10 flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-800 text-[10px] font-bold uppercase tracking-widest shadow-sm mb-6 cursor-default">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Live Multi-Tenant Architecture
                    </div>

                    <h1 className="text-4xl md:text-6xl font-[900] text-gray-900 leading-[1.1] tracking-tighter mb-4">
                        The Multi-Tenant <br className="hidden md:block" /> SaaS Platform for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">College Campuses.</span>
                    </h1>

                    <p className="text-base md:text-lg text-gray-500 max-w-3xl font-medium leading-relaxed mb-8">
                        Streamline distinct departments, hierarchical role isolation, and high-volume student tracking through a unified cloud infrastructure engineered for academic scale.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button onClick={() => document.getElementById('demoAccounts').scrollIntoView({ behavior: 'smooth' })} className="bg-gray-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 shadow-md transition-all flex items-center justify-center gap-2 text-sm">
                            Explore Demo
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </button>
                        <button onClick={() => setIsModalOpen(true)} className="bg-white border border-gray-300 text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-gray-50 transition-all text-sm">
                            Onboard College
                        </button>
                    </div>
                </div>

                {/* Dashboard Mockup - Tighter spacing */}
                <div className="w-full max-w-5xl mx-auto mt-12 relative z-10 group perspective-1000">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-10 blur-2xl rounded-2xl -z-10 group-hover:opacity-20 transition-opacity duration-500"></div>

                    <div className="bg-white rounded-xl shadow-xl border border-gray-200/60 overflow-hidden">
                        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                            <div className="ml-4 flex-1 flex justify-center">
                                <div className="bg-white text-gray-400 text-[10px] font-mono py-1 px-3 rounded border border-gray-200 w-48 flex items-center justify-center gap-2">
                                    academia-erp.vercel.app
                                </div>
                            </div>
                        </div>
                        <div className="relative bg-gray-100 h-[300px] md:h-[400px]">
                            <img src="./dashboard.png" alt="Dashboard" className="w-full h-full object-cover opacity-90" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Architecture Section - Reduced Padding */}
            <section className="bg-gray-900 py-10 text-white border-y border-gray-800">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="max-w-lg">
                        <h2 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Architecture</h2>
                        <h3 className="text-2xl font-bold mb-2">Engineered for High Throughput</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Built on a scalable MERN stack utilizing tenant isolation to ensure data security across multiple institutions.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 max-w-sm justify-start md:justify-end">
                        <TechBadge>React.js</TechBadge>
                        <TechBadge>Node.js</TechBadge>
                        <TechBadge>Multi-Tenant DB</TechBadge>
                        <TechBadge>RBAC Middleware</TechBadge>
                        <TechBadge>REST API</TechBadge>
                    </div>
                </div>
            </section>

            {/* Features Section - Tighter Grid */}
            <section className="py-20 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Header */}
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight sm:text-5xl">
                            Complete Control
                        </h2>
                        <p className="text-base text-gray-600">
                            Every tool your faculty needs to run a data-driven campus.
                        </p>
                    </div>

                    {/* Layout Wrapper */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        {/* Left Side: Media & Context */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="overflow-hidden rounded-2xl bg-gray-100 border border-gray-200/80 shadow-sm aspect-[4/3] group">
                                <img
                                    src="./feature.jpg"
                                    alt="College Management Platform Interface"
                                    className="w-full h-full object-cover opacity-95 group-hover:scale-[1.02] transition-transform duration-300 ease-out"
                                />
                            </div>
                            <div className="space-y-3 px-2">
                                <h3 className="text-xl font-bold text-gray-900">Engineered for Academic Scale</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Our multi-tenant campus management ecosystem bridges administrative silos by integrating real-time student tracking, automated compliance reporting, and cross-department routing. Designed to sustain high-volume institutional workflows with rock-solid reliability and strict data isolation across every node.
                                </p>
                            </div>
                        </div>

                        {/* Right Side: Features Grid */}
                        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {coreFeatures.map((feature, idx) => (
                                <FeatureCard key={idx} {...feature} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Demo Section - Compact Cards */}
            <section className="bg-[#fafafa] py-16 border-t border-gray-100" id="demoAccounts">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-10 items-start">
                        <div className="lg:w-1/3">
                            <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Test the Software</h2>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                Experience the application from three different operational tiers. Credentials are pre-configured.
                            </p>
                        </div>
                        <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { role: "Super Admin", email: "admin@cms.com", pass: "cms@superAdmin45", desc: "Global tenant management." },
                                { role: "Manager", email: "sandeep@mail.com", pass: "7hxz5k9s", desc: "College-specific analytics." },
                                { role: "Principal", email: "math@math.com", pass: "8wyxhil8", desc: "College-specific analytics." },
                                { role: "Teacher", email: "geo@teacher.com", pass: "Teacher@123", desc: "Classroom attendance logs." }
                            ].map((acc) => (
                                <div key={acc.role} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{acc.role}</h3>
                                    <p className="text-xs text-gray-500 mb-4 h-8">{acc.desc}</p>
                                    <div className="space-y-1.5 mb-4 font-mono text-xs">
                                        <div onClick={() => copyToClipboard(acc.email)} className="p-2 bg-gray-50 border border-gray-100 rounded cursor-pointer hover:bg-blue-50 flex justify-between">
                                            <span className="text-gray-400">ID:</span> <span className="font-semibold text-gray-800 truncate ml-2">{acc.email}</span>
                                        </div>
                                        <div onClick={() => copyToClipboard(acc.pass)} className="p-2 bg-gray-50 border border-gray-100 rounded cursor-pointer hover:bg-blue-50 flex justify-between">
                                            <span className="text-gray-400">Pass:</span> <span className="font-semibold text-gray-800">{acc.pass}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => navigate('/login')} className="w-full py-2 bg-white border border-gray-900 text-gray-900 rounded-lg text-sm font-bold hover:bg-gray-900 hover:text-white transition">
                                        Login
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        <h2 className="text-xl font-black mb-1 text-gray-900">Request Demo.</h2>
                        <p className="text-xs text-gray-500 mb-5">Register a new college instance in the database.</p>
                        <form onSubmit={handleRequestDemo} className="space-y-3">
                            <InputField required label="Institution Name" value={formData.collegeName} onChange={e => setFormData({ ...formData, collegeName: e.target.value })} />
                            <InputField required label="Administrator Name" value={formData.principalName} onChange={e => setFormData({ ...formData, principalName: e.target.value })} />
                            <InputField required type="email" label="Admin Email" value={formData.principalEmail} onChange={e => setFormData({ ...formData, principalEmail: e.target.value })} />
                            <PrimaryButton type="submit" loading={loading} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-bold">
                                Submit
                            </PrimaryButton>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;