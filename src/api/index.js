import axios from 'axios';

// Create axios instance
const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000', // Laravel server
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: true // Crucial for Sanctum
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
    (response) => {
        console.log(`[API Success] ${response.config.method.toUpperCase()} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('[API Error]', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Function to get CSRF cookie
export const initializeCSRF = async () => {
    try {
        // Get CSRF cookie from Sanctum
        await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {
            withCredentials: true,
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        console.log('✅ CSRF cookie set successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to get CSRF cookie:', error.message);
        return false;
    }
};

// Initialize CSRF on module load
initializeCSRF();

// Auth endpoints - Match your Laravel routes
export const authApi = {
    async login(credentials) {
        console.log('🔐 Attempting login...');
        await initializeCSRF(); // Ensure CSRF cookie is set
        return apiClient.post('/api/login', credentials);
    },
    
    async register(userData) {
        console.log('📝 Attempting registration...');
        await initializeCSRF(); // Ensure CSRF cookie is set
        return apiClient.post('/api/register', userData);
    },
    
    async logout() {
        console.log('🚪 Logging out...');
        const response = await apiClient.post('/api/logout');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return response;
    },
    
    async getUser() {
        // Since your routes don't have /user endpoint, you might need to:
        // 1. Add it to your Laravel routes, OR
        // 2. Get user info from the token
        console.warn('⚠️ /api/user endpoint not defined in your routes');
        return Promise.reject(new Error('User endpoint not available'));
    }
};

// Todo endpoints - Match your Laravel routes
export const todoApi = {
    getAll() {
        return apiClient.get('/api/todos');
    },
    get(id) {
        return apiClient.get(`/api/todos/${id}`);
    },
    create(todo) {
        return apiClient.post('/api/todos', todo);
    },
    update(id, todo) {
        return apiClient.put(`/api/todos/${id}`, todo);
    },
    delete(id) {
        return apiClient.delete(`/api/todos/${id}`);
    }
};

export default apiClient;