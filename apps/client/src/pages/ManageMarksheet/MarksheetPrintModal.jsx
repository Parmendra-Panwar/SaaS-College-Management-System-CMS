import React, { useRef } from 'react';
import { FiX, FiPrinter, FiDownload } from 'react-icons/fi';

const MarksheetPrintModal = ({ exam, marksheet, onClose }) => {
    const printRef = useRef(null);

    const handlePrint = () => {
        window.print();
    };

    const studentName = marksheet.studentId?.user?.username || marksheet.studentId?.username || 'Unknown Student';
    const rollNo = marksheet.studentId?.rollNo || 'N/A';
    const examName = exam.name || 'Examination';

    // Calculate totals
    let totalMax = 0;
    let totalObtained = 0;

    const subjectRows = exam.subjectsConfig.map(config => {
        const subIdStr = String(config.subjectId._id || config.subjectId);
        const subName = config.subjectId.name || 'Subject';
        const markEntry = marksheet.marks.find(m => String(m.subjectId._id || m.subjectId) === subIdStr);
        
        const thMax = config.maxTheory || 0;
        const prMax = config.maxPractical || 0;
        const thObt = markEntry?.theoryMarks !== null && markEntry?.theoryMarks !== undefined ? Number(markEntry.theoryMarks) : 0;
        const prObt = markEntry?.practicalMarks !== null && markEntry?.practicalMarks !== undefined ? Number(markEntry.practicalMarks) : 0;

        const subMaxTotal = thMax + prMax;
        const subObtTotal = thObt + prObt;

        totalMax += subMaxTotal;
        totalObtained += subObtTotal;

        return {
            name: subName,
            thMax, prMax, subMaxTotal,
            thObt, prObt, subObtTotal
        };
    });

    const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : 0;
    const isPass = percentage >= 33; // Standard pass mark for visual UI

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:p-0 print:bg-white print:block">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col print:rounded-none print:shadow-none print:w-full print:h-full">
                
                {/* Header Actions - hidden when printing */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50 print:hidden">
                    <h3 className="text-lg font-bold text-gray-800">Student Marksheet</h3>
                    <div className="flex items-center gap-3">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold shadow-sm">
                            <FiPrinter /> Print / PDF
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full transition">
                            <FiX size={24} />
                        </button>
                    </div>
                </div>

                {/* Marksheet Content - this is what gets printed */}
                <div ref={printRef} className="p-10 bg-white flex-1 overflow-y-auto print:overflow-visible text-gray-900 print:text-black printable-area">
                    {/* CSS for print styling specifically scoped to this component */}
                    <style>{`
                        @media print {
                            body * { visibility: hidden; }
                            .printable-area, .printable-area * { visibility: visible; }
                            .printable-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
                        }
                    `}</style>
                    
                    <div className="text-center mb-10 border-b-2 border-indigo-600 pb-6">
                        <h1 className="text-3xl font-extrabold text-indigo-900 uppercase tracking-wider mb-2">Statement of Marks</h1>
                        <h2 className="text-xl font-bold text-gray-700">{examName}</h2>
                    </div>

                    <div className="flex justify-between mb-8 text-lg">
                        <div>
                            <p><span className="font-semibold text-gray-600 w-32 inline-block">Student Name:</span> <span className="font-bold">{studentName}</span></p>
                            <p className="mt-2"><span className="font-semibold text-gray-600 w-32 inline-block">Roll Number:</span> <span className="font-bold">{rollNo}</span></p>
                        </div>
                        <div className="text-right">
                            <p><span className="font-semibold text-gray-600">Date:</span> {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <table className="w-full border-collapse border border-gray-300 mb-8 text-center text-sm">
                        <thead>
                            <tr className="bg-indigo-50 font-bold text-indigo-900">
                                <th className="border border-gray-300 p-3 text-left">Subject</th>
                                <th className="border border-gray-300 p-3" colSpan="3">Maximum Marks</th>
                                <th className="border border-gray-300 p-3" colSpan="3">Marks Obtained</th>
                            </tr>
                            <tr className="bg-gray-50 font-semibold text-gray-700">
                                <th className="border border-gray-300 p-2 text-left">Name</th>
                                <th className="border border-gray-300 p-2">Theory</th>
                                <th className="border border-gray-300 p-2">Practical</th>
                                <th className="border border-gray-300 p-2">Total</th>
                                <th className="border border-gray-300 p-2">Theory</th>
                                <th className="border border-gray-300 p-2">Practical</th>
                                <th className="border border-gray-300 p-2">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjectRows.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 p-3 text-left font-semibold">{row.name}</td>
                                    <td className="border border-gray-300 p-3">{row.thMax}</td>
                                    <td className="border border-gray-300 p-3">{row.prMax}</td>
                                    <td className="border border-gray-300 p-3 font-bold bg-gray-50/50">{row.subMaxTotal}</td>
                                    <td className="border border-gray-300 p-3">{row.thObt}</td>
                                    <td className="border border-gray-300 p-3">{row.prObt}</td>
                                    <td className="border border-gray-300 p-3 font-bold bg-gray-50/50">{row.subObtTotal}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-indigo-50 font-bold text-indigo-900 text-base">
                                <td className="border border-gray-300 p-4 text-right">Grand Total</td>
                                <td className="border border-gray-300 p-4" colSpan="2"></td>
                                <td className="border border-gray-300 p-4">{totalMax}</td>
                                <td className="border border-gray-300 p-4" colSpan="2"></td>
                                <td className="border border-gray-300 p-4 text-indigo-700 text-lg">{totalObtained}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="flex justify-between items-end border-t border-gray-200 pt-6 mt-8">
                        <div>
                            <p className="text-xl font-bold mb-1">
                                Percentage: <span className="text-indigo-600">{percentage}%</span>
                            </p>
                            <p className="text-lg font-bold">
                                Result: <span className={isPass ? 'text-green-600' : 'text-red-600'}>{isPass ? 'PASS' : 'FAIL'}</span>
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-48 border-b border-gray-400 mb-2"></div>
                            <p className="font-semibold text-gray-600">Principal Signature</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MarksheetPrintModal;
