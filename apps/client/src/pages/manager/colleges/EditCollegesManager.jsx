import React, { useState } from 'react';
import superAdminService from '@services/superAdminService';
import { useToast } from '@hooks/useToast';
import { InputField, PrimaryButton } from '@components/ui';

const EditCollegesManager = ({ refreshList }) => {
    const toast = useToast();
    const [formData, setFormData] = useState({ name: '', principalName: '', principalEmail: '' });
    const [loading, setLoading] = useState(false);

    const handleOnboard = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await superAdminService.onboardCollege(formData);
            toast.success("College onboarded and Principle credentials generated!");
            setFormData({ name: '', principalName: '', principalEmail: '' });
            if (refreshList) refreshList();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to onboard college");
        } finally { setLoading(false); }
    };

    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Onboard Direct Institute</h2>
            <form onSubmit={handleOnboard} className="space-y-4">
                <InputField required label="College Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <InputField required label="Principal Full Name" value={formData.principalName} onChange={e => setFormData({ ...formData, principalName: e.target.value })} />
                <InputField required type="email" label="Principal Email" value={formData.principalEmail} onChange={e => setFormData({ ...formData, principalEmail: e.target.value })} />
                <PrimaryButton type="submit" loading={loading}>
                    Onboard Institute & Generate Credentials
                </PrimaryButton>
            </form>
        </div>
    );
};

export default EditCollegesManager;
