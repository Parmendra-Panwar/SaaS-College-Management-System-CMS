import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLookups } from '@store/slices/lookupSlice';
import reportService from '@services/reportService';
import academicService from '@services/academicService';
import { useToast } from '@hooks/useToast';
import { SelectField, InputField } from '@components/ui';
import DataTable from '@components/DataTable';

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIODS = Array.from({ length: 26 }, (_, i) => ({
    value: i + 1,
    label: `Period ${i + 1}`,
}));

const EMPTY_FORM = {
    studentId: '',
    periodIndex: '',
    topic: '',
    description: '',
    file: null,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Badge = ({ submitted }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
        ${submitted ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
        {submitted ? '✓ Submitted' : 'Pending'}
    </span>
);

const FilePreview = ({ url }) => {
    if (!url) return <span className="text-gray-400 text-sm">No attachment</span>;
    const isImage = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);
    return isImage
        ? <a href={url} target="_blank" rel="noreferrer" className="block">
            <img src={url} alt="attachment" className="h-16 w-24 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition" />
        </a>
        : <a href={url} target="_blank" rel="noreferrer"
            className="text-indigo-600 hover:underline text-sm font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            View File
        </a>;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ReportModule = ({ user }) => {
    const toast = useToast();
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);

    const { classes: globalClasses, accessibleColleges, loaded: lookupsLoaded } = useSelector(s => s.lookup);

    // ── Filter state ──
    const [selectedCollegeId, setSelectedCollegeId] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');

    // ── Data state ──
    const [students, setStudents] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);

    // ── Modal / form state ──
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null); // null = create, string = update
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // reportId to confirm delete

    // ─── Load lookups ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!lookupsLoaded) dispatch(fetchLookups());
    }, [dispatch, lookupsLoaded]);

    useEffect(() => {
        if (selectedCollegeId) {
            dispatch(fetchLookups(selectedCollegeId));
        }
    }, [dispatch, selectedCollegeId]);

    // Auto-select first college
    useEffect(() => {
        if (!lookupsLoaded) return;
        if (accessibleColleges?.length > 0 && !selectedCollegeId) {
            setSelectedCollegeId(String(accessibleColleges[0]._id));
        }
    }, [lookupsLoaded, accessibleColleges]);

    // Derived classes for selected college
    const derivedClasses = React.useMemo(() => {
        if (!selectedCollegeId || !globalClasses) return [];
        return globalClasses.filter(c => String(c.collegeId?._id || c.collegeId) === selectedCollegeId);
    }, [selectedCollegeId, globalClasses]);

    // Auto-select first class
    useEffect(() => {
        if (derivedClasses.length > 0) {
            if (!derivedClasses.find(c => String(c._id) === selectedClassId)) {
                setSelectedClassId(String(derivedClasses[0]._id));
            }
        } else {
            setSelectedClassId('');
            setStudents([]);
            setReports([]);
        }
    }, [derivedClasses]);

    // ─── Fetch students + reports ──────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        if (!selectedClassId || !selectedCollegeId) return;
        setLoading(true);
        try {
            const [studentRes, reportRes] = await Promise.all([
                academicService.getStudents(selectedCollegeId, selectedClassId),
                reportService.getReports({ collegeId: selectedCollegeId, classId: selectedClassId }),
            ]);
            const classStudents = (studentRes.data.data || []).filter(
                s => String(s.class?._id || s.class) === selectedClassId
            );
            setStudents(classStudents);
            setReports(reportRes.data.data || []);
        } catch {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    }, [selectedClassId, selectedCollegeId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ─── Form helpers ──────────────────────────────────────────────────────────
    const openCreate = () => {
        setForm({ ...EMPTY_FORM, studentId: students[0]?._id || '' });
        setEditingId(null);
        setShowForm(true);
    };

    const openEdit = (report) => {
        setForm({
            studentId: String(report.studentId?._id || report.studentId),
            periodIndex: String(report.periodIndex),
            topic: report.topic,
            description: report.description,
            file: null,
        });
        setEditingId(report._id);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'file') {
            setForm(prev => ({ ...prev, file: files[0] || null }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.studentId || !form.periodIndex || !form.topic || !form.description) {
            return toast.error("Please fill all required fields");
        }
        setSaving(true);
        try {
            if (editingId) {
                await reportService.updateReport(editingId, {
                    topic: form.topic,
                    description: form.description,
                    file: form.file,
                });
                toast.success("Report updated!");
            } else {
                await reportService.createReport({
                    studentId: form.studentId,
                    classId: selectedClassId,
                    periodIndex: form.periodIndex,
                    topic: form.topic,
                    description: form.description,
                    file: form.file,
                });
                toast.success("Report created!");
            }
            closeForm();
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to save report");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (reportId) => {
        try {
            await reportService.deleteReport(reportId);
            toast.success("Report deleted");
            setDeleteConfirm(null);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to delete report");
        }
    };

    // ─── Lookup: map studentId → reportStatus from student record ─────────────
    const studentStatusMap = React.useMemo(() => {
        const map = {};
        students.forEach(s => { map[s._id] = s.reportStatus || []; });
        return map;
    }, [students]);

    // ─── Reports grouped by student (for the overview table) ──────────────────
    const reportsByStudent = React.useMemo(() => {
        const map = {};
        reports.forEach(r => {
            const sid = String(r.studentId?._id || r.studentId);
            if (!map[sid]) map[sid] = [];
            map[sid].push(r);
        });
        return map;
    }, [reports]);

    const canManage = ['Admin', 'Manager', 'Principal', 'Teacher'].includes(user?.role);

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="max-w-[1305px] mx-auto px-6 py-10 w-full animate-in fade-in duration-500 bg-[#FDFCF0] min-h-screen">

            {/* ── Filters ── */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {(user?.role === 'Admin' || user?.role === 'Manager') && (
                    <SelectField label="Select College" value={selectedCollegeId}
                        onChange={e => setSelectedCollegeId(e.target.value)}>
                        {accessibleColleges?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </SelectField>
                )}
                <SelectField label="Select Class" value={selectedClassId}
                    onChange={e => setSelectedClassId(e.target.value)}>
                    {derivedClasses.length === 0 && <option value="">No Classes</option>}
                    {derivedClasses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </SelectField>
            </div>

            {/* ── Reports Table ── */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        Bi-Weekly Reports
                        {reports.length > 0 && (
                            <span className="ml-2 text-sm font-normal text-gray-400">({reports.length} records)</span>
                        )}
                    </h2>
                    {canManage && (
                        <button onClick={openCreate} disabled={!selectedClassId}
                            className="bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-indigo-700 transition shadow-md disabled:opacity-50 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Add Report
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="py-10 text-center font-semibold text-gray-500">Loading reports…</div>
                ) : reports.length === 0 ? (
                    <div className="py-10 text-center">
                        <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <p className="text-gray-400 font-semibold">No reports yet. Select a class and click Add Report.</p>
                    </div>
                ) : (
                    <DataTable
                        columns={[
                            { header: 'Student', accessor: r => r.studentId?.user?.username || '—' },
                            { header: 'Roll No.', accessor: r => r.studentId?.roll_number || '—' },
                            { header: 'Period', accessor: r => `Period ${r.periodIndex}` },
                            { header: 'Topic', accessor: r => r.topic },
                            {
                                header: 'Description', accessor: r => (
                                    <span className="line-clamp-2 text-sm text-gray-600 max-w-xs">{r.description}</span>
                                )
                            },
                            { header: 'Attachment', accessor: r => <FilePreview url={r.attachmentUrl} /> },
                            { header: 'Submitted By', accessor: r => r.submittedBy?.username || '—' },
                            ...(canManage ? [{
                                header: 'Actions',
                                accessor: r => (
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(r)}
                                            className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition">
                                            Edit
                                        </button>
                                        <button onClick={() => setDeleteConfirm(r._id)}
                                            className="text-xs bg-rose-50 text-rose-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-rose-100 transition">
                                            Delete
                                        </button>
                                    </div>
                                )
                            }] : [])
                        ]}
                        data={reports}
                    />
                )}
            </div>

            {/* ── Student Submission Overview ── */}
            {students.length > 0 && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Student Submission Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {students.map(s => {
                            const status = studentStatusMap[s._id] || [];
                            const submitted = status.filter(Boolean).length;
                            return (
                                <div key={s._id} className="border border-gray-100 rounded-2xl p-4 hover:shadow-md transition">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-extrabold text-base uppercase">
                                            {s.user?.username?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{s.user?.username || '—'}</p>
                                            <p className="text-gray-400 text-xs">Roll: {s.roll_number}</p>
                                        </div>
                                        <span className="ml-auto text-xs font-semibold text-indigo-600">
                                            {submitted}/26
                                        </span>
                                    </div>
                                    {/* 26-cell progress grid */}
                                    <div className="grid grid-cols-13 gap-1">
                                        {Array.from({ length: 26 }, (_, i) => (
                                            <div key={i} title={`Period ${i + 1}`}
                                                className={`h-2.5 w-2.5 rounded-sm transition-colors
                                                    ${status[i] ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                                        ))}
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-emerald-400 h-full rounded-full transition-all"
                                                style={{ width: `${(submitted / 26) * 100}%` }} />
                                        </div>
                                        <span className="text-xs text-gray-400">{Math.round((submitted / 26) * 100)}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Create / Edit Modal ── */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
                        <button onClick={closeForm}
                            className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <h3 className="text-lg font-bold text-gray-900 mb-6">
                            {editingId ? 'Edit Report' : 'Create Report'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Student (only for create) */}
                            {!editingId && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Student *</label>
                                    <select name="studentId" value={form.studentId} onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition">
                                        <option value="">Select student…</option>
                                        {students.map(s => (
                                            <option key={s._id} value={s._id}>
                                                {s.user?.username} (Roll: {s.roll_number})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Period (only for create) */}
                            {!editingId && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Bi-Weekly Period *</label>
                                    <select name="periodIndex" value={form.periodIndex} onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition">
                                        <option value="">Select period…</option>
                                        {PERIODS.map(p => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <InputField label="Topic *" name="topic" value={form.topic}
                                onChange={handleChange} placeholder="e.g. Mid-term Progress Review" />

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                                <textarea name="description" value={form.description} onChange={handleChange}
                                    rows={4} placeholder="Write a detailed report…"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Attachment <span className="text-gray-400 font-normal">(optional — photo or file)</span>
                                </label>
                                <input ref={fileInputRef} type="file" name="file" onChange={handleChange}
                                    accept="image/*,application/pdf"
                                    className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-semibold hover:file:bg-indigo-100 cursor-pointer" />
                                {form.file && (
                                    <p className="mt-1 text-xs text-gray-500">Selected: {form.file.name}</p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeForm}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition disabled:opacity-60 flex justify-center items-center gap-2">
                                    {saving && (
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    )}
                                    {saving ? 'Saving…' : (editingId ? 'Update Report' : 'Create Report')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation ── */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Report?</h3>
                        <p className="text-gray-500 text-sm mb-6">This action cannot be undone. The submission status will also be reset.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportModule;
