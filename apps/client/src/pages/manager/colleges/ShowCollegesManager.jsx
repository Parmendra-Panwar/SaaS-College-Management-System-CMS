import React, { useState, useEffect } from 'react';
import superAdminService from '@services/superAdminService';
import { useToast } from '@hooks/useToast';
import DataTable from '@components/DataTable';
import EditCollegesManager from '@/pages/manager/colleges/EditCollegesManager';

const ShowCollegesManager = () => {
    const toast = useToast();
    const [colleges, setColleges] = useState([]);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <EditCollegesManager refreshList={fetchColleges} />
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 overflow-x-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Institutes Index</h2>
                <DataTable
                    isLoading={isFetchingData}
                    columns={[
                        { header: 'College Name', accessor: c => c.name },
                        { header: 'Principal', accessor: c => c.principalAuth?.username || 'N/A' },
                        { header: 'Email', accessor: c => c.principalAuth?.email || 'N/A' },
                        { header: 'Temp Password', accessor: c => <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">{c.principalAuth?.password || '***'}</span> }
                    ]}
                    data={colleges}
                />
            </div>
        </div>
    );
};

export default ShowCollegesManager;
