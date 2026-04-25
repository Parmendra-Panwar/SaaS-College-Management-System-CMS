import apiClient from '@services/apiClient';

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
        return apiClient.get(`/academic/reports${qs ? `?${qs}` : ''}`);
    },

    getReport: (id) => apiClient.get(`/academic/reports/${id}`),

    /**
     * Create a report with optional file attachment.
     * @param {object} data - { studentId, classId, periodIndex, topic, description, file? }
     */
    createReport: (data) => {
        const form = new FormData();
        form.append('studentId',   data.studentId);
        form.append('classId',     data.classId);
        form.append('periodIndex', data.periodIndex);
        form.append('topic',       data.topic);
        form.append('description', data.description);
        if (data.file) form.append('attachment', data.file);
        return apiClient.post('/academic/reports', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    /**
     * Update an existing report.
     * @param {string} id - Report _id
     * @param {object} data - { topic?, description?, file? }
     */
    updateReport: (id, data) => {
        const form = new FormData();
        if (data.topic)       form.append('topic',       data.topic);
        if (data.description) form.append('description', data.description);
        if (data.file)        form.append('attachment',  data.file);
        return apiClient.put(`/academic/reports/${id}`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    deleteReport: (id) => apiClient.delete(`/academic/reports/${id}`),
};

export default reportService;
