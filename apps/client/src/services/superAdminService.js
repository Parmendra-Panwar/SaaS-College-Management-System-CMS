import apiClient from '@services/apiClient';
import { withCache, invalidateCache } from '@services/cacheUtils';

const superAdminService = {
    login: (credentials) => apiClient.post('/base/superadmin/login', credentials),
    getColleges: () => withCache('sa_colleges', () => apiClient.get('/base/superadmin/colleges')),
    getManagers: () => withCache('sa_managers', () => apiClient.get('/base/superadmin/managers')),
    getCollegeRequests: () => withCache('sa_requests', () => apiClient.get('/base/superadmin/college-requests')),
    
    onboardCollege: async (formData) => {
        const res = await apiClient.post('/base/superadmin/onboard-college', formData);
        invalidateCache('sa_colleges');
        return res;
    },
    updateCollege: async (id, data) => {
        const res = await apiClient.put(`/base/superadmin/college/${id}`, data);
        invalidateCache('sa_colleges');
        return res;
    },
    createManager: async (managerForm) => {
        const res = await apiClient.post('/base/superadmin/create-manager', managerForm);
        invalidateCache('sa_managers');
        return res;
    },
    updateManager: async (id, managerForm) => {
        const res = await apiClient.put(`/base/superadmin/manager/${id}`, managerForm);
        invalidateCache('sa_managers');
        return res;
    },
    deleteManager: async (id) => {
        const res = await apiClient.delete(`/base/superadmin/manager/${id}`);
        invalidateCache('sa_managers');
        return res;
    },
    approveCollegeRequest: async (id) => {
        const res = await apiClient.post(`/base/superadmin/college-requests/${id}/approve`, {});
        invalidateCache('sa_requests');
        invalidateCache('sa_colleges');
        return res;
    },
};

export default superAdminService;
