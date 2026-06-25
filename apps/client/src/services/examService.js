import apiClient from '@services/apiClient';
import { withCache, invalidateCache } from '@services/cacheUtils';

const examService = {
    getExams: (collegeId, classId) => {
        const params = new URLSearchParams();
        if (collegeId) params.append('collegeId', collegeId);
        if (classId) params.append('classId', classId);
        const qs = params.toString();
        return withCache(`exams_${collegeId || 'all'}_${classId || 'all'}`, 
            () => apiClient.get(`/exam${qs ? `?${qs}` : ''}`));
    },

    createExam: async (payload) => {
        const res = await apiClient.post('/exam/create', payload);
        invalidateCache('exams_'); // Invalidate all exam caches
        return res;
    },

    getExamMarksheets: (examId) => {
        // Not heavily caching marksheets since they update frequently when grading
        return withCache(`marksheets_${examId}`, 
            () => apiClient.get(`/exam/${examId}/marksheets`), 30000); // 30s cache
    },

    bulkUpdateMarksheets: async (examId, payload) => {
        const res = await apiClient.put(`/exam/${examId}/marksheets/bulk`, payload);
        invalidateCache(`marksheets_${examId}`);
        return res;
    }
};

export default examService;
