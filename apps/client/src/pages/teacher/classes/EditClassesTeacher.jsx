import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import academicService from '@services/academicService';
import { useToast } from '@hooks/useToast';
import { InputField, SelectField, PrimaryButton } from '@components/ui';

const EditClassesTeacher = ({ mode, editingItem, onCancel, onSuccess, colleges, defaultCollegeId }) => {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [formClass, setFormClass] = useState({ name: '', departmentId: '' });
    const [selectedCollegeId, setSelectedCollegeId] = useState(defaultCollegeId || '');

    const { departments } = useSelector(state => state.lookup);

    useEffect(() => {
        if (mode === 'edit' && editingItem) {
            setSelectedCollegeId(editingItem.collegeId?._id || editingItem.collegeId);
            setFormClass({
                name: editingItem.name,
                departmentId: editingItem.departmentId?._id || editingItem.departmentId || ''
            });
        }
    }, [mode, editingItem]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formClass, collegeId: selectedCollegeId };
            if (mode === 'edit') {
                await academicService.updateEntity('classes', editingItem._id, payload);
                toast.success("Updated successfully");
            } else {
                await academicService.createEntity('classes', payload);
                toast.success("Created successfully");
            }
            if (onSuccess) onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.error || "Operation failed");
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-10">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold capitalize">{mode === 'edit' ? 'Edit' : 'Create New'} Class</h2>
                {colleges.length > 1 && mode === 'create' && (
                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                        <label className="text-sm font-bold text-gray-500 whitespace-nowrap">Target College:</label>
                        <select className="bg-transparent text-sm font-semibold text-indigo-700 outline-none cursor-pointer" value={selectedCollegeId} onChange={e => setSelectedCollegeId(e.target.value)}>
                            {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="col-span-2"><InputField required label="Class Name" value={formClass.name} onChange={e => setFormClass({ ...formClass, name: e.target.value })} /></div>
                <div className="col-span-1">
                    <SelectField label="Department (Optional)" value={formClass.departmentId} onChange={e => setFormClass({ ...formClass, departmentId: e.target.value })}>
                        <option value="">None</option>
                        {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </SelectField>
                </div>

                <div className="col-span-1 md:col-span-4 mt-4 flex gap-3">
                    <PrimaryButton type="submit" loading={loading} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition w-full md:w-auto shadow-md flex justify-center items-center">
                        {mode === 'edit' ? `Update Class` : `Create Class`}
                    </PrimaryButton>
                    <button type="button" onClick={onCancel} className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditClassesTeacher;
