import React, { useState, useEffect } from 'react';
import superAdminService from '@services/superAdminService';
import { useToast } from '@hooks/useToast';
import DataTable from '@components/DataTable';
import Popup from '@components/Popup';
import EditManagersAdmin from '@/pages/admin/managers/EditManagersAdmin';
import PageLayout from '@/components/PageLayout';

const ShowManagersAdmin = () => {
    const toast = useToast();
    const [managers, setManagers] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [editingManager, setEditingManager] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    useEffect(() => { fetchManagers(); fetchColleges(); }, []);

    const fetchManagers = async () => {
        try { const res = await superAdminService.getManagers(); setManagers(res.data.data); }
        catch (error) { toast.error("Failed to load"); }
    };

    const fetchColleges = async () => {
        try { const res = await superAdminService.getColleges(); setColleges(res.data.data); }
        catch (error) { toast.error("Failed to load"); }
    };

    return (
        <PageLayout title="Manager List" description="Manage your college managers">
            <button onClick={() => { setEditingManager(null); setIsPopupOpen(true); }}
                className="mb-6 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg">
                + Create Manager
            </button>

            <Popup
                isOpen={isPopupOpen}
                onClose={() => {
                    setIsPopupOpen(false);
                    setEditingManager(null);
                }}
            >
                <EditManagersAdmin
                    refreshList={fetchManagers}
                    colleges={colleges}
                    editingManager={editingManager}
                    setEditingManager={setEditingManager}
                    onClose={() => {
                        setIsPopupOpen(false);
                        setEditingManager(null);
                    }}
                />
            </Popup>

            <DataTable
                data={managers}
                columns={[
                    { header: 'Name', accessor: m => m.username },
                    { header: 'Email', accessor: m => m.email },
                    { header: 'Colleges', accessor: m => `${m.assignedColleges?.length || 0} assigned` }
                ]}
                actions={(m) => (
                    <button onClick={() => { setEditingManager(m); setIsPopupOpen(true); }}
                        className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold">Edit</button>
                )}
            />
        </PageLayout>
    );
};
export default ShowManagersAdmin;