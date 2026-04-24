import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLookups } from '@store/slices/lookupSlice';
import academicService from '@services/academicService';
import { useToast } from '@hooks/useToast';
import DataTable from '@components/DataTable';
import EditStudents from '@pages/principal/students/EditStudents';
import { SelectField } from '@components/ui';

const ShowStudents = ({ userRole, userCollegeId }) => {
    const toast = useToast();
    const dispatch = useDispatch();
    const { accessibleColleges: colleges, classes, loaded: lookupsLoaded } = useSelector(state => state.lookup);

    const [students, setStudents] = useState([]);
    const [pageMode, setPageMode] = useState('list');
    const [editingItem, setEditingItem] = useState(null);
    const [listCollegeFilter, setListCollegeFilter] = useState('');
    const [listClassFilter, setListClassFilter] = useState('');

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
        setListClassFilter('');
    }, [listCollegeFilter]);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await academicService.getEntities('students');
            setStudents(res.data.data || []);
        } catch (e) { toast.error("Failed to fetch data"); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this record?")) return;
        try {
            await academicService.deleteEntity('students', id);
            toast.success("Deleted");
            fetchStudents();
        } catch (e) { toast.error("Delete failed"); }
    };

    const derivedClassesForFilter = React.useMemo(() => {
        if (!listCollegeFilter || !classes) return [];
        return classes.filter(c => String(c.collegeId?._id || c.collegeId) === String(listCollegeFilter));
    }, [listCollegeFilter, classes]);

    const displayData = React.useMemo(() => {
        let filtered = students;
        if (listCollegeFilter) {
            filtered = filtered.filter(item => String(item.collegeId?._id || item.collegeId) === String(listCollegeFilter));
        }
        if (listClassFilter) {
            filtered = filtered.filter(item => String(item.class?._id || item.class) === String(listClassFilter));
        }
        return filtered;
    }, [students, listCollegeFilter, listClassFilter]);

    if (pageMode === 'create' || pageMode === 'edit') {
        return (
            <div className="animate-in slide-in-from-bottom-4">
                <EditStudents
                    mode={pageMode}
                    editingItem={editingItem}
                    onCancel={() => { setPageMode('list'); setEditingItem(null); }}
                    onSuccess={() => { setPageMode('list'); setEditingItem(null); fetchStudents(); }}
                    colleges={colleges}
                    defaultCollegeId={listCollegeFilter}
                />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold capitalize">Students Directory</h2>
                <div className="flex gap-4">
                    {(userRole === 'Admin' || userRole === 'Manager') && (
                        <div className="w-64">
                            <SelectField value={listCollegeFilter} onChange={e => setListCollegeFilter(e.target.value)}>
                                <option value="">All Colleges</option>
                                {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </SelectField>
                        </div>
                    )}
                    <div className="w-64">
                        <SelectField value={listClassFilter} onChange={e => setListClassFilter(e.target.value)}>
                            <option value="">All Classes</option>
                            {derivedClassesForFilter.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </SelectField>
                    </div>
                    <button onClick={() => { setPageMode('create'); setEditingItem(null); }} className="px-5 py-2 font-bold rounded-xl bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition">
                        + Create New
                    </button>
                </div>
            </div>
            <DataTable
                columns={[
                    { header: 'Name', accessor: row => row.user?.username || 'N/A' },
                    { header: 'Roll Number', accessor: row => row.roll_number },
                    { header: 'Email', accessor: row => row.user?.email || 'N/A' },
                    { header: 'Class', accessor: row => row.class?.name || 'N/A' }
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

export default ShowStudents;
