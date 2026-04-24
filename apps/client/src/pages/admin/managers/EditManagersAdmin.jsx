import React, { useState, useEffect } from 'react';
import superAdminService from '@services/superAdminService';
import { useToast } from '@hooks/useToast';
import { InputField, PrimaryButton } from '@components/ui';

const EditManagersAdmin = ({ refreshList, colleges, editingManager, setEditingManager }) => {
    const toast = useToast();
    const [managerForm, setManagerForm] = useState({ username: '', email: '', assignedColleges: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingManager) {
            const collegeIds = editingManager.assignedColleges.map(c => c._id || c);
            setManagerForm({ username: editingManager.username, email: editingManager.email, assignedColleges: collegeIds });
        } else {
            setManagerForm({ username: '', email: '', assignedColleges: [] });
        }
    }, [editingManager]);

    const handleCreateManager = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingManager) {
                await superAdminService.updateManager(editingManager._id, managerForm);
                toast.success("Manager updated successfully!");
            } else {
                await superAdminService.createManager(managerForm);
                toast.success("Manager created successfully!");
            }
            setManagerForm({ username: '', email: '', assignedColleges: [] });
            if (setEditingManager) setEditingManager(null);
            if (refreshList) refreshList();
        } catch (error) {
            toast.error(error.response?.data?.error || "Operation failed");
        } finally { setLoading(false); }
    };

    return (
        <div className="md:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{editingManager ? 'Edit Manager' : 'Create Manager'}</h2>
                {editingManager && (
                    <button type="button" onClick={() => { setEditingManager(null); setManagerForm({ username: '', email: '', assignedColleges: [] }); }} className="text-sm font-bold text-gray-500 hover:text-gray-800">Cancel</button>
                )}
            </div>
            <form onSubmit={handleCreateManager} className="space-y-4">
                <InputField required label="Manager Name" value={managerForm.username} onChange={e => setManagerForm({ ...managerForm, username: e.target.value })} />
                <InputField required type="email" label="Manager Email" value={managerForm.email} onChange={e => setManagerForm({ ...managerForm, email: e.target.value })} />
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Colleges</label>
                    <div className="border border-gray-200 rounded-xl p-4 max-h-48 overflow-y-auto bg-white grid grid-cols-1 gap-2">
                        {colleges.map(c => (
                            <label key={c._id} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 p-2 rounded cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    checked={managerForm.assignedColleges.includes(c._id)}
                                    onChange={(e) => {
                                        const newArr = e.target.checked
                                            ? [...managerForm.assignedColleges, c._id]
                                            : managerForm.assignedColleges.filter(id => id !== c._id);
                                        setManagerForm({ ...managerForm, assignedColleges: newArr });
                                    }}
                                />
                                {c.name}
                            </label>
                        ))}
                    </div>
                    {managerForm.assignedColleges.length === 0 && <span className="text-xs text-rose-500 mt-1">Please select at least one college.</span>}
                </div>
                <PrimaryButton type="submit" loading={loading} disabled={loading || managerForm.assignedColleges.length === 0} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-md mt-4 flex justify-center items-center">
                    {editingManager ? 'Update Manager' : 'Create Manager'}
                </PrimaryButton>
            </form>
        </div>
    );
};

export default EditManagersAdmin;
