import React, { useState, useEffect } from 'react';
import Popup from './Popup';

const AVAILABLE_FEATURES = [
    { id: 'departments', label: 'Departments' },
    { id: 'classes', label: 'Classes' },
    { id: 'subjects', label: 'Subjects' },
    { id: 'students', label: 'Manage Students' },
    { id: 'teachers', label: 'Manage Teachers' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'fees', label: 'Fees Management' },
    { id: 'marksheets', label: 'Marksheets' },
    { id: 'reports', label: 'Bi-Weekly Reports' },
    { id: 'productivity', label: 'Student Productivity' },
    { id: 'grades', label: 'Input Grades' },
    { id: 'discipline', label: 'Discipline / Notes' }
];

const ManageFeaturesPopup = ({ isOpen, onClose, currentFeatures = [], onSave }) => {
    const [features, setFeatures] = useState([]);

    useEffect(() => {
        // Initialize state with the provided features or all enabled by default if none provided
        const initialFeatures = currentFeatures && currentFeatures.length > 0 
            ? currentFeatures 
            : AVAILABLE_FEATURES.map(f => f.id);
        
        setFeatures(initialFeatures);
    }, [currentFeatures, isOpen]);

    const handleToggle = (featureId) => {
        setFeatures(prev => {
            if (prev.includes(featureId)) {
                return prev.filter(id => id !== featureId);
            } else {
                return [...prev, featureId];
            }
        });
    };

    const handleSave = () => {
        onSave(features);
        onClose();
    };

    return (
        <Popup isOpen={isOpen} onClose={onClose}>
            <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Manage Features</h2>
                    <p className="text-sm text-gray-500 mt-1">Enable or disable specific modules for this institute.</p>
                </div>
                
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {AVAILABLE_FEATURES.map((feature) => {
                        const isEnabled = features.includes(feature.id);
                        return (
                            <div key={feature.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                <span className="font-semibold text-gray-700">{feature.label}</span>
                                <button
                                    type="button"
                                    onClick={() => handleToggle(feature.id)}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                                        isEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                                    }`}
                                    role="switch"
                                    aria-checked={isEnabled}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md"
                    >
                        Save Features
                    </button>
                </div>
            </div>
        </Popup>
    );
};

export default ManageFeaturesPopup;
