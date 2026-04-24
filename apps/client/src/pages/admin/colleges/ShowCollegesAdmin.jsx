import React, { useState, useEffect } from 'react';
import superAdminService from '@services/superAdminService';
import { useToast } from '@hooks/useToast';
import DataTable from '@components/DataTable';
import Popup from '@components/Popup';
import EditCollegesAdmin from '@/pages/admin/colleges/EditCollegesAdmin';
import PageLayout from '@/components/PageLayout';

const ShowCollegesAdmin = () => {
    const toast = useToast();
    const [colleges, setColleges] = useState([]);
    const [editingCollege, setEditingCollege] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    useEffect(() => { fetchColleges(); }, []);

    const fetchColleges = async () => {
        try { const res = await superAdminService.getColleges(); setColleges(res.data.data); }
        catch (error) { toast.error("Failed to load"); }
    };

    return (
        <PageLayout title="Institutes" description="Manage your institutes">
            <button onClick={() => { setEditingCollege(null); setIsPopupOpen(true); }}
                className="mb-6 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg">
                + Onboard Institute
            </button>

            <Popup isOpen={isPopupOpen} onClose={() => { setIsPopupOpen(false); setEditingCollege(null); }}>
                <EditCollegesAdmin
                    refreshList={fetchColleges}
                    editingCollege={editingCollege}
                    setEditingCollege={setEditingCollege}
                    onClose={() => { setIsPopupOpen(false); setEditingCollege(null); }}
                />
            </Popup>

            <DataTable
                data={colleges}
                columns={[
                    { header: 'College Name', accessor: c => c.name },
                    { header: 'Principal', accessor: c => c.principalAuth?.username || 'N/A' },
                    { header: 'Email', accessor: c => c.principalAuth?.email || 'N/A' },
                    { header: 'Temp Password', accessor: c => <span className="text-rose-600 font-bold">{c.principalAuth?.password || '***'}</span> }
                ]}
                actions={(c) => (
                    <button onClick={() => { setEditingCollege(c); setIsPopupOpen(true); }}
                        className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold">Edit</button>
                )}
            />
        </PageLayout>
    );
};
export default ShowCollegesAdmin;