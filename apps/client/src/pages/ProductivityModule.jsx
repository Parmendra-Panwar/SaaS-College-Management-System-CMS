import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import academicService from '@services/academicService';
import { fetchLookups } from '@store/slices/lookupSlice';
import { useToast } from '@hooks/useToast';
import { SelectField } from '@components/ui';
import DataTable from '@components/DataTable';

const STUDENT_FACTS = [
    "A shining star, exceeding expectations in both attendance and reports.",
    "Shows remarkable consistency, turning in work like clockwork.",
    "A model student with impeccable attendance and dedication.",
    "Top-tier performance, clearly prioritizes academic responsibilities.",
    "Strong attendance, but missing a few recent reports.",
    "Solid effort overall, keeping up with the class pace nicely.",
    "Good standing, though occasional absences have been noted.",
    "Maintaining a steady streak, keep up the good work!",
    "Average attendance, could benefit from more consistent participation.",
    "Missing some reports, which is impacting the overall score.",
    "Attendance is decent, but report submissions need attention.",
    "Showing potential, just needs a bit more focus on deadlines.",
    "Falling behind on reports, a quick catch-up is recommended.",
    "Attendance is slipping, causing a drop in productivity.",
    "Needs to prioritize report submissions to improve standing.",
    "A bit inconsistent recently, but has room to recover.",
    "Struggling with attendance, which affects learning outcomes.",
    "Multiple missing reports indicate a need for better time management.",
    "At risk due to low attendance and missing assignments.",
    "Needs immediate intervention to get back on track.",
    "Significant absences recorded; please reach out for support.",
    "Critical lack of reports submitted this session.",
    "Requires a parent-teacher meeting to discuss productivity.",
    "Severely falling behind, immediate action required."
];

const getFactForScore = (score) => {
    // Distribute the 24 facts across the 0-100 score range
    // High score -> early index, Low score -> late index
    if (score >= 100) return STUDENT_FACTS[0];
    const index = Math.floor(((100 - score) / 100) * (STUDENT_FACTS.length - 1));
    return STUDENT_FACTS[Math.max(0, Math.min(index, STUDENT_FACTS.length - 1))];
};

const getScoreColor = (score) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (score >= 50) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-rose-100 text-rose-800 border-rose-200';
};

const ProductivityModule = ({ user }) => {
    const toast = useToast();
    const dispatch = useDispatch();
    const { classes: globalClasses, accessibleColleges, loaded: lookupsLoaded } = useSelector(state => state.lookup);

    const [selectedCollegeId, setSelectedCollegeId] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [productivityData, setProductivityData] = useState([]);

    useEffect(() => {
        if (!lookupsLoaded) dispatch(fetchLookups());
    }, [dispatch, lookupsLoaded]);

    useEffect(() => {
        if (selectedCollegeId) dispatch(fetchLookups(selectedCollegeId));
    }, [dispatch, selectedCollegeId]);

    useEffect(() => {
        if (!lookupsLoaded) return;
        if (accessibleColleges?.length > 0 && !selectedCollegeId) {
            setSelectedCollegeId(accessibleColleges[0]._id);
        }
    }, [lookupsLoaded, accessibleColleges]);

    const derivedClasses = React.useMemo(() => {
        if (!selectedCollegeId || !globalClasses) return [];
        return globalClasses?.filter(c => String(c.collegeId?._id || c.collegeId) === String(selectedCollegeId));
    }, [selectedCollegeId, globalClasses]);

    useEffect(() => {
        if (derivedClasses.length > 0) {
            if (!derivedClasses.find(c => c._id === selectedClassId)) {
                setSelectedClassId(derivedClasses[0]._id);
            }
        } else {
            setSelectedClassId('');
            setProductivityData([]);
        }
    }, [derivedClasses]);

    useEffect(() => {
        if (!selectedClassId) return;
        const fetchProductivity = async () => {
            setLoading(true);
            try {
                const res = await academicService.getProductivityByClass(selectedClassId);
                setProductivityData(res.data.data || []);
            } catch (err) {
                toast.error("Failed to load productivity data");
            } finally {
                setLoading(false);
            }
        };
        fetchProductivity();
    }, [selectedClassId]);

    const columns = [
        { header: 'Student Name', accessor: s => s.name },
        { header: 'Roll No.', accessor: s => s.roll_number },
        { 
            header: 'Productivity Score', 
            accessor: s => (
                <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold border ${getScoreColor(s.score)}`}>
                    {s.score}%
                </div>
            ) 
        },
        { 
            header: 'Student Fact', 
            accessor: s => (
                <span className="text-gray-600 italic text-sm">
                    "{getFactForScore(s.score)}"
                </span>
            ) 
        },
        {
            header: 'Details',
            accessor: s => (
                <div className="text-xs text-gray-500">
                    <div>Att: {s.actualDaysPresent}/{s.totalDaysElapsed}</div>
                    <div>Rep: {s.actualReports}/{s.expectedReports}</div>
                </div>
            )
        }
    ];

    return (
        <div className="max-w-[1305px] mx-auto px-6 py-10 w-full animate-in fade-in duration-500 bg-[#FDFCF0] min-h-screen">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {(user.role === 'Admin' || user.role === 'Manager') && (
                    <SelectField label="Select College" value={selectedCollegeId} onChange={e => setSelectedCollegeId(e.target.value)}>
                        {accessibleColleges?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </SelectField>
                )}
                <SelectField label="Select Class" value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
                    {derivedClasses.length === 0 && <option value="">No Classes Found</option>}
                    {derivedClasses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </SelectField>
            </div>

            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/50">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-2xl font-extrabold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        Class Productivity Dashboard
                    </h2>
                </div>

                {loading ? (
                    <div className="py-10 text-center font-semibold text-gray-500 animate-pulse">Calculating productivity metrics...</div>
                ) : productivityData.length === 0 ? (
                    <div className="py-10 text-center font-semibold text-gray-500">No data available for this class.</div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm bg-white">
                        <DataTable columns={columns} data={productivityData} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductivityModule;
