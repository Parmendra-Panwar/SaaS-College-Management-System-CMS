import React, { useState, useEffect } from 'react';
import superAdminService from '@services/superAdminService';
import { useToast } from '@hooks/useToast';
import DataTable from '@components/DataTable';
import Popup from '@components/Popup';
import EditCollegesManager from '@/pages/manager/colleges/EditCollegesManager';

const ShowCollegesManager = () => {
    const toast = useToast();
    const [colleges, setColleges] = useState([]);
    const [editingCollege, setEditingCollege] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);

    useEffect(() => {
        fetchColleges();
    }, []);

    const fetchColleges = async () => {
        setIsFetchingData(true);
        try {
            const res = await superAdminService.getColleges();
            setColleges(res.data.data);
        } catch (error) { toast.error("Failed to load colleges"); }
        finally { setIsFetchingData(false); }
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Institutes</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Manage your assigned institutes.</p>
                </div>
                <button onClick={() => { setEditingCollege(null); setIsPopupOpen(true); }}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg">
                    + Onboard Institute
                </button>
            </div>

            <Popup isOpen={isPopupOpen} onClose={() => { setIsPopupOpen(false); setEditingCollege(null); }}>
                <EditCollegesManager 
                    refreshList={fetchColleges}
                    editingCollege={editingCollege}
                    setEditingCollege={setEditingCollege}
                    onClose={() => { setIsPopupOpen(false); setEditingCollege(null); }}
                />
            </Popup>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 overflow-x-auto">
                <DataTable
                    isLoading={isFetchingData}
                    columns={[
                        { header: 'College Name', accessor: c => c.name },
                        { header: 'Principal', accessor: c => c.principalAuth?.username || 'N/A' },
                        { header: 'Email', accessor: c => c.principalAuth?.email || 'N/A' },
                        { header: 'Temp Password', accessor: c => <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">{c.principalAuth?.password || '***'}</span> }
                    ]}
                    data={colleges}
                    actions={(c) => (
                        <button onClick={() => { setEditingCollege(c); setIsPopupOpen(true); }}
                            className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold">Edit</button>
                    )}
                />
            </div>
        </div>
    );
};

export default ShowCollegesManager;
