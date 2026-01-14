<template>
    <div class="dashboard">
        <AppNavbar />
        <div class="container">
            <div class="sidebar" v-if="isAdmin">
                <h3>Admin Panel</h3>
                <div class="admin-stats">
                    <p>Total Todos: {{ todos.length }}</p>
                </div>
            </div>
            <div class="main-content">
                <div class="header">
                    <h1>Todo Dashboard</h1>
                    <p class="welcome-message">
                        Welcome, {{ user?.name }} 
                        <span class="role-badge">({{ user?.role || 'user' }})</span>
                    </p>
                </div>
                
                <div class="task-section">
                    <h2>Create New Todo</h2>
                    <TodoForm @todo-created="fetchTodos" />
                </div>
                
                <div class="task-section">
                    <div class="section-header">
                        <h2>Your Todos</h2>
                        <button @click="fetchTodos" class="btn-refresh" :disabled="loading">
                            {{ loading ? 'Refreshing...' : 'Refresh' }}
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
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import AppNavbar from '@/components/layout/AppNavbar.vue';
import TodoForm from '@/components/todos/TodoForm.vue'; // Changed from TaskForm
import TodoList from '@/components/todos/TodoList.vue'; // Changed from TaskList

export default {
    name: 'DashBoard',
    components: {
        AppNavbar,
        TodoForm, // Changed
        TodoList  // Changed
    },
    setup() {
        const store = useStore();
        
        const user = computed(() => store.getters['auth/currentUser']);
        const isAdmin = computed(() => store.getters['auth/isAdmin']);
        const todos = computed(() => store.getters['todos/allTodos']); // Changed from tasks
        const loading = computed(() => store.getters['todos/isLoading']); // Changed
        const error = computed(() => store.getters['todos/error']); // Added error
        
        const filteredTodos = computed(() => {
            if (isAdmin.value) {
                return todos.value;
            }
            return store.getters['todos/userTodos']; // Changed
        });
        
        const fetchTodos = () => {
            store.dispatch('todos/fetchTodos'); // Changed from tasks
        };
        
        onMounted(() => {
            fetchTodos();
        });
        
        return {
            user,
            isAdmin,
            todos, // Changed from tasks
            loading,
            error,
            filteredTodos, // Changed from filteredTasks
            fetchTodos     // Changed from fetchTasks
        };
    }
};
</script>

<style scoped>
.dashboard {
    min-height: 100vh;
    background: #f5f5f5;
}

.container {
    display: flex;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    gap: 1rem;
}

.sidebar {
    width: 250px;
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.sidebar h3 {
    margin-top: 0;
    color: #333;
    border-bottom: 2px solid #4CAF50;
    padding-bottom: 0.5rem;
}

.admin-stats p {
    margin: 0.5rem 0;
    padding: 0.5rem;
    background: #f9f9f9;
    border-radius: 4px;
}

.main-content {
    flex: 1;
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.header {
    margin-bottom: 2rem;
}

.header h1 {
    margin: 0 0 0.5rem 0;
    color: #333;
}

.welcome-message {
    color: #666;
    margin: 0;
}

.role-badge {
    background: #e3f2fd;
    color: #1976d2;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
}

.task-section {
    margin-bottom: 2rem;
}

.task-section h2 {
    margin: 0 0 1rem 0;
    color: #444;
    font-size: 1.5rem;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.btn-refresh {
    background: #2196F3;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
}

.btn-refresh:hover:not(:disabled) {
    background: #1976d2;
}

.btn-refresh:disabled {
    background: #cccccc;
    cursor: not-allowed;
}

.loading {
    text-align: center;
    padding: 2rem;
    color: #666;
    background: #f9f9f9;
    border-radius: 8px;
}

.error-alert {
    background: #ffebee;
    color: #c62828;
    padding: 1rem;
    border-radius: 8px;
    border-left: 4px solid #c62828;
    margin: 1rem 0;
}

@media (max-width: 768px) {
    .container {
        flex-direction: column;
    }
    
    .sidebar {
        width: 100%;
    }
    
    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
}
</style>