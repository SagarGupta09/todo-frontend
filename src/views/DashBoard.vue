<template>
    <div class="dashboard">
        <AppNavbar />
        <div class="container">
            <div class="sidebar" v-if="isAdmin">
                <h3>Admin Panel</h3>
                <div class="admin-stats">
                    <p>Total Todos: {{ todos.length }}</p>
                    <p>Your Role: <strong>{{ userRole }}</strong></p>
                    <p>User ID: {{ user?.id }}</p>
                    <button @click="refreshUserData" class="btn-refresh-user" :disabled="refreshing">
                        {{ refreshing ? 'Refreshing...' : '🔄 Refresh User Data' }}
                    </button>
                </div>
            </div>
            <div class="main-content">
                <div class="header">
                    <h1>Todo Dashboard</h1>
                    <p class="welcome-message">
                        Welcome, {{ user?.name }} 
                        <span class="role-badge" :class="userRole">
                            ({{ userRole }})
                        </span>
                    </p>
                    <div v-if="roleChangeMessage" class="role-change-message">
                        {{ roleChangeMessage }}
                    </div>
                </div>
                
                <div class="task-section">
                    <h2>Create New Todo</h2>
                    <TodoForm @todo-created="fetchTodos" />
                </div>
                
                <div class="task-section">
                    <div class="section-header">
                        <h2>Your Todos</h2>
                        <button @click="fetchTodos" class="btn-refresh" :disabled="loading">
                            {{ loading ? 'Refreshing...' : 'Refresh Todos' }}
                        </button>
                    </div>
                    
                    <div v-if="loading && todos.length === 0" class="loading">
                        Loading todos...
                    </div>
                    <div v-else-if="error" class="error-alert">
                        {{ error }}
                    </div>
                    <TodoList 
                        v-else 
                        :todos="filteredTodos" 
                        @todo-updated="fetchTodos" 
                        @todo-deleted="fetchTodos" 
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import AppNavbar from '@/components/layout/AppNavbar.vue';
import TodoForm from '@/components/todos/TodoForm.vue';
import TodoList from '@/components/todos/TodoList.vue';

export default {
    name: 'DashBoard',
    components: {
        AppNavbar,
        TodoForm,
        TodoList
    },
    setup() {
        const store = useStore();
        const refreshing = ref(false);
        const roleChangeMessage = ref('');
        
        const user = computed(() => store.getters['auth/currentUser']);
        const userRole = computed(() => store.getters['auth/userRole']);
        const isAdmin = computed(() => store.getters['auth/isAdmin']);
        const todos = computed(() => store.getters['todos/allTodos']);
        const loading = computed(() => store.getters['todos/isLoading']);
        const error = computed(() => store.getters['todos/error']);
        
        const filteredTodos = computed(() => {
            if (isAdmin.value) {
                return todos.value;
            }
            return store.getters['todos/userTodos'];
        });
        
        const fetchTodos = () => {
            store.dispatch('todos/fetchTodos');
        };
        
        const refreshUserData = async () => {
            refreshing.value = true;
            roleChangeMessage.value = '';
            
            try {
                console.log('🔄 Manually refreshing user data...');
                const result = await store.dispatch('auth/checkAndUpdateRole');
                
                if (result.success) {
                    if (result.roleChanged) {
                        roleChangeMessage.value = `Role updated to: ${result.newRole}`;
                        setTimeout(() => {
                            roleChangeMessage.value = '';
                        }, 3000);
                    }
                    console.log('✅ User data refreshed successfully');
                } else {
                    console.error('❌ Failed to refresh user data:', result.message);
                }
            } catch (error) {
                console.error('❌ Error refreshing user:', error);
            } finally {
                refreshing.value = false;
            }
        };
        
        // Debug logging
        console.log('📊 Initial user data:', user.value);
        console.log('👤 Initial user role:', userRole.value);
        console.log('👑 Initial isAdmin:', isAdmin.value);
        
        onMounted(async () => {
            // Refresh user data on page load
            await refreshUserData();
            
            // Fetch todos
            fetchTodos();
        });
        
        return {
            user,
            userRole,
            isAdmin,
            todos,
            loading,
            error,
            filteredTodos,
            fetchTodos,
            refreshUserData,
            refreshing,
            roleChangeMessage
        };
    }
};
</script>

<style scoped>
.role-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 500;
}

.role-badge.user {
    background: #e3f2fd;
    color: #1976d2;
}

.role-badge.admin {
    background: #fff3e0;
    color: #ef6c00;
}

.btn-refresh-user {
    background: #ff9800;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    margin-top: 0.5rem;
    width: 100%;
}

.btn-refresh-user:hover:not(:disabled) {
    background: #f57c00;
}

.btn-refresh-user:disabled {
    background: #cccccc;
    cursor: not-allowed;
}

.role-change-message {
    background: #4caf50;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    margin-top: 0.5rem;
    animation: fadeOut 3s forwards;
}

@keyframes fadeOut {
    0% { opacity: 1; }
    70% { opacity: 1; }
    100% { opacity: 0; }
}

/* Keep existing styles... */
</style>