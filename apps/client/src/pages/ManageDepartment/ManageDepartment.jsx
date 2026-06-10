import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLookups } from '@store/slices/lookupSlice';
import academicService from '@services/academicService';
import { useToast } from '@hooks/useToast';
import DataTable from '@components/DataTable';
import PageLayout from '@components/PageLayout';
import { InputField, SelectField, PrimaryButton } from '@components/ui';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const ManageDepartment = () => {
    const toast = useToast();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { accessibleColleges: colleges, loaded: lookupsLoaded } = useSelector(state => state.lookup);

    const [departmentsData, setDepartmentsData] = useState([]);
    const [selectedCollegeId, setSelectedCollegeId] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    // Form state
    const [formDept, setFormDept] = useState({ name: '', description: '' });
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

    const fetchDepartments = async (collegeId) => {
        if (!collegeId && isMultiCollegeRole) return;
        setIsFetchingData(true);
        try {
            const res = await academicService.getEntities('departments', collegeId);
            setDepartmentsData(res.data.data || []);
        } catch (e) { 
            toast.error("Failed to fetch data"); 
        } finally {
            setIsFetchingData(false);
        }
    };

    useEffect(() => {
        if (selectedCollegeId) {
            fetchDepartments(selectedCollegeId);
        }
    }, [selectedCollegeId]);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this record?")) return;
        try {
            await academicService.deleteEntity('departments', id);
            toast.success("Deleted");
            fetchDepartments(selectedCollegeId);
            dispatch(fetchLookups(selectedCollegeId));
        } catch (e) { 
            toast.error("Delete failed"); 
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formDept, collegeId: selectedCollegeId };
            if (editingItem) {
                await academicService.updateEntity('departments', editingItem._id, payload);
                toast.success("Updated successfully");
            } else {
                await academicService.createEntity('departments', payload);
                toast.success("Created successfully");
            }
            fetchDepartments(selectedCollegeId);
            dispatch(fetchLookups(selectedCollegeId));
            setFormDept({ name: '', description: '' });
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
        setFormDept({
            name: row.name,
            description: row.description || ''
        });
        setSelectedCollegeId(row.collegeId?._id || row.collegeId || '');
        setIsFormOpen(true);
        // Scroll to top where form is
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
        setFormDept({ name: '', description: '' });
        setIsFormOpen(false);
    };

    const displayData = useMemo(() => {
        if (!selectedCollegeId && isMultiCollegeRole) {
            // If "All Colleges" selected in the list filter
            return departmentsData;
        }
        return departmentsData.filter(item => String(item.collegeId?._id || item.collegeId) === String(selectedCollegeId));
    }, [departmentsData, selectedCollegeId, isMultiCollegeRole]);

    return (
        <PageLayout title="Manage Departments" description="Create and view your academic departments.">
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
                                {editingItem ? 'Edit Department' : 'Create New Department'}
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
                                        label="Department Name" 
                                        value={formDept.name} 
                                        onChange={e => setFormDept({ ...formDept, name: e.target.value })} 
                                        placeholder="e.g. Computer Science"
                                    />
                                </div>
                                
                                <div className="col-span-1 md:col-span-1">
                                    <InputField 
                                        label="Description (Optional)" 
                                        value={formDept.description} 
                                        onChange={e => setFormDept({ ...formDept, description: e.target.value })} 
                                        placeholder="Brief details..."
                                    />
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
                        <h2 className="text-xl font-bold text-gray-800">Departments List</h2>
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
                            { header: 'Department Name', accessor: row => row.name },
                            { header: 'Description', accessor: row => row.description || 'N/A' },
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

export default ManageDepartment;
