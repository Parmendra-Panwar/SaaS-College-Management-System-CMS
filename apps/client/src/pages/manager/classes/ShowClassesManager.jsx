import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLookups } from '@store/slices/lookupSlice';
import academicService from '@services/academicService';
import { useToast } from '@hooks/useToast';
import DataTable from '@components/DataTable';
import EditClassesManager from '@/pages/manager/classes/EditClassesManager';
import { SelectField } from '@components/ui';

const ShowClassesManager = ({ userRole, userCollegeId }) => {
    const toast = useToast();
    const dispatch = useDispatch();
    const { accessibleColleges: colleges, loaded: lookupsLoaded } = useSelector(state => state.lookup);

    const [classesData, setClassesData] = useState([]);
    const [pageMode, setPageMode] = useState('list');
    const [editingItem, setEditingItem] = useState(null);
    const [listCollegeFilter, setListCollegeFilter] = useState('');

    useEffect(() => {
        if (!lookupsLoaded) dispatch(fetchLookups());
    }, [dispatch, lookupsLoaded]);

    useEffect(() => {
        if (lookupsLoaded && colleges.length > 0) {
            if (!listCollegeFilter) setListCollegeFilter(colleges[0]._id);
        }
        if (userRole === 'Principal' || userRole === 'Teacher') {
            setListCollegeFilter(userCollegeId);
        }
    }, [lookupsLoaded, colleges, userRole, userCollegeId]);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await academicService.getEntities('classes');
            setClassesData(res.data.data || []);
        } catch (e) { toast.error("Failed to fetch data"); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this record?")) return;
        try {
            await academicService.deleteEntity('classes', id);
            toast.success("Deleted");
            fetchClasses();
            dispatch(fetchLookups());
        } catch (e) { toast.error("Delete failed"); }
    };

    const displayData = React.useMemo(() => {
        if (!listCollegeFilter) return classesData;
        return classesData.filter(item => String(item.collegeId?._id || item.collegeId) === String(listCollegeFilter));
    }, [classesData, listCollegeFilter]);

    if (pageMode === 'create' || pageMode === 'edit') {
        return (
            <div className="animate-in slide-in-from-bottom-4">
                <EditClassesManager
                    mode={pageMode}
                    editingItem={editingItem}
                    onCancel={() => { setPageMode('list'); setEditingItem(null); }}
                    onSuccess={() => { setPageMode('list'); setEditingItem(null); fetchClasses(); dispatch(fetchLookups()); }}
                    colleges={colleges}
                    defaultCollegeId={listCollegeFilter}
                />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold capitalize">Classes Directory</h2>
                <div className="flex gap-4">
                    {(userRole === 'Admin' || userRole === 'Manager') && (
                        <div className="w-64">
                            <SelectField value={listCollegeFilter} onChange={e => setListCollegeFilter(e.target.value)}>
                                <option value="">All Colleges</option>
                                {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </SelectField>
                        </div>
                    )}
                    <button onClick={() => { setPageMode('create'); setEditingItem(null); }} className="px-5 py-2 font-bold rounded-xl bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition">
                        + Create New
                    </button>
                </div>
            </div>
            <DataTable
                columns={[
                    { header: 'Name', accessor: row => row.name },
                    { header: 'Department', accessor: row => row.departmentId?.name || 'N/A' }
                ]}
                data={displayData}
                actions={(row) => (
                    <>
                        <button onClick={() => { setEditingItem(row); setPageMode('edit'); }} className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-bold">Edit</button>
                        <button onClick={() => handleDelete(row._id)} className="text-sm bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-100 font-bold">Delete</button>
                    </>
                )}
            />
        </div>
    );
};

export default ShowClassesManager;
