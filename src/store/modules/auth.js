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
            
            const { token, user } = response.data;
            
            if (!token) {
                throw new Error('No token received from server');
            }
            
            // Log the user data we received
            console.log('👤 User data from API:', user);
            console.log('👑 User role from API:', user?.role);
            
            commit('SET_TOKEN', token);
            commit('SET_USER', user);
            commit('SET_AUTHENTICATED', true);
            
            return { success: true };
            
        } catch (error) {
            console.error('❌ Login error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            
            return { 
                success: false, 
                error: error.response?.data?.message || 'Login failed'
            };
        }
    },

    async register({ commit }, userData) {
        try {
            console.log('🔄 Register action called with:', userData);
            
            const response = await authApi.register(userData);
            console.log('✅ Register API response:', response.data);
            
            const { token, user } = response.data;
            
            commit('SET_TOKEN', token);
            commit('SET_USER', user);
            commit('SET_AUTHENTICATED', true);
            
            return { success: true };
            
        } catch (error) {
            console.error('❌ Registration error:', error);
            return { 
                success: false, 
                error: error.response?.data?.message || 'Registration failed'
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

    // Action to refresh user data from server
    async refreshUser({ commit, state }) {
        try {
            if (!state.token) {
                return { success: false, message: 'No token found' };
            }
            
            console.log('🔄 Refreshing user data from server...');
            const freshUser = await authApi.refreshUser();
            
            if (freshUser) {
                commit('SET_USER', freshUser);
                console.log('✅ User data updated:', freshUser);
                return { success: true, user: freshUser };
            }
            
            return { success: false, message: 'Failed to get user data' };
        } catch (error) {
            console.error('❌ Failed to refresh user:', error);
            return { success: false, message: error.message };
        }
    },

    // Action to check and update role if changed - FIXED LINE 126
    async checkAndUpdateRole({ state, dispatch }) {
        try {
            const result = await dispatch('refreshUser');
            if (result.success) {
                const oldRole = state.user?.role;
                const newRole = result.user?.role;
                
                if (oldRole !== newRole) {
                    console.log(`🔄 Role changed from "${oldRole}" to "${newRole}"`);
                    return { success: true, roleChanged: true, newRole };
                }
                return { success: true, roleChanged: false };
            }
            return result;
        } catch (error) {
            console.error('Error checking role:', error);
            return { success: false, message: error.message };
        }
    }
};

const getters = {
    isAuthenticated: state => state.isAuthenticated,
    currentUser: state => state.user,
    userRole: state => state.user?.role || 'user',
    isAdmin: state => (state.user?.role || 'user') === 'admin'
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};