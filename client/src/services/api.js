import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth APIs
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
};

// Job APIs
export const jobAPI = {
    create: (data) => api.post('/jobs', data),
    getAll: () => api.get('/jobs'),
    getById: (id) => api.get(`/jobs/${id}`),
    updateStatus: (id, status) => api.put(`/jobs/${id}/status`, { status }),
};

// Application APIs
export const applicationAPI = {
    submit: (data) => api.post('/applications/submit', data),
    getCandidates: (jobId) => api.get(`/applications/candidates?jobId=${jobId}`),
    updateStatus: (id, status) => api.patch(`/applications/${id}/status`, { status }),
};

// Upload API
export const uploadAPI = {
    uploadResume: (file) => {
        const formData = new FormData();
        formData.append('resume', file);
        return api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

export default api;
