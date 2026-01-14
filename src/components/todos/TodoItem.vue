<template>
    <div class="todo-item" :class="{ completed: todo.status === 'completed' }">
        <div class="todo-checkbox" @click="toggleStatus">
            <div class="checkbox" :class="{ checked: todo.status === 'completed' }">
                <span v-if="todo.status === 'completed'">✓</span>
            </div>
        </div>
        
        <div class="todo-content">
            <h3 :class="{ 'completed-text': todo.status === 'completed' }">
                {{ todo.title }}
            </h3>
            <p v-if="todo.description" class="todo-description">
                {{ todo.description }}
            </p>
            <div class="todo-meta">
                <span class="status" :class="todo.status">
                    {{ todo.status }}
                </span>
                <span v-if="todo.user_id" class="user-id">
                    User ID: {{ todo.user_id }}
                </span>
            </div>
        </div>
        
        <div class="todo-actions">
            <button @click="editTodo" class="btn-edit" title="Edit">
                ✏️
            </button>
            <button @click="deleteTodo" class="btn-delete" title="Delete">
                🗑️
            </button>
        </div>
    </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
    name: 'TodoItem',
    props: {
        todo: {
            type: Object,
            required: true
        }
    },
    emits: ['update', 'delete'],
    setup(props, { emit }) {
        const store = useStore();
        
        const isAdmin = computed(() => store.getters['auth/isAdmin']);

        const toggleStatus = async () => {
            const newStatus = props.todo.status === 'completed' ? 'pending' : 'completed';
            
            try {
                await store.dispatch('todos/updateTodo', {
                    id: props.todo.id,
                    todo: { ...props.todo, status: newStatus }
                });
                emit('update');
            } catch (error) {
                console.error('Failed to update todo:', error);
            }
        };

        const editTodo = () => {
            const newTitle = prompt('Edit todo title:', props.todo.title);
            if (newTitle !== null && newTitle.trim() !== '') {
                store.dispatch('todos/updateTodo', {
                    id: props.todo.id,
                    todo: { ...props.todo, title: newTitle.trim() }
                }).then(() => {
                    emit('update');
                });
            }
        };

        const deleteTodo = async () => {
            if (confirm('Are you sure you want to delete this todo?')) {
                try {
                    await store.dispatch('todos/deleteTodo', props.todo.id);
                    emit('delete');
                } catch (error) {
                    console.error('Failed to delete todo:', error);
                    alert('Failed to delete todo. Please try again.');
                }
            }
        };

        return {
            isAdmin,
            toggleStatus,
            editTodo,
            deleteTodo
        };
    }
};
</script>

<style scoped>
.todo-item {
    display: flex;
    align-items: flex-start;
    padding: 1rem;
    margin-bottom: 1rem;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    transition: all 0.3s;
}

.todo-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.todo-item.completed {
    opacity: 0.7;
    background: #f9f9f9;
}

.todo-checkbox {
    margin-right: 1rem;
    cursor: pointer;
}

.checkbox {
    width: 24px;
    height: 24px;
    border: 2px solid #ddd;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
}

.checkbox.checked {
    background: #4CAF50;
    border-color: #4CAF50;
    color: white;
}

.todo-content {
    flex: 1;
}

.todo-content h3 {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 1.1rem;
    font-weight: 600;
}

.todo-content h3.completed-text {
    text-decoration: line-through;
    color: #888;
}

.todo-description {
    margin: 0 0 0.5rem 0;
    color: #666;
    font-size: 0.95rem;
    line-height: 1.4;
}

.todo-meta {
    display: flex;
    gap: 1rem;
    align-items: center;
    font-size: 0.85rem;
}

.status {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    text-transform: capitalize;
    font-weight: 500;
}

.status.pending {
    background: #fff3cd;
    color: #856404;
}

.status.completed {
    background: #d4edda;
    color: #155724;
}

.user-id {
    color: #6c757d;
    font-style: italic;
}

.todo-actions {
    display: flex;
    gap: 0.5rem;
    margin-left: 1rem;
}

.btn-edit,
.btn-delete {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    font-size: 1rem;
    border-radius: 4px;
    transition: background 0.3s;
}

.btn-edit:hover {
    background: #e3f2fd;
}

.btn-delete:hover {
    background: #ffebee;
}
</style>