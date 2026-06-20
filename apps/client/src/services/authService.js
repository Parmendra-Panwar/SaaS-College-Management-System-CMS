import apiClient from '@services/apiClient';

export const loginApi = (credentials) => apiClient.post('/auth/login', credentials);
export const signupApi = (userData) => apiClient.post('/auth/signup', userData);
export const profileApi = () => apiClient.get('/auth/profile');