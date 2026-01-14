<template>
    <form @submit.prevent="handleSubmit" class="todo-form">
        <div class="form-group">
            <input 
                type="text" 
                v-model="title" 
                placeholder="What needs to be done?"
                required
                :disabled="loading"
            >
        </div>
        <div class="form-group">
            <textarea 
                v-model="description" 
                placeholder="Description (optional)"
                rows="3"
                :disabled="loading"
            ></textarea>
        </div>
        <button type="submit" :disabled="loading || !title.trim()" class="btn-add">
            <span v-if="loading">
                <i class="spinner"></i> Adding...
            </span>
            <span v-else>Add Todo</span>
        </button>
        <p v-if="error" class="error-message">{{ error }}</p>
    </form>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';

export default {
    name: 'TodoForm',
    emits: ['todo-created'],
    setup(props, { emit }) {
        const store = useStore();
        const title = ref('');
        const description = ref('');
        const loading = ref(false);
        const error = ref('');

        const handleSubmit = async () => {
            if (!title.value.trim()) return;

            loading.value = true;
            error.value = '';

            try {
                const todo = {
                    title: title.value.trim(),
                    description: description.value.trim(),
                    status: 'pending'
                };

                const result = await store.dispatch('todos/createTodo', todo);

                if (result.success) {
                    title.value = '';
                    description.value = '';
                    emit('todo-created');
                } else {
                    error.value = result.error;
                }
            } catch (err) {
                error.value = 'Failed to create todo';
                console.error('Create todo error:', err);
            } finally {
                loading.value = false;
            }
        };

        return {
            title,
            description,
            loading,
            error,
            handleSubmit
        };
    }
};
</script>

<style scoped>
.todo-form {
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 8px;
}

.form-group {
    margin-bottom: 1rem;
}

.todo-form input,
.todo-form textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    font-family: inherit;
}

.todo-form input:focus,
.todo-form textarea:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.todo-form input:disabled,
.todo-form textarea:disabled {
    background: #f0f0f0;
    cursor: not-allowed;
}

.btn-add {
    background: #4CAF50;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.3s;
}

.btn-add:hover:not(:disabled) {
    background: #45a049;
    transform: translateY(-2px);
}

.btn-add:disabled {
    background: #cccccc;
    cursor: not-allowed;
}

.spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
    margin-right: 0.5rem;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.error-message {
    color: #f44336;
    margin-top: 0.5rem;
    font-size: 0.9rem;
}
</style>