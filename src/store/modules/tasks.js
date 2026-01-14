import { taskApi } from '@/api';

const state = {
    tasks: [],
    currentTask: null,
    loading: false
};

const mutations = {
    SET_TASKS(state, tasks) {
        state.tasks = tasks;
    },
    SET_TASK(state, task) {
        state.currentTask = task;
    },
    ADD_TASK(state, task) {
        state.tasks.unshift(task);
    },
    UPDATE_TASK(state, updatedTask) {
        const index = state.tasks.findIndex(t => t.id === updatedTask.id);
        if (index !== -1) {
            state.tasks.splice(index, 1, updatedTask);
        }
    },
    DELETE_TASK(state, id) {
        state.tasks = state.tasks.filter(task => task.id !== id);
    },
    SET_LOADING(state, loading) {
        state.loading = loading;
    }
};

const actions = {
    async fetchTasks({ commit }) {
        commit('SET_LOADING', true);
        try {
            const response = await taskApi.getAll();
            commit('SET_TASKS', response.data.data || response.data);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to fetch tasks' };
        } finally {
            commit('SET_LOADING', false);
        }
    },

    async fetchTask({ commit }, id) {
        try {
            const response = await taskApi.get(id);
            commit('SET_TASK', response.data);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to fetch task' };
        }
    },

    async createTask({ commit }, task) {
        try {
            const response = await taskApi.create(task);
            commit('ADD_TASK', response.data);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to create task' };
        }
    },

    async updateTask({ commit }, { id, task }) {
        try {
            const response = await taskApi.update(id, task);
            commit('UPDATE_TASK', response.data);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to update task' };
        }
    },

    async deleteTask({ commit }, id) {
        try {
            await taskApi.delete(id);
            commit('DELETE_TASK', id);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to delete task' };
        }
    }
};

const getters = {
    allTasks: state => state.tasks,
    taskById: state => id => state.tasks.find(task => task.id === id),
    userTasks: (state, getters, rootState, rootGetters) => {
        const user = rootGetters['auth/currentUser'];
        if (rootGetters['auth/isAdmin']) {
            return state.tasks; // Admin sees all tasks
        }
        return state.tasks.filter(task => task.user_id === user?.id); // User sees only their tasks
    },
    isLoading: state => state.loading
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};