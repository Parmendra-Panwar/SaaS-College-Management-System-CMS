import axios from 'axios';

// 1. Axios Instance Setup
const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1', // Aapne backend mein jo prefix rakha ho
    // http://localhost:8080/api/v1
    headers: {
        'Content-Type': 'application/json'
    }
});

// 2. Request Interceptor (Auto-send Token)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 3. Response Interceptor (Handle 401 Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Agar 401 hai AND request login API ke liye NAHI hai, tabhi redirect karo
        if (error.response && error.response.status === 401 && !error.config.url.includes('/auth/login')) {
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// 4. API Endpoint Functions
export const loginApi = (credentials) => api.post('/auth/login', credentials);

export const signupApi = (userData) => api.post('/auth/signup', userData);

export const profileApi = () => api.get('/auth/profile');

export default api;