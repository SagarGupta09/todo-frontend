<template>
    <form @submit.prevent="handleSubmit" class="task-form">
        <div class="form-group">
            <input 
                type="text" 
                v-model="title" 
                placeholder="Enter task title"
                required
            >
        </div>
        <div class="form-group">
            <textarea 
                v-model="description" 
                placeholder="Enter task description"
                rows="3"
            ></textarea>
        </div>
        <button type="submit" :disabled="loading" class="btn-primary">
            {{ loading ? 'Creating...' : 'Add Task' }}
        </button>
        <p v-if="error" class="error-message">{{ error }}</p>
    </form>
</template>

<script>
export default {
    name: 'TaskForm',
    data() {
        return {
            title: '',
            description: '',
            loading: false,
            error: ''
        };
    },
    methods: {
        async handleSubmit() {
            if (!this.title.trim()) {
                this.error = 'Task title is required';
                return;
            }

            this.loading = true;
            this.error = '';
            
            const task = {
                title: this.title,
                description: this.description,
                status: 'pending'
            };
            
            try {
                const result = await this.$store.dispatch('tasks/createTask', task);
                
                if (result.success) {
                    this.title = '';
                    this.description = '';
                    this.$emit('task-created');
                } else {
                    this.error = result.error || 'Failed to create task';
                }
            } catch (error) {
                this.error = 'An unexpected error occurred';
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>

<style scoped>
.task-form {
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 8px;
}

.form-group {
    margin-bottom: 1rem;
}

.task-form input,
.task-form textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

.task-form input:focus,
.task-form textarea:focus {
    outline: none;
    border-color: #4CAF50;
}

.btn-primary {
    background: #4CAF50;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.3s;
}

.btn-primary:hover:not(:disabled) {
    background: #45a049;
}

.btn-primary:disabled {
    background: #cccccc;
    cursor: not-allowed;
}

.error-message {
    color: #f44336;
    margin-top: 0.5rem;
}
</style>