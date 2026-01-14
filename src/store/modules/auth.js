import { authApi } from '@/api';

const state = {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    isAuthenticated: !!localStorage.getItem('token')
};

const mutations = {
    SET_TOKEN(state, token) {
        state.token = token;
        localStorage.setItem('token', token);
    },
    SET_USER(state, user) {
        state.user = user;
        localStorage.setItem('user', JSON.stringify(user));
    },
    SET_AUTHENTICATED(state, value) {
        state.isAuthenticated = value;
    },
    CLEAR_AUTH(state) {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

const actions = {
    async login({ commit }, credentials) {
        try {
            console.log('🔄 Login action called with:', credentials);
            
            const response = await authApi.login(credentials);
            console.log('✅ Login API response:', response.data);
            
            // Assuming your API returns token and user data
            const { token, user } = response.data;
            
            if (!token) {
                throw new Error('No token received from server');
            }
            
            commit('SET_TOKEN', token);
            commit('SET_USER', user || { email: credentials.email });
            commit('SET_AUTHENTICATED', true);
            
            return { success: true };
            
        } catch (error) {
            console.error('❌ Login error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            
            let errorMessage = 'Login failed';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 422) {
                errorMessage = 'Validation error. Please check your input.';
            } else if (error.response?.status === 401) {
                errorMessage = 'Invalid credentials';
            }
            
            return { 
                success: false, 
                error: errorMessage,
                errors: error.response?.data?.errors || {}
            };
        }
    },

    async register({ commit }, userData) {
        try {
            console.log('🔄 Register action called with:', userData);
            
            const response = await authApi.register(userData);
            console.log('✅ Register API response:', response.data);
            
            const { token, user } = response.data;
            
            if (!token) {
                throw new Error('No token received from server');
            }
            
            commit('SET_TOKEN', token);
            commit('SET_USER', user || { name: userData.name, email: userData.email });
            commit('SET_AUTHENTICATED', true);
            
            return { success: true };
            
        } catch (error) {
            console.error('❌ Registration error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            
            let errorMessage = 'Registration failed';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 422) {
                errorMessage = 'Validation error. Please check your input.';
            }
            
            return { 
                success: false, 
                error: errorMessage,
                errors: error.response?.data?.errors || {}
            };
        }
    },

    async logout({ commit }) {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            commit('CLEAR_AUTH');
        }
    },

    // Since you don't have /user endpoint, you might need to:
    // 1. Add it to Laravel routes, OR
    // 2. Store user info in token payload
    async fetchUser({ commit, state }) {
        if (!state.token) {
            commit('CLEAR_AUTH');
            return { success: false };
        }
        
        // If you can't get user from API, you might need to decode JWT
        // Or add a /user endpoint to your Laravel API
        return { success: true };
    }
};

const getters = {
    isAuthenticated: state => state.isAuthenticated,
    currentUser: state => state.user,
    isAdmin: state => state.user?.role === 'admin',
    // You'll need to get role from user object or token
    userRole: state => state.user?.role || 'user'
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};