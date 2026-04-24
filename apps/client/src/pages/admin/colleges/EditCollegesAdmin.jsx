import React, { useState, useEffect } from 'react';
import superAdminService from '@services/superAdminService';
import { useToast } from '@hooks/useToast';
import { InputField, PrimaryButton } from '@components/ui';

const EditCollegesAdmin = ({ refreshList, editingCollege, setEditingCollege, onClose }) => {
    const toast = useToast();
    const [formData, setFormData] = useState({ name: '', principalName: '', principalEmail: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingCollege) {
            setFormData({
                name: editingCollege.name,
                principalName: editingCollege.principalAuth?.username || '',
                principalEmail: editingCollege.principalAuth?.email || ''
            });
        }
    }, [editingCollege]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingCollege) {
                await superAdminService.updateCollege(editingCollege._id, formData);
                toast.success("College updated!");
            } else {
                await superAdminService.onboardCollege(formData);
                toast.success("College onboarded!");
            }
            refreshList();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.error || "Operation failed");
        } finally { setLoading(false); }
    };

    return (
        <div className="bg-white p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-6">{editingCollege ? 'Edit Institute' : 'Onboard Institute'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField required label="College Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <InputField required label="Principal Name" value={formData.principalName} onChange={e => setFormData({ ...formData, principalName: e.target.value })} />
                <InputField required type="email" label="Principal Email" value={formData.principalEmail} onChange={e => setFormData({ ...formData, principalEmail: e.target.value })} />
                <PrimaryButton
                    type="submit"
                    loading={loading}
                    className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition"
                >
                    {editingCollege ? 'Update' : 'Onboard'}
                </PrimaryButton>
            </form>
        </div>
    );
};
export default EditCollegesAdmin;