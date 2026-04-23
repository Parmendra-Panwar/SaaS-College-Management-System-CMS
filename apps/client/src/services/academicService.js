import apiClient from './apiClient';

const academicService = {
    getDepartments: () => apiClient.get('/academic/departments'),
    getClasses: () => apiClient.get('/academic/classes'),
    getAccessibleColleges: () => apiClient.get('/academic/accessible-colleges'),
    
    getEntities: (type) => apiClient.get(`/academic/${type}`),
    createEntity: (type, payload) => apiClient.post(`/academic/${type}`, payload),
    updateEntity: (type, id, payload) => apiClient.put(`/academic/${type}/${id}`, payload),
    deleteEntity: (type, id) => apiClient.delete(`/academic/${type}/${id}`),

    getStudents: () => apiClient.get('/academic/students'),
    getAttendanceQuery: (classId, date) => apiClient.get(`/academic/attendance/query?classId=${classId}&date=${date}`),
    markAttendance: (payload) => apiClient.post('/academic/attendance/mark', payload),
};

export default academicService;
