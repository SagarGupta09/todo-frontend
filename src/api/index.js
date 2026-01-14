import axios from 'axios';

// Create axios instance
const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: true
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
        console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
    },
    (error) => {
        console.error(`❌ ${error.config?.method} ${error.config?.url} - ${error.response?.status || 'No Status'}`);
        console.error('Error data:', error.response?.data);
        
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
        await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {
            withCredentials: true
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

// Auth endpoints
export const authApi = {
    async login(credentials) {
        console.log('🔐 Attempting login...');
        await initializeCSRF();
        return apiClient.post('/api/login', credentials);
    },
    
    async register(userData) {
        console.log('📝 Attempting registration...');
        await initializeCSRF();
        return apiClient.post('/api/register', userData);
    },
    
    async logout() {
        console.log('🚪 Logging out...');
        const response = await apiClient.post('/api/logout');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return response;
    },
    
    // FIXED: Now this will work since we added the endpoint
    async getUser() {
        console.log('👤 Fetching user data...');
        return apiClient.get('/api/user');
    },
    
    async refreshUser() {
        try {
            console.log('🔄 Refreshing user data from server...');
            const response = await this.getUser();
            console.log('✅ User data refreshed:', response.data.user);
            return response.data.user;
        } catch (error) {
            console.error('❌ Failed to refresh user:', error);
            return null;
        }
    }
};

// Todo endpoints
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