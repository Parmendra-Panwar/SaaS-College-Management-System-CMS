import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLookups } from '@store/slices/lookupSlice';
import academicService from '@services/academicService';
import { useToast } from '@hooks/useToast';
import DataTable from '@components/DataTable';
import PageLayout from '@components/PageLayout';
import { InputField, SelectField, PrimaryButton } from '@components/ui';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const ManageClasses = () => {
    const toast = useToast();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { accessibleColleges: colleges, departments, loaded: lookupsLoaded } = useSelector(state => state.lookup);

    const [classesData, setClassesData] = useState([]);
    const [selectedCollegeId, setSelectedCollegeId] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    // Form state
    const [formClass, setFormClass] = useState({ name: '', departmentId: '' });
    const [loading, setLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [editingItem, setEditingItem] = useState(null);

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

    // Clear department if college changes
    useEffect(() => {
        if (!editingItem) {
            setFormClass(prev => ({ ...prev, departmentId: '' }));
        }
    }, [selectedCollegeId]);

    const fetchClasses = async (collegeId) => {
        if (!collegeId && isMultiCollegeRole) return;
        setIsFetchingData(true);
        try {
            const res = await academicService.getEntities('classes', collegeId);
            setClassesData(res.data.data || []);
        } catch { 
            toast.error("Failed to fetch data"); 
        } finally {
            setIsFetchingData(false);
        }
    };

    useEffect(() => {
        if (selectedCollegeId) {
            fetchClasses(selectedCollegeId);
            dispatch(fetchLookups(selectedCollegeId));
        }
    }, [selectedCollegeId, dispatch]);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this record?")) return;
        try {
            await academicService.deleteEntity('classes', id);
            toast.success("Deleted");
            fetchClasses(selectedCollegeId);
            dispatch(fetchLookups(selectedCollegeId));
        } catch { 
            toast.error("Delete failed"); 
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formClass, collegeId: selectedCollegeId };
            if (editingItem) {
                await academicService.updateEntity('classes', editingItem._id, payload);
                toast.success("Updated successfully");
            } else {
                await academicService.createEntity('classes', payload);
                toast.success("Created successfully");
            }
            fetchClasses(selectedCollegeId);
            dispatch(fetchLookups(selectedCollegeId));
            setFormClass({ name: '', departmentId: '' });
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
        setFormClass({
            name: row.name,
            departmentId: row.departmentId?._id || row.departmentId || ''
        });
        setSelectedCollegeId(row.collegeId?._id || row.collegeId || '');
        setIsFormOpen(true);
        // Scroll to top where form is
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
        setFormClass({ name: '', departmentId: '' });
        setIsFormOpen(false);
    };

    const displayData = useMemo(() => {
        if (!selectedCollegeId && isMultiCollegeRole) {
            // If "All Colleges" selected in the list filter
            return classesData;
        }
        return classesData.filter(item => String(item.collegeId?._id || item.collegeId) === String(selectedCollegeId));
    }, [classesData, selectedCollegeId, isMultiCollegeRole]);

    const filteredDepartments = useMemo(() => {
        if (!selectedCollegeId) return [];
        return departments.filter(d => String(d.collegeId?._id || d.collegeId) === String(selectedCollegeId));
    }, [departments, selectedCollegeId]);

    return (
        <PageLayout title="Manage Classes" description="Create and view your academic classes.">
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
                                {editingItem ? 'Edit Class' : 'Create New Class'}
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
                                    <div className="col-span-1 md:col-span-4">
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

                                <div className="col-span-1 md:col-span-2">
                                    <InputField 
                                        required 
                                        label="Class Name" 
                                        value={formClass.name} 
                                        onChange={e => setFormClass({ ...formClass, name: e.target.value })} 
                                        placeholder="e.g. Computer Science 101"
                                    />
                                </div>
                                
                                <div className="col-span-1 md:col-span-1">
                                    <SelectField 
                                        label="Department (Optional)" 
                                        value={formClass.departmentId} 
                                        onChange={e => setFormClass({ ...formClass, departmentId: e.target.value })}
                                    >
                                        <option value="">None</option>
                                        {filteredDepartments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                    </SelectField>
                                </div>

                                <div className="col-span-1 flex gap-3 pb-1">
                                    <PrimaryButton type="submit" loading={loading} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition w-full shadow-md flex justify-center items-center">
                                        {editingItem ? 'Update' : 'Create'}
                                    </PrimaryButton>
                                    {editingItem && (
                                        <button type="button" onClick={handleCancelEdit} className="px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition">
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
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h2 className="text-xl font-bold text-gray-800">Classes List</h2>
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
                            { header: 'Class Name', accessor: row => row.name },
                            { header: 'Department', accessor: row => row.departmentId?.name || 'N/A' },
                            ...(isMultiCollegeRole ? [{ header: 'College', accessor: row => row.collegeId?.name || 'N/A' }] : [])
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

export default ManageClasses;