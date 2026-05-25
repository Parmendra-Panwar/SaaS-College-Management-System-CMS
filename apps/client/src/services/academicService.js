import apiClient from '@services/apiClient';

const academicService = {
    getDepartments: (collegeId) => apiClient.get(`/academic/departments${collegeId ? `?collegeId=${collegeId}` : ''}`),
    getClasses: (collegeId) => apiClient.get(`/academic/classes${collegeId ? `?collegeId=${collegeId}` : ''}`),
    getAccessibleColleges: () => apiClient.get('/academic/accessible-colleges'),
    
    getEntities: (type, collegeId) => apiClient.get(`/academic/${type}${collegeId ? `?collegeId=${collegeId}` : ''}`),
    createEntity: (type, payload) => apiClient.post(`/academic/${type}`, payload),
    updateEntity: (type, id, payload) => apiClient.put(`/academic/${type}/${id}`, payload),
    deleteEntity: (type, id) => apiClient.delete(`/academic/${type}/${id}`),

    getStudents: (collegeId, classId) => {
        const params = new URLSearchParams();
        if (collegeId) params.append('collegeId', collegeId);
        if (classId) params.append('classId', classId);
        const qs = params.toString();
        return apiClient.get(`/academic/students${qs ? `?${qs}` : ''}`);
    },
    getTeachers: (collegeId) => apiClient.get(`/academic/teachers${collegeId ? `?collegeId=${collegeId}` : ''}`),
    getAttendanceQuery: (classId, date) => apiClient.get(`/academic/attendance/query?classId=${classId}&date=${date}`),
    markAttendance: (payload) => apiClient.post('/academic/attendance/mark', payload),

    // Fees
    getClassFee: (classId) => apiClient.get(`/academic/fees/class/${classId}`),
    setClassFee: (payload) => apiClient.post('/academic/fees/class', payload),
    getStudentFees: (classId) => apiClient.get(`/academic/fees/students?classId=${classId}`),
    addFeeTransaction: (studentId, payload) => apiClient.post(`/academic/fees/student/${studentId}/transaction`, payload),
};

export default academicService;
