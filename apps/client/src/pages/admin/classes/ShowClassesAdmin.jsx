import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLookups } from '@store/slices/lookupSlice';
import academicService from '@services/academicService';
import { useToast } from '@hooks/useToast';
import DataTable from '@components/DataTable';
import EditClassesAdmin from '@/pages/admin/classes/EditClassesAdmin';
import { SelectField } from '@components/ui';
import PageLayout from '@components/PageLayout'; // Assuming standard import

const ShowClassesAdmin = ({ userRole, userCollegeId }) => {
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
    }, [lookupsLoaded, colleges]);

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
            <PageLayout title={pageMode === 'create' ? "Create Class" : "Edit Class"} description="Manage your academic class details here.">
                <EditClassesAdmin
                    mode={pageMode}
                    editingItem={editingItem}
                    onCancel={() => { setPageMode('list'); setEditingItem(null); }}
                    onSuccess={() => { setPageMode('list'); setEditingItem(null); fetchClasses(); dispatch(fetchLookups()); }}
                    colleges={colleges}
                    defaultCollegeId={listCollegeFilter}
                />
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Classes Directory" description="View and manage all registered classes.">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-6">
                    <div className="w-64">
                        <SelectField value={listCollegeFilter} onChange={e => setListCollegeFilter(e.target.value)}>
                            {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </SelectField>
                    </div>
                </div>
                <DataTable
                    columns={[
                        { header: 'Name', accessor: row => row.name },
                        { header: 'Department', accessor: row => row.departmentId?.name || 'N/A' }
                    ]}
                    data={displayData}
                    actions={(row) => (
                        <div className="flex gap-2">
                            <button onClick={() => { setEditingItem(row); setPageMode('edit'); }} className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-bold">Edit</button>
                            <button onClick={() => handleDelete(row._id)} className="text-sm bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-100 font-bold">Delete</button>
                        </div>
                    )}
                />
            </div>
        </PageLayout>
    );
};

export default ShowClassesAdmin;