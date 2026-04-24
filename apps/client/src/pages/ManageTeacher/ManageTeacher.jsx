import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLookups } from '@store/slices/lookupSlice';
import academicService from '@services/academicService';
import { useToast } from '@hooks/useToast';
import DataTable from '@components/DataTable';
import PageLayout from '@components/PageLayout';
import { InputField, SelectField, PrimaryButton } from '@components/ui';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const ManageTeacher = () => {
    const toast = useToast();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { accessibleColleges: colleges, departments, classes, loaded: lookupsLoaded } = useSelector(state => state.lookup);

    const [teachersData, setTeachersData] = useState([]);
    const [selectedCollegeId, setSelectedCollegeId] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    // Form state
    const [formTeacher, setFormTeacher] = useState({ username: '', email: '', level: '1', departments: [], classes: [] });
    const [loading, setLoading] = useState(false);
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

    // 3. Fetch college specific lookups (departments, classes) when college changes
    useEffect(() => {
        if (selectedCollegeId) {
            dispatch(fetchLookups(selectedCollegeId));
            // Also reset the selections if college changes and we are not editing
            if (!editingItem) {
                setFormTeacher(prev => ({ ...prev, departments: [], classes: [] }));
            }
        }
    }, [selectedCollegeId, dispatch]);

    // 4. Fetch teachers when college is selected
    useEffect(() => {
        if (selectedCollegeId) {
            fetchTeachers(selectedCollegeId);
        }
    }, [selectedCollegeId]);

    const fetchTeachers = async (colId) => {
        if (!colId && isMultiCollegeRole) return;
        try {
            const res = await academicService.getTeachers(colId);
            setTeachersData(res.data.data || []);
        } catch (e) { 
            toast.error("Failed to fetch data"); 
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this teacher?")) return;
        try {
            await academicService.deleteEntity('teachers', id);
            toast.success("Deleted successfully");
            fetchTeachers(selectedCollegeId);
        } catch (e) { 
            toast.error("Delete failed"); 
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formTeacher, collegeId: selectedCollegeId };
            if (editingItem) {
                await academicService.updateEntity('teachers', editingItem._id, payload);
                toast.success("Updated successfully");
            } else {
                await academicService.createEntity('teachers', payload);
                toast.success("Created successfully");
            }
            fetchTeachers(selectedCollegeId);
            setFormTeacher({ username: '', email: '', level: '1', departments: [], classes: [] });
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
        setFormTeacher({
            username: row.user?.username || '',
            email: row.user?.email || '',
            level: row.level?.toString() || '1',
            departments: row.departments?.map(d => d._id || d) || [],
            classes: row.classes?.map(c => c._id || c) || []
        });
        setSelectedCollegeId(row.collegeId?._id || row.collegeId || '');
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
        setFormTeacher({ username: '', email: '', level: '1', departments: [], classes: [] });
        setIsFormOpen(false);
    };

    const displayData = useMemo(() => {
        // Data is already filtered by backend
        return teachersData;
    }, [teachersData]);

    return (
        <PageLayout title="Manage Teachers" description="Create and view teachers for your academic institutions.">
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
                                {editingItem ? 'Edit Teacher' : 'Create New Teacher'}
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
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                
                                <div className="col-span-1 space-y-4">
                                    {isMultiCollegeRole && (
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
                                    )}

                                    <InputField 
                                        required 
                                        label="Full Name" 
                                        value={formTeacher.username} 
                                        onChange={e => setFormTeacher({ ...formTeacher, username: e.target.value })} 
                                        placeholder="e.g. John Doe"
                                    />
                                    
                                    <InputField 
                                        type="email"
                                        required 
                                        label="Email" 
                                        value={formTeacher.email} 
                                        onChange={e => setFormTeacher({ ...formTeacher, email: e.target.value })} 
                                        placeholder="john@example.com"
                                    />

                                    <SelectField 
                                        label="Level" 
                                        value={formTeacher.level} 
                                        onChange={e => setFormTeacher({ ...formTeacher, level: e.target.value })}
                                    >
                                        <option value="1">Level 1</option>
                                        <option value="2">Level 2</option>
                                        <option value="3">Level 3</option>
                                    </SelectField>
                                </div>

                                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Assigned Departments</label>
                                        <div className="border border-gray-200 rounded-xl max-h-64 overflow-y-auto p-2 bg-gray-50/50">
                                            {departments.length === 0 ? <p className="text-sm text-gray-400 p-2">No departments found.</p> : departments.map(dept => (
                                                <label key={dept._id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition">
                                                    <input type="checkbox" className="w-4 h-4 accent-indigo-600 rounded"
                                                        checked={formTeacher.departments.includes(dept._id)}
                                                        onChange={(e) => {
                                                            const newDepts = e.target.checked
                                                                ? [...formTeacher.departments, dept._id]
                                                                : formTeacher.departments.filter(id => id !== dept._id);
                                                            setFormTeacher({ ...formTeacher, departments: newDepts });
                                                        }}
                                                    />
                                                    <span className="text-sm font-medium text-gray-800">{dept.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Assigned Classes</label>
                                        <div className="border border-gray-200 rounded-xl max-h-64 overflow-y-auto p-2 bg-gray-50/50">
                                            {classes.length === 0 ? <p className="text-sm text-gray-400 p-2">No classes found.</p> : classes.map(cls => (
                                                <label key={cls._id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition">
                                                    <input type="checkbox" className="w-4 h-4 accent-indigo-600 rounded"
                                                        checked={formTeacher.classes.includes(cls._id)}
                                                        onChange={(e) => {
                                                            const newClasses = e.target.checked
                                                                ? [...formTeacher.classes, cls._id]
                                                                : formTeacher.classes.filter(id => id !== cls._id);
                                                            setFormTeacher({ ...formTeacher, classes: newClasses });
                                                        }}
                                                    />
                                                    <span className="text-sm font-medium text-gray-800">{cls.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-3 mt-4 flex gap-3">
                                    <PrimaryButton type="submit" loading={loading} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition w-full md:w-auto shadow-md flex justify-center items-center">
                                        {editingItem ? 'Update Teacher' : 'Create Teacher'}
                                    </PrimaryButton>
                                    {editingItem && (
                                        <button type="button" onClick={handleCancelEdit} className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition">
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
                        <h2 className="text-xl font-bold text-gray-800">Teachers Directory</h2>
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
                        </div>
                    </div>
                    
                    <DataTable
                        columns={[
                            { header: 'Name', accessor: row => row.user?.username || 'N/A' },
                            { header: 'Email', accessor: row => row.user?.email || 'N/A' },
                            { header: 'Level', accessor: row => row.level || 'N/A' },
                            { header: 'Password', accessor: row => <span className="font-mono text-sm text-red-600">{row.user?.tempPassword || '***'}</span> }
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

export default ManageTeacher;
