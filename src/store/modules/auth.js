import { authApi } from '@/api';

const state = {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
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
            const response = await authApi.login(credentials);
            const { token, user } = response.data;
            
            commit('SET_TOKEN', token);
            commit('SET_USER', user);
            commit('SET_AUTHENTICATED', true);
            
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || 'Login failed',
                errors: error.response?.data?.errors
            };
        }
    },

    async register({ commit }, userData) {
        try {
            const response = await authApi.register(userData);
            const { token, user } = response.data;
            
            commit('SET_TOKEN', token);
            commit('SET_USER', user);
            commit('SET_AUTHENTICATED', true);
            
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || 'Registration failed',
                errors: error.response?.data?.errors
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

    async fetchUser({ commit }) {
        try {
            const response = await authApi.user();
            commit('SET_USER', response.data);
            return { success: true };
        } catch (error) {
            commit('CLEAR_AUTH');
            return { success: false };
        }
    }
};

const getters = {
    isAuthenticated: state => state.isAuthenticated,
    currentUser: state => state.user,
    isAdmin: state => state.user?.role === 'admin',
    userRole: state => state.user?.role
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};