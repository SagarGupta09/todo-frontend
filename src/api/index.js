import axios from 'axios';

// Create axios instance
const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000', // Note: removed /api from baseURL
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true // IMPORTANT: This sends cookies with requests
});

// Request interceptor to add token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// NEW: Function to get CSRF cookie before making API calls
export const initializeCSRF = async () => {
    try {
        // Get CSRF cookie from Laravel Sanctum endpoint
        await apiClient.get('/sanctum/csrf-cookie');
        console.log('CSRF cookie set successfully');
        return true;
    } catch (error) {
        console.error('Failed to get CSRF cookie:', error);
        return false;
    }
};

// Auth endpoints (updated with full paths)
export const authApi = {
    async login(credentials) {
        // First ensure CSRF cookie is set
        await initializeCSRF();
        return apiClient.post('/api/login', credentials);
    },
    async register(userData) {
        // First ensure CSRF cookie is set
        await initializeCSRF();
        return apiClient.post('/api/register', userData);
    },
    async logout() {
        await apiClient.post('/api/logout');
        // Clear local storage after logout
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    async user() {
        return apiClient.get('/api/user');
    }
};

// Task endpoints (updated with full paths)
export const taskApi = {
    getAll() {
        return apiClient.get('/api/todos'); // Changed from /tasks to /api/todos
    },
    get(id) {
        return apiClient.get(`/api/todos/${id}`); // Changed from /tasks
    },
    create(task) {
        return apiClient.post('/api/todos', task); // Changed from /tasks
    },
    update(id, task) {
        return apiClient.put(`/api/todos/${id}`, task); // Changed from /tasks
    },
    delete(id) {
        return apiClient.delete(`/api/todos/${id}`); // Changed from /tasks
    }
};

export default apiClient;