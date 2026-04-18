import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../hooks/useToast';

const AttendanceModule = ({ user }) => {
    const toast = useToast();
    const authHeader = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

    const [colleges, setColleges] = useState([]);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedCollegeId, setSelectedCollegeId] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Dynamic Attendance State
    // Format: { [studentId]: true/false }
    const [attendanceMap, setAttendanceMap] = useState({});

    // Fetch initial lookups based on role
    useEffect(() => {
        const init = async () => {
            try {
                if (user.role === 'Admin' || user.role === 'Manager') {
                    const colRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/academic/accessible-colleges`, authHeader);
                    setColleges(colRes.data.data);
                    if (colRes.data.data.length > 0) setSelectedCollegeId(colRes.data.data[0]._id);
                } else {
                    // Principal or Teacher: locked to single college
                    setSelectedCollegeId(user.collegeId);
                }
            } catch (err) {
                toast.error("Failed to load initial data");
            }
        };
        init();
    }, [user.role, user.collegeId]);

    // Fetch Classes whenever college changes
    useEffect(() => {
        if (!selectedCollegeId) toast.error("Please select a college");;
        const fetchClasses = async () => {
            try {
                const clsRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/academic/classes`, authHeader);
                const filteredClasses = clsRes.data.data.filter(c => String(c.collegeId?._id || c.collegeId) === String(selectedCollegeId));
                setClasses(filteredClasses);
                if (filteredClasses.length > 0) setSelectedClassId(filteredClasses[0]._id);
                else { setSelectedClassId(''); setStudents([]); }
            } catch (err) {
                console.error(err);
            }
        };
        fetchClasses();
    }, [selectedCollegeId]);

    useEffect(() => {
        if (!selectedClassId || !selectedDate) return;
        const fetchStudents = async () => {
            setLoading(true);
            try {
                // Fetch students of this class
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/academic/students`, authHeader);
                const classStudents = res.data.data.filter(s => String(s.class?._id || s.class) === String(selectedClassId));
                setStudents(classStudents);

                // Default all to Present on load
                const initialMap = {};
                classStudents.forEach(s => initialMap[s._id] = true);

                // Fetch attendance for the specific date
                const attRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/academic/attendance/query?classId=${selectedClassId}&date=${selectedDate}`, authHeader);
                if (attRes.data.data && attRes.data.data.length > 0) {
                    attRes.data.data.forEach(att => {
                        initialMap[att.studentId] = att.status === 'Present';
                    });
                }
                setAttendanceMap(initialMap);
            } catch (err) {
                toast.error("Failed to load students");
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [selectedClassId, selectedDate]);

    const handleCheckboxToggle = (studentId) => {
        setAttendanceMap(prev => ({ ...prev, [studentId]: !prev[studentId] }));
    };

    const handleSaveAttendance = async () => {
        setSaving(true);
        try {
            const payload = {
                classId: selectedClassId,
                date: selectedDate,
                records: students.map(s => ({
                    studentId: s._id,
                    status: attendanceMap[s._id] ? 'Present' : 'Absent'
                }))
            };
            await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/academic/attendance/mark`, payload, authHeader);
            toast.success("Attendance saved successfully!");
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to save attendance");
        } finally {
            setSaving(false);
        }
    };
    console.log("classes>>>>>>> ", classes)

    return (
        <div className="max-w-[1305px] mx-auto px-6 py-10 w-full animate-in fade-in duration-500 bg-[#FDFCF0] min-h-screen">
            {/* <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">Daily Attendance Dashboard</h1> */}

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                {(user.role === 'Admin' || user.role === 'Manager') && (
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-600">Select College</label>
                        <select className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-500" value={selectedCollegeId} onChange={e => setSelectedCollegeId(e.target.value)}>
                            {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-600">Select Class</label>
                    <select className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-500" value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
                        {classes.length === 0 && <option value="">No Classes Found</option>}
                        {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-600">Select Date</label>
                    <input type="date" className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-500" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Student Roll Call</h2>
                    <button onClick={handleSaveAttendance} disabled={saving || students.length === 0} className="bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-indigo-700 transition shadow-md disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save Attendance'}
                    </button>
                </div>

                {loading ? (
                    <div className="py-10 text-center font-semibold text-gray-500">Loading student roster...</div>
                ) : students.length === 0 ? (
                    <div className="py-10 text-center font-semibold text-gray-500">Please select a valid Class and College.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-gray-100 bg-gray-50">
                                    <th className="py-4 px-4 font-bold text-gray-500 rounded-tl-xl border-y border-l">Student Name</th>
                                    <th className="py-4 px-4 font-bold text-gray-500 border-y">Roll No.</th>
                                    <th className="py-4 px-4 font-bold text-gray-500 border-y">Email</th>
                                    <th className="py-4 px-4 font-bold text-gray-500 rounded-tr-xl border-y border-r text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((s, i) => (
                                    <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="py-4 px-4 font-bold">{s.user?.username || 'Unknown'}</td>
                                        <td className="py-4 px-4 text-gray-500">{s.roll_number}</td>
                                        <td className="py-4 px-4 text-gray-500">{s.user?.email || 'N/A'}</td>
                                        <td className="py-4 px-4 text-center">
                                            <button
                                                onClick={() => handleCheckboxToggle(s._id)}
                                                className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-colors ${attendanceMap[s._id] ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                                            >
                                                {attendanceMap[s._id] ? 'Present' : 'Absent'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceModule;
