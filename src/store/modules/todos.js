import { todoApi } from '@/api';

const state = {
    todos: [],
    loading: false,
    error: null
};

const mutations = {
    SET_TODOS(state, todos) {
        state.todos = todos;
    },
    ADD_TODO(state, todo) {
        state.todos.unshift(todo);
    },
    UPDATE_TODO(state, updatedTodo) {
        const index = state.todos.findIndex(t => t.id === updatedTodo.id);
        if (index !== -1) {
            state.todos.splice(index, 1, updatedTodo);
        }
    },
    DELETE_TODO(state, id) {
        state.todos = state.todos.filter(todo => todo.id !== id);
    },
    SET_LOADING(state, loading) {
        state.loading = loading;
    },
    SET_ERROR(state, error) {
        state.error = error;
    }
};

const actions = {
    async fetchTodos({ commit }) {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        
        try {
            const response = await todoApi.getAll();
            commit('SET_TODOS', response.data.data || response.data);
            return { success: true };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to fetch todos';
            commit('SET_ERROR', errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            commit('SET_LOADING', false);
        }
    },

    async createTodo({ commit }, todo) {
        commit('SET_ERROR', null);
        
        try {
            const response = await todoApi.create(todo);
            commit('ADD_TODO', response.data);
            return { success: true, data: response.data };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to create todo';
            commit('SET_ERROR', errorMsg);
            return { success: false, error: errorMsg };
        }
    },

    async updateTodo({ commit }, { id, todo }) {
        commit('SET_ERROR', null);
        
        try {
            const response = await todoApi.update(id, todo);
            commit('UPDATE_TODO', response.data);
            return { success: true, data: response.data };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to update todo';
            commit('SET_ERROR', errorMsg);
            return { success: false, error: errorMsg };
        }
    },

    async deleteTodo({ commit }, id) {
        commit('SET_ERROR', null);
        
        try {
            await todoApi.delete(id);
            commit('DELETE_TODO', id);
            return { success: true };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to delete todo';
            commit('SET_ERROR', errorMsg);
            return { success: false, error: errorMsg };
        }
    }
};

const getters = {
    allTodos: state => state.todos,
    todoById: state => id => state.todos.find(todo => todo.id === id),
    userTodos: (state, getters, rootState, rootGetters) => {
        const user = rootGetters['auth/currentUser'];
        const isAdmin = rootGetters['auth/isAdmin'];
        
        if (isAdmin) {
            return state.todos;
        }
        
        // Assuming todos have user_id field
        return state.todos.filter(todo => todo.user_id === user?.id);
    },
    isLoading: state => state.loading,
    error: state => state.error
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};