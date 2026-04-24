import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import academicService from '@services/academicService';
import { useToast } from '@hooks/useToast';
import { InputField, SelectField, PrimaryButton } from '@components/ui';

const EditStudents = ({ mode, editingItem, onCancel, onSuccess, colleges, defaultCollegeId }) => {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [formStudent, setFormStudent] = useState({ username: '', email: '', roll_number: '', class: '' });
    const [selectedCollegeId, setSelectedCollegeId] = useState(defaultCollegeId || '');

    const { classes } = useSelector(state => state.lookup);

    useEffect(() => {
        if (mode === 'edit' && editingItem) {
            setSelectedCollegeId(editingItem.collegeId?._id || editingItem.collegeId);
            setFormStudent({
                username: editingItem.user?.username || '',
                email: editingItem.user?.email || '',
                roll_number: editingItem.roll_number || '',
                class: editingItem.class?._id || editingItem.class || ''
            });
        }
    }, [mode, editingItem]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formStudent, collegeId: selectedCollegeId };
            if (mode === 'edit') {
                await academicService.updateEntity('students', editingItem._id, payload);
                toast.success("Updated successfully");
            } else {
                await academicService.createEntity('students', payload);
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
                <h2 className="text-xl font-bold capitalize">{mode === 'edit' ? 'Edit' : 'Create New'} Student</h2>
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
                <div className="col-span-1"><InputField required label="Name" value={formStudent.username} onChange={e => setFormStudent({ ...formStudent, username: e.target.value })} /></div>
                <div className="col-span-1"><InputField required type="email" label="Email" value={formStudent.email} onChange={e => setFormStudent({ ...formStudent, email: e.target.value })} /></div>
                <div className="col-span-1"><InputField required label="Roll Number" value={formStudent.roll_number} onChange={e => setFormStudent({ ...formStudent, roll_number: e.target.value })} /></div>
                <div className="col-span-1">
                    <SelectField required label="Class (Must Select)" value={formStudent.class} onChange={e => setFormStudent({ ...formStudent, class: e.target.value })}>
                        <option value="">Select Class</option>
                        {classes.filter(c => String(c.collegeId?._id || c.collegeId) === String(selectedCollegeId)).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </SelectField>
                </div>

                <div className="col-span-1 md:col-span-4 mt-4 flex gap-3">
                    <PrimaryButton type="submit" loading={loading} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition w-full md:w-auto shadow-md flex justify-center items-center">
                        {mode === 'edit' ? `Update Student` : `Create Student`}
                    </PrimaryButton>
                    <button type="button" onClick={onCancel} className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditStudents;
