import apiClient from '@services/apiClient';
import { withCache, invalidateCache } from '@services/cacheUtils';

/**
 * reportService — All API calls for the bi-weekly report module.
 * File uploads are sent as multipart/form-data.
 */
const reportService = {
    /**
     * Fetch reports.
     * @param {object} params - Optional filters: { collegeId, classId, studentId, periodIndex }
     */
    getReports: (params = {}) => {
        const qs = new URLSearchParams(
            Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
        ).toString();
        // create a unique key based on params
        const keyParams = Object.entries(params).filter(([, v]) => v != null && v !== '').map(([k, v]) => `${k}_${v}`).join('_');
        return withCache(`reports_${keyParams || 'all'}`, () => apiClient.get(`/academic/reports${qs ? `?${qs}` : ''}`));
    },

    getReport: (id) => withCache(`report_${id}`, () => apiClient.get(`/academic/reports/${id}`)),

    /**
     * Create a report with optional file attachment.
     * @param {object} data - { studentId, classId, periodIndex, topic, description, file? }
     */
    createReport: async (data) => {
        const form = new FormData();
        form.append('studentId',   data.studentId);
        form.append('classId',     data.classId);
        form.append('periodIndex', data.periodIndex);
        form.append('topic',       data.topic);
        form.append('description', data.description);
        if (data.file) form.append('attachment', data.file);
        const res = await apiClient.post('/academic/reports', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        invalidateCache('reports_');
        return res;
    },

    /**
     * Update an existing report.
     * @param {string} id - Report _id
     * @param {object} data - { topic?, description?, file? }
     */
    updateReport: async (id, data) => {
        const form = new FormData();
        if (data.topic)       form.append('topic',       data.topic);
        if (data.description) form.append('description', data.description);
        if (data.file)        form.append('attachment',  data.file);
        const res = await apiClient.put(`/academic/reports/${id}`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        invalidateCache('reports_');
        invalidateCache(`report_${id}`);
        return res;
    },

    deleteReport: async (id) => {
        const res = await apiClient.delete(`/academic/reports/${id}`);
        invalidateCache('reports_');
        invalidateCache(`report_${id}`);
        return res;
    },
};

export default reportService;
