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
    
    const [feeTypes, setFeeTypes] = useState([{ type: 'Tuition Fee', amount: '' }]);
    const [savingClassFee, setSavingClassFee] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudentFee, setSelectedStudentFee] = useState(null);
    const [transactionType, setTransactionType] = useState('Payment');
    const [transactionAmount, setTransactionAmount] = useState('');
    const [transactionRemark, setTransactionRemark] = useState('');
    const [savingTransaction, setSavingTransaction] = useState(false);

    useEffect(() => {
        if (!lookupsLoaded) dispatch(fetchLookups());
    }, [dispatch, lookupsLoaded]);

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
            ) : !classFee ? (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Setup Global Fees for this Class</h2>
                    <p className="text-gray-500 mb-6">This will automatically generate individual fee records for all enrolled students.</p>
                    
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
                        <button onClick={handleSaveClassFee} disabled={savingClassFee} className="ml-auto bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-indigo-700 transition shadow-md disabled:opacity-50">
                            {savingClassFee ? 'Saving...' : 'Save & Generate Student Fees'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Student Fees Roster</h2>
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
                                header: 'Action',
                                accessor: s => (
                                    <button onClick={() => openTransactionModal(s)} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg font-bold text-sm transition">
                                        Manage
                                    </button>
                                )
                            }
                        ]}
                        data={studentFees}
                    />
                </div>
            )}

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
        </div>
    );
};

export default FeesModule;
