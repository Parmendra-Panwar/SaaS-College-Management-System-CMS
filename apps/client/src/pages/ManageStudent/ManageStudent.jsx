import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLookups } from '@store/slices/lookupSlice';
import academicService from '@services/academicService';
import { useToast } from '@hooks/useToast';
import DataTable from '@components/DataTable';
import PageLayout from '@components/PageLayout';
import { InputField, SelectField, PrimaryButton } from '@components/ui';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const ManageStudent = () => {
    const toast = useToast();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { accessibleColleges: colleges, classes, loaded: lookupsLoaded } = useSelector(state => state.lookup);

    const [studentsData, setStudentsData] = useState([]);
    const [selectedCollegeId, setSelectedCollegeId] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form state
    const [formStudent, setFormStudent] = useState({ username: '', email: '', roll_number: '' });
    const [loading, setLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [editingItem, setEditingItem] = useState(null);

    const userRole = user?.role || '';
    const isMultiCollegeRole = userRole === 'Admin' || userRole === 'Manager';

    // 1. Initial lookups load
    useEffect(() => {
        if (!lookupsLoaded) dispatch(fetchLookups());
    }, [dispatch, lookupsLoaded]);

    // 2. Select default college
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

    // 3. Fetch college specific lookups (classes) when college changes
    useEffect(() => {
        if (selectedCollegeId) {
            dispatch(fetchLookups(selectedCollegeId));
        }
    }, [selectedCollegeId, dispatch]);

    // 4. Auto-select default class when classes list updates
    useEffect(() => {
        if (classes.length > 0) {
            const classExists = classes.find(c => c._id === selectedClassId);
            if (!classExists) {
                setSelectedClassId(classes[0]._id);
            }
        } else {
            setSelectedClassId('');
        }
    }, [classes]); // eslint-disable-line react-hooks/exhaustive-deps

    // 5. Fetch students when college & class are selected
    useEffect(() => {
        if (selectedCollegeId && selectedClassId) {
            fetchStudents(selectedCollegeId, selectedClassId);
        } else if (selectedCollegeId && classes.length === 0) {
            // If there are no classes for this college, clear the students
            setStudentsData([]);
        }
    }, [selectedCollegeId, selectedClassId, classes.length]);

    const fetchStudents = async (colId, clsId) => {
        if (!colId && isMultiCollegeRole) return;
        setIsFetchingData(true);
        try {
            const res = await academicService.getStudents(colId, clsId);
            setStudentsData(res.data.data || []);
        } catch (e) {
            toast.error("Failed to fetch data");
        } finally {
            setIsFetchingData(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this student?")) return;
        try {
            await academicService.deleteEntity('students', id);
            toast.success("Deleted successfully");
            fetchStudents(selectedCollegeId, selectedClassId);
        } catch (e) {
            toast.error("Delete failed");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedClassId) {
            toast.error("Please select a class first.");
            return;
        }

        setLoading(true);
        try {
            const payload = { ...formStudent, collegeId: selectedCollegeId, class: selectedClassId };
            if (editingItem) {
                await academicService.updateEntity('students', editingItem._id, payload);
                toast.success("Updated successfully");
            } else {
                await academicService.createEntity('students', payload);
                toast.success("Created successfully");
            }
            fetchStudents(selectedCollegeId, selectedClassId);
            setFormStudent({ username: '', email: '', roll_number: '' });
            setEditingItem(null);
            if (!editingItem) {
                setIsFormOpen(false);
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Operation failed");
        }
        setLoading(false);
    };

    const openEdit = (row) => {
        setEditingItem(row);
        setFormStudent({
            username: row.user?.username || '',
            email: row.user?.email || '',
            roll_number: row.roll_number || ''
        });
        setSelectedCollegeId(row.collegeId?._id || row.collegeId || '');
        setSelectedClassId(row.class?._id || row.class || '');
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
        setFormStudent({ username: '', email: '', roll_number: '' });
        setIsFormOpen(false);
    };

    const displayData = useMemo(() => {
        // Data is already filtered by backend, but we can double check client side
        return studentsData;
    }, [studentsData]);

    return (
        <PageLayout title="Manage Students" description="Create and view students for your academic institutions.">
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
                                {editingItem ? 'Edit Student' : 'Create New Student'}
                            </h2>
                        </div>
                        {!isFormOpen && !editingItem && (
                            <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                                Click to Expand
                            </span>
                        )}
                    </div>

                    {isFormOpen && (
                        <div className="p-6 border-t border-gray-100">
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
                                {isMultiCollegeRole && (
                                    <div className="col-span-1 md:col-span-2">
                                        <SelectField
                                            label="College"
                                            value={selectedCollegeId}
                                            onChange={e => setSelectedCollegeId(e.target.value)}
                                            required
                                            disabled={!!editingItem} // Disable changing college while editing
                                        >
                                            <option value="">Select College</option>
                                            {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </SelectField>
                                    </div>
                                )}

                                <div className={`col-span-1 ${isMultiCollegeRole ? 'md:col-span-2' : 'md:col-span-4'}`}>
                                    <SelectField
                                        label="Class"
                                        value={selectedClassId}
                                        onChange={e => setSelectedClassId(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Class</option>
                                        {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </SelectField>
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <InputField
                                        required
                                        label="Username / Full Name"
                                        value={formStudent.username}
                                        onChange={e => setFormStudent({ ...formStudent, username: e.target.value })}
                                        placeholder="e.g. John Doe"
                                    />
                                </div>

                                <div className="col-span-1 md:col-span-1">
                                    <InputField
                                        type="email"
                                        required
                                        label="Email"
                                        value={formStudent.email}
                                        onChange={e => setFormStudent({ ...formStudent, email: e.target.value })}
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div className="col-span-1 md:col-span-1">
                                    <InputField
                                        required
                                        label="Roll Number"
                                        value={formStudent.roll_number}
                                        onChange={e => setFormStudent({ ...formStudent, roll_number: e.target.value })}
                                        placeholder="e.g. 101"
                                    />
                                </div>

                                <div className="col-span-1 md:col-span-4 flex gap-3 pb-1 mt-2">
                                    <PrimaryButton type="submit" loading={loading} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition w-full md:w-auto shadow-md flex justify-center items-center">
                                        {editingItem ? 'Update Student' : 'Create Student'}
                                    </PrimaryButton>
                                    {editingItem && (
                                        <button type="button" onClick={handleCancelEdit} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* List Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-6">
                        <h2 className="text-xl font-bold text-gray-800">Students Directory</h2>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
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
                            <div className="w-full sm:w-64">
                                <SelectField
                                    value={selectedClassId}
                                    onChange={e => setSelectedClassId(e.target.value)}
                                >
                                    <option value="">All Classes</option>
                                    {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </SelectField>
                            </div>
                        </div>
                    </div>

                    <DataTable
                        isLoading={isFetchingData}
                        columns={[
                            { header: 'Name', accessor: row => row.user?.username || 'N/A' },
                            { header: 'Email', accessor: row => row.user?.email || 'N/A' },
                            { header: 'Class', accessor: row => row.class?.name || 'N/A' },
                            { header: 'Roll No', accessor: row => row.roll_number || 'N/A' },
                        ]}
                        data={displayData}
                        actions={(row) => (
                            <div className="flex gap-2">
                                <button onClick={() => openEdit(row)} className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-bold transition-colors">Edit</button>
                                <button onClick={() => handleDelete(row._id)} className="text-sm bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-100 font-bold transition-colors">Delete</button>
                            </div>
                        )}
                    />
                </div>
            </div>
        </PageLayout>
    );
};

export default ManageStudent;
