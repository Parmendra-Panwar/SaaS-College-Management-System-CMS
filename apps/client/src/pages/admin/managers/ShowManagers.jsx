import React, { useState, useEffect } from 'react';
import superAdminService from '@services/superAdminService';
import { useToast } from '@hooks/useToast';
import DataTable from '@components/DataTable';
import EditManagers from '@pages/admin/managers/EditManagers';

const ShowManagers = () => {
    const toast = useToast();
    const [managers, setManagers] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [editingManager, setEditingManager] = useState(null);

    useEffect(() => {
        fetchManagers();
        fetchColleges();
    }, []);

    const fetchManagers = async () => {
        try {
            const res = await superAdminService.getManagers();
            setManagers(res.data.data);
        } catch (error) { toast.error("Failed to load managers"); }
    };

    const fetchColleges = async () => {
        try {
            const res = await superAdminService.getColleges();
            setColleges(res.data.data);
        } catch (error) { toast.error("Failed to load colleges"); }
    };

    const handleDeleteManager = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await superAdminService.deleteManager(id);
            toast.success("Manager deleted");
            fetchManagers();
        } catch (err) { toast.error("Failed to delete"); }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <EditManagers
                refreshList={fetchManagers}
                colleges={colleges}
                editingManager={editingManager}
                setEditingManager={setEditingManager}
            />
            <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 w-full overflow-x-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Manager Directory</h2>
                <DataTable
                    columns={[
                        { header: 'Name', accessor: m => m.username },
                        { header: 'Email', accessor: m => m.email },
                        { header: 'Assigned Colleges', accessor: m => <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">{m.assignedColleges?.length || 0} colleges</span> },
                        { header: 'Password', accessor: m => <span className="font-mono text-sm text-gray-600">{m.tempPassword || '***'}</span> }
                    ]}
                    data={managers}
                    actions={(m) => (
                        <>
                            <button onClick={() => setEditingManager(m)} className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-bold">Edit</button>
                            <button onClick={() => handleDeleteManager(m._id)} className="text-sm bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-100 font-bold">Delete</button>
                        </>
                    )}
                />
            </div>
        </div>
    );
};

export default ShowManagers;
