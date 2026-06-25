import React, { useState, useEffect } from 'react';
import examService from '@services/examService';
import { useToast } from '@hooks/useToast';
import { PrimaryButton, InputField } from '@components/ui';
import MarksheetPrintModal from './MarksheetPrintModal';

const UpdateMarksheetView = ({ exam }) => {
    const toast = useToast();
    const [marksheets, setMarksheets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // For print modal
    const [selectedStudentMarksheet, setSelectedStudentMarksheet] = useState(null);

    useEffect(() => {
        fetchMarksheets();
    }, [exam._id]);

    const fetchMarksheets = async () => {
        setLoading(true);
        try {
            const res = await examService.getExamMarksheets(exam._id);
            setMarksheets(res.data.data || []);
        } catch (err) {
            toast.error("Failed to load marksheets");
        } finally {
            setLoading(false);
        }
    };

    // Helper map for subject config validation and rendering headers
    const subjectConfigMap = {};
    exam.subjectsConfig.forEach(c => {
        subjectConfigMap[c.subjectId._id || c.subjectId] = c;
    });

    const handleMarksChange = (marksheetId, subjectId, field, value) => {
        setMarksheets(prev => prev.map(sheet => {
            if (sheet._id !== marksheetId) return sheet;
            
            const newMarks = sheet.marks.map(m => {
                if (String(m.subjectId?._id || m.subjectId) !== String(subjectId)) return m;
                return { ...m, [field]: value };
            });

            return { ...sheet, marks: newMarks };
        }));
    };

    const handleBulkSave = async () => {
        setSaving(true);
        try {
            // Build payload
            const payload = marksheets.map(sheet => ({
                marksheetId: sheet._id,
                marks: sheet.marks.map(m => ({
                    subjectId: m.subjectId._id || m.subjectId,
                    theoryMarks: m.theoryMarks,
                    practicalMarks: m.practicalMarks
                }))
            }));

            await examService.bulkUpdateMarksheets(exam._id, { marksheets: payload });
            toast.success("Marks saved successfully!");
            await fetchMarksheets();
        } catch (err) {
            toast.error(err.response?.data?.error || "Bulk update failed");
        }
        setSaving(false);
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500 font-medium">Loading marksheets...</div>;
    }

    if (marksheets.length === 0) {
        return <div className="p-8 text-center text-gray-500 font-medium bg-white rounded-3xl border border-gray-100">No marksheets found for this exam. Students might not be assigned to this class.</div>;
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Bulk Enter Marks</h3>
                    <p className="text-sm text-gray-500 mt-1">Leave fields blank if marks are not yet graded. Invalid inputs exceeding max marks will be rejected by the server.</p>
                </div>
                <PrimaryButton loading={saving} onClick={handleBulkSave} className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm font-bold">
                    Bulk Update Marks
                </PrimaryButton>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-max">
                    <thead>
                        <tr className="bg-gray-100/50 border-b border-gray-100 text-gray-700">
                            <th className="p-4 font-semibold sticky left-0 bg-gray-50 z-10 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Student</th>
                            {exam.subjectsConfig.map(config => (
                                <th key={config.subjectId._id || config.subjectId} className="p-4 border-r border-gray-100 text-center font-semibold">
                                    <div className="text-sm mb-2 text-indigo-700">{config.subjectId.name || 'Subject'}</div>
                                    <div className="flex justify-center gap-4 text-xs font-bold text-gray-500">
                                        <span className="w-16">Th ({config.maxTheory})</span>
                                        <span className="w-16">Pr ({config.maxPractical})</span>
                                    </div>
                                </th>
                            ))}
                            <th className="p-4 font-semibold text-center sticky right-0 bg-gray-50 z-10 border-l border-gray-100 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {marksheets.map((sheet, idx) => {
                            const studentName = sheet.studentId?.user?.username || sheet.studentId?.username || 'Unknown';
                            const rollNo = sheet.studentId?.rollNo || 'N/A';
                            
                            return (
                                <tr key={sheet._id} className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors">
                                    <td className="p-4 sticky left-0 bg-white z-10 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                        <div className="font-bold text-gray-800">{studentName}</div>
                                        <div className="text-xs text-gray-500">Roll: {rollNo}</div>
                                    </td>
                                    
                                    {exam.subjectsConfig.map(config => {
                                        const subIdStr = String(config.subjectId._id || config.subjectId);
                                        const markEntry = sheet.marks.find(m => String(m.subjectId._id || m.subjectId) === subIdStr);
                                        
                                        return (
                                            <td key={subIdStr} className="p-4 border-r border-gray-100">
                                                <div className="flex justify-center gap-2">
                                                    <input 
                                                        type="number" 
                                                        className="w-16 p-2 text-sm border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        placeholder="-"
                                                        value={markEntry?.theoryMarks ?? ''}
                                                        onChange={(e) => handleMarksChange(sheet._id, subIdStr, 'theoryMarks', e.target.value)}
                                                        max={config.maxTheory}
                                                        min={0}
                                                    />
                                                    <input 
                                                        type="number" 
                                                        className="w-16 p-2 text-sm border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        placeholder="-"
                                                        value={markEntry?.practicalMarks ?? ''}
                                                        onChange={(e) => handleMarksChange(sheet._id, subIdStr, 'practicalMarks', e.target.value)}
                                                        max={config.maxPractical}
                                                        min={0}
                                                    />
                                                </div>
                                            </td>
                                        );
                                    })}

                                    <td className="p-4 sticky right-0 bg-white z-10 border-l border-gray-100 text-center shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                        <button 
                                            onClick={() => setSelectedStudentMarksheet(sheet)}
                                            className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition whitespace-nowrap"
                                        >
                                            Show Marksheet
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {selectedStudentMarksheet && (
                <MarksheetPrintModal 
                    exam={exam} 
                    marksheet={selectedStudentMarksheet} 
                    onClose={() => setSelectedStudentMarksheet(null)} 
                />
            )}
        </div>
    );
};

export default UpdateMarksheetView;
