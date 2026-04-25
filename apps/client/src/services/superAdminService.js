import apiClient from '@services/apiClient';

const superAdminService = {
    login: (credentials) => apiClient.post('/base/superadmin/login', credentials),
    getColleges: () => apiClient.get('/base/superadmin/colleges'),
    getManagers: () => apiClient.get('/base/superadmin/managers'),
    getCollegeRequests: () => apiClient.get('/base/superadmin/college-requests'),
    onboardCollege: (formData) => apiClient.post('/base/superadmin/onboard-college', formData),
    createManager: (managerForm) => apiClient.post('/base/superadmin/create-manager', managerForm),
    updateManager: (id, managerForm) => apiClient.put(`/base/superadmin/manager/${id}`, managerForm),
    deleteManager: (id) => apiClient.delete(`/base/superadmin/manager/${id}`),
    approveCollegeRequest: (id) => apiClient.post(`/base/superadmin/college-requests/${id}/approve`, {}),
};

export default superAdminService;
