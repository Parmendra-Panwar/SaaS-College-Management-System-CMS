import apiClient from '@services/apiClient';
import { withCache, invalidateCache } from '@services/cacheUtils';

const academicService = {
    getDepartments: (collegeId) => withCache(`departments_${collegeId || 'all'}`, 
        () => apiClient.get(`/academic/departments${collegeId ? `?collegeId=${collegeId}` : ''}`)),
        
    getClasses: (collegeId) => withCache(`classes_${collegeId || 'all'}`, 
        () => apiClient.get(`/academic/classes${collegeId ? `?collegeId=${collegeId}` : ''}`)),
        
    getAccessibleColleges: () => withCache(`accessible_colleges`, 
        () => apiClient.get('/academic/accessible-colleges')),
    
    getEntities: (type, collegeId) => withCache(`entities_${type}_${collegeId || 'all'}`, 
        () => apiClient.get(`/academic/${type}${collegeId ? `?collegeId=${collegeId}` : ''}`)),
        
    createEntity: async (type, payload) => {
        const res = await apiClient.post(`/academic/${type}`, payload);
        invalidateCache(`entities_${type}`);
        invalidateCache(type); // invalidate specific getters if any
        return res;
    },
    
    updateEntity: async (type, id, payload) => {
        const res = await apiClient.put(`/academic/${type}/${id}`, payload);
        invalidateCache(`entities_${type}`);
        invalidateCache(type);
        return res;
    },
    
    deleteEntity: async (type, id) => {
        const res = await apiClient.delete(`/academic/${type}/${id}`);
        invalidateCache(`entities_${type}`);
        invalidateCache(type);
        return res;
    },

    getStudents: (collegeId, classId) => {
        const params = new URLSearchParams();
        if (collegeId) params.append('collegeId', collegeId);
        if (classId) params.append('classId', classId);
        const qs = params.toString();
        return withCache(`students_${collegeId || 'all'}_${classId || 'all'}`, 
            () => apiClient.get(`/academic/students${qs ? `?${qs}` : ''}`));
    },
    
    getTeachers: (collegeId) => withCache(`teachers_${collegeId || 'all'}`, 
        () => apiClient.get(`/academic/teachers${collegeId ? `?collegeId=${collegeId}` : ''}`)),
        
    // Attendance queries shouldn't be heavily cached if they change often, but a short TTL is fine to prevent rapid reloads. We'll use 1 min.
    getAttendanceQuery: (classId, date) => withCache(`attendance_${classId}_${date}`, 
        () => apiClient.get(`/academic/attendance/query?classId=${classId}&date=${date}`), 60000),
        
    markAttendance: async (payload) => {
        const res = await apiClient.post('/academic/attendance/mark', payload);
        invalidateCache(`attendance_${payload.classId}`);
        return res;
    },

    // Fees
    getClassFee: (classId) => withCache(`class_fee_${classId}`, 
        () => apiClient.get(`/academic/fees/class/${classId}`)),
        
    setClassFee: async (payload) => {
        const res = await apiClient.post('/academic/fees/class', payload);
        invalidateCache(`class_fee_${payload.classId}`);
        invalidateCache(`student_fees_${payload.classId}`);
        return res;
    },
    
    getStudentFees: (classId) => withCache(`student_fees_${classId}`, 
        () => apiClient.get(`/academic/fees/students?classId=${classId}`)),
        
    addFeeTransaction: async (studentId, payload) => {
        const res = await apiClient.post(`/academic/fees/student/${studentId}/transaction`, payload);
        // Invalidating all student fees to ensure data freshness
        invalidateCache(`student_fees_`);
        return res;
    },

    // Productivity
    getProductivityByClass: (classId) => withCache(`productivity_${classId}`, 
        () => apiClient.get(`/insights/productivity/class/${classId}`)),
};

export default academicService;
