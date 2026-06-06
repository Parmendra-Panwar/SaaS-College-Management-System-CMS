import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import academicService from '@services/academicService';
import { fetchLookups } from '@store/slices/lookupSlice';
import { useToast } from '@hooks/useToast';
import { SelectField, InputField } from '@components/ui';
import DataTable from '@components/DataTable';

const FeesModule = ({ user }) => {
    const toast = useToast();
    const dispatch = useDispatch();
    const { classes: globalClasses, accessibleColleges, loaded: lookupsLoaded } = useSelector(state => state.lookup);

    const [selectedCollegeId, setSelectedCollegeId] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');

    const [loading, setLoading] = useState(false);
    const [classFee, setClassFee] = useState(null);
    const [studentFees, setStudentFees] = useState([]);

    // Class Fee Setup State
    const [feeTypes, setFeeTypes] = useState([{ type: 'Tuition Fee', amount: '' }]);
    const [savingClassFee, setSavingClassFee] = useState(false);
    const [isEditingClassFee, setIsEditingClassFee] = useState(false);

    // Transaction Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudentFee, setSelectedStudentFee] = useState(null);
    const [transactionType, setTransactionType] = useState('Payment');
    const [transactionAmount, setTransactionAmount] = useState('');
    const [transactionRemark, setTransactionRemark] = useState('');
    const [savingTransaction, setSavingTransaction] = useState(false);

    // Receipts Modal State
    const [isReceiptsModalOpen, setIsReceiptsModalOpen] = useState(false);
    const [selectedReceiptsStudent, setSelectedReceiptsStudent] = useState(null);

    useEffect(() => {
        if (!lookupsLoaded) dispatch(fetchLookups());
    }, [dispatch, lookupsLoaded]);

    useEffect(() => {
        if (selectedCollegeId) {
            dispatch(fetchLookups(selectedCollegeId));
        }
    }, [dispatch, selectedCollegeId]);

    useEffect(() => {
        if (!lookupsLoaded) return;
        if (accessibleColleges?.length > 0 && !selectedCollegeId) {
            setSelectedCollegeId(accessibleColleges[0]._id);
        }
    }, [lookupsLoaded, accessibleColleges]);

    const derivedClasses = React.useMemo(() => {
        if (!selectedCollegeId || !globalClasses) return [];
        return globalClasses?.filter(c => String(c.collegeId?._id || c.collegeId) === String(selectedCollegeId));
    }, [selectedCollegeId, globalClasses]);

    useEffect(() => {
        if (derivedClasses.length > 0) {
            if (!derivedClasses.find(c => c._id === selectedClassId)) {
                setSelectedClassId(derivedClasses[0]._id);
            }
        } else {
            setSelectedClassId('');
            setClassFee(null);
            setStudentFees([]);
            setIsEditingClassFee(false);
        }
    }, [derivedClasses]);

    const fetchData = async () => {
        if (!selectedClassId) return;
        setLoading(true);
        try {
            const classRes = await academicService.getClassFee(selectedClassId);
            const fetchedClassFee = classRes.data.data;
            setClassFee(fetchedClassFee);

            if (fetchedClassFee) {
                // Populate the form in case they decide to edit
                setFeeTypes(fetchedClassFee.feeTypes.map(f => ({ type: f.type, amount: String(f.amount) })));

                const studentRes = await academicService.getStudentFees(selectedClassId);
                setStudentFees(studentRes.data.data || []);
            } else {
                setStudentFees([]);
                setFeeTypes([{ type: 'Tuition Fee', amount: '' }]);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load fees data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        setIsEditingClassFee(false); // Reset edit mode on class change
    }, [selectedClassId]);

    const handleAddFeeType = () => {
        setFeeTypes([...feeTypes, { type: '', amount: '' }]);
    };

    const handleFeeTypeChange = (index, field, value) => {
        const newTypes = [...feeTypes];
        newTypes[index][field] = value;
        setFeeTypes(newTypes);
    };

    const handleRemoveFeeType = (index) => {
        setFeeTypes(feeTypes.filter((_, i) => i !== index));
    };

    const handleSaveClassFee = async () => {
        const validFees = feeTypes.filter(f => f.type && f.amount);
        if (validFees.length === 0) return toast.error("Please add at least one fee type with amount.");

        setSavingClassFee(true);
        try {
            await academicService.setClassFee({
                classId: selectedClassId,
                feeTypes: validFees.map(f => ({ ...f, amount: Number(f.amount) }))
            });
            toast.success("Class fee settings saved. Student fee records created/updated!");
            setIsEditingClassFee(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to save class fee");
        } finally {
            setSavingClassFee(false);
        }
    };

    const openTransactionModal = (feeRecord) => {
        setSelectedStudentFee(feeRecord);
        setTransactionType('Payment');
        setTransactionAmount('');
        setTransactionRemark('');
        setIsModalOpen(true);
    };

    const handleSaveTransaction = async () => {
        if (!transactionAmount || Number(transactionAmount) <= 0) return toast.error("Valid amount required");

        setSavingTransaction(true);
        try {
            await academicService.addFeeTransaction(selectedStudentFee.studentId._id, {
                type: transactionType,
                amount: transactionAmount,
                remark: transactionRemark
            });
            toast.success("Transaction added successfully");
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to add transaction");
        } finally {
            setSavingTransaction(false);
        }
    };

    const openReceiptsModal = (feeRecord) => {
        setSelectedReceiptsStudent(feeRecord);
        setIsReceiptsModalOpen(true);
    };

    return (
        <div className="max-w-[1305px] mx-auto px-6 py-10 w-full animate-in fade-in duration-500 bg-[#FDFCF0] min-h-screen">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {(user.role === 'Admin' || user.role === 'Manager') && (
                    <SelectField label="Select College" value={selectedCollegeId} onChange={e => setSelectedCollegeId(e.target.value)}>
                        {accessibleColleges?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </SelectField>
                )}
                <SelectField label="Select Class" value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
                    {derivedClasses.length === 0 && <option value="">No Classes Found</option>}
                    {derivedClasses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </SelectField>
            </div>

            {loading ? (
                <div className="py-10 text-center font-semibold text-gray-500">Loading fees data...</div>
            ) : !selectedClassId ? (
                <div className="py-10 text-center font-semibold text-gray-500">Please select a class to manage fees.</div>
            ) : (!classFee || isEditingClassFee) ? (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">
                        {classFee ? 'Edit Global Fees for this Class' : 'Setup Global Fees for this Class'}
                    </h2>

                    {user.role === 'Teacher' ? (
                        <div className="py-10 text-center font-semibold text-rose-500 bg-rose-50 rounded-xl p-6 border border-rose-100">
                            The global fee structure has not been set for this class. Please contact the Administrator to configure the fees before you can manage individual students.
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-500 mb-6">This will automatically apply to individual fee records for all enrolled students.</p>

                            <div className="space-y-4 mb-6">
                                {feeTypes.map((fee, index) => (
                                    <div key={index} className="flex gap-4 items-end">
                                        <div className="flex-1">
                                            <InputField label="Fee Type" value={fee.type} onChange={(e) => handleFeeTypeChange(index, 'type', e.target.value)} placeholder="e.g. Tuition Fee" />
                                        </div>
                                        <div className="flex-1">
                                            <InputField type="number" label="Amount (₹)" value={fee.amount} onChange={(e) => handleFeeTypeChange(index, 'amount', e.target.value)} placeholder="e.g. 50000" />
                                        </div>
                                        <button onClick={() => handleRemoveFeeType(index)} className="mb-2 p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition" title="Remove">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <button onClick={handleAddFeeType} className="font-bold text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-xl transition">
                                    + Add Fee Type
                                </button>
                                <div className="ml-auto flex gap-3">
                                    {classFee && (
                                        <button onClick={() => setIsEditingClassFee(false)} className="font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 py-2.5 px-6 rounded-xl transition">
                                            Cancel
                                        </button>
                                    )}
                                    <button onClick={handleSaveClassFee} disabled={savingClassFee} className="bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-indigo-700 transition shadow-md disabled:opacity-50">
                                        {savingClassFee ? 'Saving...' : (classFee ? 'Update & Sync Student Fees' : 'Save & Generate Student Fees')}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-gray-800">Student Fees Roster</h2>
                            {user.role !== 'Teacher' && (
                                <button onClick={() => setIsEditingClassFee(true)} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    Edit Global Fee
                                </button>
                            )}
                        </div>
                        <div className="text-sm bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold">
                            Total Class Fee: ₹{classFee.totalAmount}
                        </div>
                    </div>
                    <DataTable
                        columns={[
                            { header: 'Student Name', accessor: s => s.studentId?.user?.username || 'Unknown' },
                            { header: 'Roll No.', accessor: s => s.studentId?.roll_number || 'N/A' },
                            { header: 'Total Fee', accessor: s => `₹${s.totalAmount}` },
                            { header: 'Total Paid', accessor: s => `₹${s.totalPaid}` },
                            {
                                header: 'Balance',
                                accessor: s => {
                                    const balance = s.totalAmount - s.totalPaid;
                                    return <span className={balance > 0 ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>₹{balance}</span>;
                                }
                            },
                            {
                                header: 'Actions',
                                accessor: s => (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openTransactionModal(s)} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg font-bold text-sm transition border border-transparent hover:border-indigo-100">
                                            Manage
                                        </button>
                                        <button onClick={() => openReceiptsModal(s)} className="text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg font-bold text-sm transition border border-gray-200 shadow-sm">
                                            View Receipts
                                        </button>
                                    </div>
                                )
                            }
                        ]}
                        data={studentFees}
                    />
                </div>
            )}

            {/* Transaction Modal */}
            {isModalOpen && selectedStudentFee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Manage Fee</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-500">Student</p>
                            <p className="font-bold text-gray-900">{selectedStudentFee.studentId?.user?.username}</p>
                        </div>

                        <div className="space-y-4">
                            <SelectField label="Transaction Type" value={transactionType} onChange={e => setTransactionType(e.target.value)}>
                                <option value="Payment">Payment (Receive Money)</option>
                                <option value="Concession">Concession (Reduce Fee)</option>
                            </SelectField>
                            <InputField type="number" label="Amount (₹)" value={transactionAmount} onChange={e => setTransactionAmount(e.target.value)} placeholder="e.g. 5000" />
                            <InputField label="Remarks" value={transactionRemark} onChange={e => setTransactionRemark(e.target.value)} placeholder="e.g. Check #1234 or Scholarship" />
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">Cancel</button>
                            <button onClick={handleSaveTransaction} disabled={savingTransaction} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md disabled:opacity-50">
                                {savingTransaction ? 'Saving...' : 'Save Transaction'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipts Modal */}
            {isReceiptsModalOpen && selectedReceiptsStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Transaction History</h3>
                                <p className="text-sm font-semibold text-gray-500 mt-1">
                                    Student: <span className="text-gray-800">{selectedReceiptsStudent.studentId?.user?.username}</span>
                                </p>
                            </div>
                            <button onClick={() => setIsReceiptsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar border rounded-xl">
                            {selectedReceiptsStudent.receipts && selectedReceiptsStudent.receipts.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="p-4 font-bold text-gray-500 text-sm border-b">Date</th>
                                            <th className="p-4 font-bold text-gray-500 text-sm border-b">Type</th>
                                            <th className="p-4 font-bold text-gray-500 text-sm border-b">Amount</th>
                                            <th className="p-4 font-bold text-gray-500 text-sm border-b">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedReceiptsStudent.receipts.map((receipt, idx) => (
                                            <tr key={idx} className="border-b hover:bg-gray-50/50 transition">
                                                <td className="p-4 text-sm font-semibold text-gray-700 whitespace-nowrap">
                                                    {new Date(receipt.date).toLocaleDateString()}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold ${receipt.type === 'Payment'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {receipt.type}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm font-bold text-gray-900">
                                                    ₹{receipt.amount}
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">
                                                    {receipt.remark || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="py-12 text-center text-gray-500 font-semibold flex flex-col items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    No transactions recorded yet.
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end shrink-0">
                            <button onClick={() => setIsReceiptsModalOpen(false)} className="py-2.5 px-8 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeesModule;
