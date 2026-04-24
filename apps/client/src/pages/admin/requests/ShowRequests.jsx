import React, { useState, useEffect } from 'react';
import superAdminService from '@services/superAdminService';
import { useToast } from '@hooks/useToast';
import DataTable from '@components/DataTable';

const ShowRequests = () => {
    const toast = useToast();
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await superAdminService.getCollegeRequests();
            setRequests(res.data.data);
        } catch (error) { toast.error("Failed to load requests"); }
    };

    const handleApproveRequest = async (id) => {
        try {
            await superAdminService.approveCollegeRequest(id);
            toast.success("Request approved and College created!");
            fetchRequests();
        } catch (err) { toast.error("Failed to approve"); }
    };

    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 overflow-x-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Pending College Requests</h2>
            <DataTable
                columns={[
                    { header: 'College Name', accessor: req => <span className="font-extrabold text-indigo-900">{req.collegeName}</span> },
                    { header: 'Status', accessor: req => <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">{req.status}</span> },
                    { header: 'Principal Name', accessor: req => req.principalName },
                    { header: 'Principal Email', accessor: req => req.principalEmail },
                    { header: 'Contact', accessor: req => req.contactNumber || 'N/A' }
                ]}
                data={requests}
                actions={(req) => (
                    <button onClick={() => handleApproveRequest(req._id)} className="text-sm bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-100 font-bold">
                        Approve
                    </button>
                )}
            />
        </div>
    );
};

export default ShowRequests;
