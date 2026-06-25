import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLookups } from '@store/slices/lookupSlice';
import examService from '@services/examService';
import { useToast } from '@hooks/useToast';
import DataTable from '@components/DataTable';
import PageLayout from '@components/PageLayout';
import { InputField, SelectField, PrimaryButton } from '@components/ui';
import { FiChevronDown, FiChevronUp, FiArrowLeft } from 'react-icons/fi';
import UpdateMarksheetView from './UpdateMarksheetView';

const ManageMarksheet = () => {
    const toast = useToast();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { accessibleColleges: colleges, classes, subjects, loaded: lookupsLoaded } = useSelector(state => state.lookup);

    const [examsData, setExamsData] = useState([]);
    const [selectedCollegeId, setSelectedCollegeId] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    // View state
    const [selectedExam, setSelectedExam] = useState(null);

    // Form state
    const [formExam, setFormExam] = useState({ name: '', classId: '', subjectsConfig: [] });
    const [loading, setLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);

    const userRole = user?.role || '';
    const isMultiCollegeRole = userRole === 'Admin' || userRole === 'Manager';

    useEffect(() => {
        if (!lookupsLoaded) dispatch(fetchLookups());
    }, [dispatch, lookupsLoaded]);

    useEffect(() => {
        if (lookupsLoaded) {
            if (isMultiCollegeRole) {
                if (colleges.length > 0 && !selectedCollegeId) {
                    setSelectedCollegeId(colleges[0]._id);
                }
            } else {
                setSelectedCollegeId(user?.collegeId?._id || user?.collegeId || '');
            }
        }
    }, [lookupsLoaded, colleges, isMultiCollegeRole, user, selectedCollegeId]);

    const fetchExams = async (collegeId) => {
        if (!collegeId && isMultiCollegeRole) return;
        setIsFetchingData(true);
        try {
            const res = await examService.getExams(collegeId);
            setExamsData(res.data.data || []);
        } catch { 
            toast.error("Failed to fetch exams"); 
        } finally {
            setIsFetchingData(false);
        }
    };

    useEffect(() => {
        if (selectedCollegeId) {
            fetchExams(selectedCollegeId);
            dispatch(fetchLookups(selectedCollegeId));
            setFormExam(prev => ({ ...prev, classId: '', subjectsConfig: [] }));
        }
    }, [selectedCollegeId, dispatch]);

    // Handle Class Selection to build subjects config
    const handleClassChange = (e) => {
        const classId = e.target.value;
        setFormExam(prev => ({ ...prev, classId }));
        
        // Find subjects for this class
        const classSubjects = subjects.filter(s => String(s.classId?._id || s.classId) === String(classId));
        
        // Initialize subjectsConfig
        const subjectsConfig = classSubjects.map(sub => ({
            subjectId: sub._id,
            name: sub.name, // for display purposes
            maxTheory: 70, // default
            maxPractical: 30 // default
        }));

        setFormExam(prev => ({ ...prev, subjectsConfig }));
    };

    const handleConfigChange = (index, field, value) => {
        const val = Number(value) || 0;
        const newConfig = [...formExam.subjectsConfig];
        newConfig[index] = { ...newConfig[index], [field]: val };
        
        // Auto-balance to 100
        if (field === 'maxTheory') {
            newConfig[index].maxPractical = Math.max(0, 100 - val);
        } else if (field === 'maxPractical') {
            newConfig[index].maxTheory = Math.max(0, 100 - val);
        }
        
        setFormExam(prev => ({ ...prev, subjectsConfig: newConfig }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Validate config
            for (let conf of formExam.subjectsConfig) {
                if (conf.maxTheory + conf.maxPractical !== 100) {
                    toast.error(`Marks for ${conf.name} must sum to 100`);
                    setLoading(false);
                    return;
                }
            }

            const payload = { 
                name: formExam.name, 
                classId: formExam.classId, 
                subjectsConfig: formExam.subjectsConfig,
                collegeId: selectedCollegeId 
            };
            
            const res = await examService.createExam(payload);
            toast.success("Exam created and marksheets generated!");
            fetchExams(selectedCollegeId);
            setFormExam({ name: '', classId: '', subjectsConfig: [] });
            setIsFormOpen(false);
            setSelectedExam(res.data.data);
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to create exam");
        }
        setLoading(false);
    };

    const filteredClasses = useMemo(() => {
        if (!selectedCollegeId) return [];
        return classes.filter(c => String(c.collegeId?._id || c.collegeId) === String(selectedCollegeId));
    }, [classes, selectedCollegeId]);

    const displayExams = useMemo(() => {
        if (!selectedCollegeId && isMultiCollegeRole) return examsData;
        return examsData.filter(item => String(item.collegeId?._id || item.collegeId) === String(selectedCollegeId));
    }, [examsData, selectedCollegeId, isMultiCollegeRole]);

    if (selectedExam) {
        return (
            <PageLayout title={`Marksheet: ${selectedExam.name}`} description="Enter and manage marks for this exam.">
                <div className="mb-4">
                    <button 
                        onClick={() => setSelectedExam(null)} 
                        className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 transition"
                    >
                        <FiArrowLeft /> Back to Exams List
                    </button>
                </div>
                <UpdateMarksheetView exam={selectedExam} />
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Manage Marksheets" description="Create exams and manage student marks.">
            <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4">
                
                {/* Form Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div 
                        className="flex justify-between items-center cursor-pointer select-none p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsFormOpen(!isFormOpen)}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isFormOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                                {isFormOpen ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">
                                Create New Exam
                            </h2>
                        </div>
                        {!isFormOpen && (
                            <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                                Click to Expand
                            </span>
                        )}
                    </div>

                    {isFormOpen && (
                        <div className="p-6 border-t border-gray-100">
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                                {isMultiCollegeRole && (
                                    <div className="col-span-1 md:col-span-4">
                                        <SelectField 
                                            label="College" 
                                            value={selectedCollegeId} 
                                            onChange={e => setSelectedCollegeId(e.target.value)}
                                            required
                                        >
                                            <option value="">Select College</option>
                                            {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </SelectField>
                                    </div>
                                )}

                                <div className="col-span-1 md:col-span-2">
                                    <InputField 
                                        required 
                                        label="Exam Name" 
                                        value={formExam.name} 
                                        onChange={e => setFormExam({ ...formExam, name: e.target.value })} 
                                        placeholder="e.g. Midterm 2026"
                                    />
                                </div>
                                
                                <div className="col-span-1 md:col-span-2">
                                    <SelectField 
                                        required
                                        label="Class" 
                                        value={formExam.classId} 
                                        onChange={handleClassChange}
                                    >
                                        <option value="">Select a Class</option>
                                        {filteredClasses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </SelectField>
                                </div>

                                {formExam.classId && formExam.subjectsConfig.length === 0 && (
                                    <div className="col-span-1 md:col-span-4 text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
                                        No subjects found for this class. Please add subjects to the class first.
                                    </div>
                                )}

                                {formExam.subjectsConfig.length > 0 && (
                                    <div className="col-span-1 md:col-span-4 mt-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">Marks Configuration (Theory + Practical = 100)</label>
                                        <div className="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                            {formExam.subjectsConfig.map((config, idx) => (
                                                <div key={config.subjectId} className="grid grid-cols-3 gap-4 items-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                    <span className="font-medium text-gray-800">{config.name}</span>
                                                    <InputField 
                                                        type="number"
                                                        label="Max Theory"
                                                        value={config.maxTheory}
                                                        onChange={e => handleConfigChange(idx, 'maxTheory', e.target.value)}
                                                        min="0" max="100"
                                                    />
                                                    <InputField 
                                                        type="number"
                                                        label="Max Practical"
                                                        value={config.maxPractical}
                                                        onChange={e => handleConfigChange(idx, 'maxPractical', e.target.value)}
                                                        min="0" max="100"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="col-span-1 md:col-span-4 flex justify-end">
                                    <PrimaryButton type="submit" loading={loading} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md">
                                        Create Exam & Generate Marksheets
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* List Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-6">
                        <h2 className="text-xl font-bold text-gray-800">Exam List</h2>
                        {isMultiCollegeRole && (
                            <div className="w-full sm:w-64">
                                <SelectField 
                                    value={selectedCollegeId} 
                                    onChange={e => setSelectedCollegeId(e.target.value)}
                                >
                                    <option value="">All Colleges</option>
                                    {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </SelectField>
                            </div>
                        )}
                    </div>
                    
                    <DataTable
                        isLoading={isFetchingData}
                        columns={[
                            { header: 'Exam Name', accessor: row => row.name },
                            { header: 'Class', accessor: row => row.classId?.name || 'N/A' },
                            { header: 'Subjects Configured', accessor: row => `${row.subjectsConfig?.length || 0} Subjects` },
                            { header: 'Created', accessor: row => new Date(row.createdAt).toLocaleDateString() },
                        ]}
                        data={displayExams}
                        actions={(row) => (
                            <div className="flex gap-2">
                                <button onClick={() => setSelectedExam(row)} className="text-sm bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 font-bold transition-colors">
                                    Update Marksheet
                                </button>
                            </div>
                        )}
                    />
                </div>
            </div>
        </PageLayout>
    );
};

export default ManageMarksheet;
