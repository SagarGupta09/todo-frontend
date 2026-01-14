<template>
    <div class="dashboard">
        <AppNavbar />
        <div class="container">
            <div class="sidebar" v-if="isAdmin">
                <h3>Admin Panel</h3>
                <div class="admin-stats">
                    <p>Total Tasks: {{ tasks.length }}</p>
                </div>
            </div>
            <div class="main-content">
                <div class="header">
                    <h1>Todo Dashboard</h1>
                    <p class="welcome-message">
                        Welcome, {{ user?.name }} 
                        <span class="role-badge">({{ user?.role }})</span>
                    </p>
                </div>
                
                <div class="task-section">
                    <h2>Create New Task</h2>
                    <TaskForm @task-created="fetchTasks" />
                </div>
                
                <div class="task-section">
                    <div class="section-header">
                        <h2>Your Tasks</h2>
                        <button @click="fetchTasks" class="btn-refresh" :disabled="loading">
                            {{ loading ? 'Refreshing...' : 'Refresh' }}
                        </button>
                    </div>
                    
                    <div v-if="loading && tasks.length === 0" class="loading">
                        Loading tasks...
                    </div>
                    <TaskList 
                        v-else 
                        :tasks="filteredTasks" 
                        @task-updated="fetchTasks" 
                        @task-deleted="fetchTasks" 
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
import TaskForm from '@/components/tasks/TaskForm.vue';
import TaskList from '@/components/tasks/TaskList.vue';

export default {
    name: 'DashBoard',
    components: {
        AppNavbar,
        TaskForm,
        TaskList
    },
    setup() {
        const store = useStore();
        
        const user = computed(() => store.getters['auth/currentUser']);
        const isAdmin = computed(() => store.getters['auth/isAdmin']);
        const tasks = computed(() => store.getters['tasks/allTasks']);
        const loading = computed(() => store.getters['tasks/isLoading']);
        
        const filteredTasks = computed(() => {
            if (isAdmin.value) {
                return tasks.value;
            }
            return store.getters['tasks/userTasks'];
        });
        
        const fetchTasks = () => {
            store.dispatch('tasks/fetchTasks');
        };
        
        onMounted(() => {
            fetchTasks();
        });
        
        return {
            user,
            isAdmin,
            tasks,
            loading,
            filteredTasks,
            fetchTasks
        };
    }
};
</script>

<style scoped>
/* Keep the same styles as before */
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