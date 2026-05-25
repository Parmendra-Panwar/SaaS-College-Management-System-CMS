import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import academicService from '@services/academicService';
import { fetchLookups } from '@store/slices/lookupSlice';
import { useToast } from '@hooks/useToast';
import { SelectField, InputField } from '@components/ui';
import DataTable from '@components/DataTable';

const AttendanceModule = ({ user }) => {
    const toast = useToast();
    const authHeader = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

    const dispatch = useDispatch();
    const { classes: globalClasses, accessibleColleges, loaded: lookupsLoaded } = useSelector(state => state.lookup);

    const [students, setStudents] = useState([]);

    const [selectedCollegeId, setSelectedCollegeId] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Dynamic Attendance State
    // Format: { [studentId]: true/false }
    const [attendanceMap, setAttendanceMap] = useState({});

    // Fetch global lookups on load
    useEffect(() => {
        if (!lookupsLoaded) {
            dispatch(fetchLookups());
        }
    }, [dispatch, lookupsLoaded]);

    // Handle initial selection once lookups are loaded
    useEffect(() => {
        if (!lookupsLoaded) return;
        if (accessibleColleges?.length > 0 && !selectedCollegeId) {
            setSelectedCollegeId(accessibleColleges[0]._id);
        }
    }, [lookupsLoaded, accessibleColleges]);

    // Compute derived classes based on selected college
    const derivedClasses = React.useMemo(() => {
        if (!selectedCollegeId || !globalClasses) return [];
        return globalClasses?.filter(c => String(c.collegeId?._id || c.collegeId) === String(selectedCollegeId));
    }, [selectedCollegeId, globalClasses]);

    // Auto-select first class when derived classes change
    useEffect(() => {
        if (derivedClasses.length > 0) {
            if (!derivedClasses.find(c => c._id === selectedClassId)) {
                setSelectedClassId(derivedClasses[0]._id);
            }
        } else {
            setSelectedClassId('');
            setStudents([]);
        }
    }, [derivedClasses]);

    useEffect(() => {
        if (!selectedClassId || !selectedDate) return;
        const fetchStudents = async () => {
            setLoading(true);
            try {
                // Fetch students of this class
                const res = await academicService.getStudents(selectedCollegeId, selectedClassId);
                const classStudents = res.data.data.filter(s => String(s.class?._id || s.class) === String(selectedClassId));
                setStudents(classStudents);

                // Default all to Present on load
                const initialMap = {};
                classStudents.forEach(s => initialMap[s._id] = true);

                // Fetch attendance for the specific date
                const attRes = await academicService.getAttendanceQuery(selectedClassId, selectedDate);
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
            await academicService.markAttendance(payload);
            toast.success("Attendance saved successfully!");
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to save attendance");
        } finally {
            setSaving(false);
        }
    };
    // Removed redundant useEffect setting collegeId based on user.role

    return (
        <div className="max-w-[1305px] mx-auto px-6 py-10 w-full animate-in fade-in duration-500 bg-[#FDFCF0] min-h-screen">
            {/* <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">Daily Attendance Dashboard</h1> */}

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                {(user.role === 'Admin' || user.role === 'Manager') && (
                    <SelectField label="Select College" value={selectedCollegeId} onChange={e => setSelectedCollegeId(e.target.value)}>
                        {accessibleColleges?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </SelectField>
                )}

                <SelectField label="Select Class" value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
                    {derivedClasses.length === 0 && <option value="">No Classes Found</option>}
                    {derivedClasses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </SelectField>

                <InputField type="date" label="Select Date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
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
                    <DataTable
                        columns={[
                            { header: 'Student Name', accessor: s => s.user?.username || 'Unknown' },
                            { header: 'Roll No.', accessor: s => s.roll_number },
                            { header: 'Email', accessor: s => s.user?.email || 'N/A' },
                            {
                                header: 'Status', accessor: s => (
                                    <button
                                        onClick={() => handleCheckboxToggle(s._id)}
                                        className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-colors ${attendanceMap[s._id] ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                                    >
                                        {attendanceMap[s._id] ? 'Present' : 'Absent'}
                                    </button>
                                )
                            }
                        ]}
                        data={students}
                    />
                )}
            </div>
        </div>
    );
};

export default AttendanceModule;
