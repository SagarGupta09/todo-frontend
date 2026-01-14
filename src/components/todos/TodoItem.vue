<template>
    <div class="todo-item" :class="{ completed: todo.status === 'completed', 'editing': isEditing }">
        <div class="todo-checkbox" @click="toggleStatus">
            <div class="checkbox" :class="{ checked: todo.status === 'completed' }">
                <span v-if="todo.status === 'completed'">✓</span>
            </div>
        </div>
        
        <div class="todo-content">
            <!-- View Mode -->
            <div v-if="!isEditing">
                <h3 :class="{ 'completed-text': todo.status === 'completed' }">
                    {{ todo.title }}
                </h3>
                <p v-if="todo.description" class="todo-description">
                    {{ todo.description }}
                </p>
                <div v-else class="no-description">
                    <em>No description</em>
                </div>
                <div class="todo-meta">
                    <span class="status" :class="todo.status">
                        {{ todo.status }}
                    </span>
                    <span v-if="todo.user_id && isAdmin" class="user-id">
                        User ID: {{ todo.user_id }}
                    </span>
                    <small class="created-at" v-if="todo.created_at">
                        {{ formatDate(todo.created_at) }}
                    </small>
                </div>
            </div>
            
            <!-- Edit Mode -->
            <div v-else class="edit-form">
                <div class="form-group">
                    <label>Title</label>
                    <input 
                        type="text" 
                        v-model="editTitle" 
                        placeholder="Todo title"
                        class="edit-input"
                        ref="titleInput"
                    />
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea 
                        v-model="editDescription" 
                        placeholder="Description (optional)"
                        class="edit-textarea"
                        rows="3"
                    ></textarea>
                </div>
                <div class="edit-actions">
                    <button @click="saveEdit" class="btn-save" :disabled="!editTitle.trim() || saving">
                        {{ saving ? 'Saving...' : 'Save' }}
                    </button>
                    <button @click="cancelEdit" class="btn-cancel" :disabled="saving">Cancel</button>
                </div>
            </div>
        </div>
        
        <div class="todo-actions">
            <!-- View Mode Actions -->
            <div v-if="!isEditing" class="action-buttons">
                <button @click="startEdit" class="btn-edit" title="Edit">
                    ✏️ Edit
                </button>
                <button @click="deleteTodo" class="btn-delete" title="Delete">
                    🗑️ Delete
                </button>
            </div>
            
            <!-- Edit Mode Actions (only delete) -->
            <div v-else class="action-buttons">
                <button @click="deleteTodo" class="btn-delete" title="Delete" :disabled="saving">
                    🗑️ Delete
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { computed, ref } from 'vue';
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
        const isEditing = ref(false);
        const editTitle = ref('');
        const editDescription = ref('');
        const saving = ref(false);
        const titleInput = ref(null);

        const isAdmin = computed(() => store.getters['auth/isAdmin']);

        const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        };

        const toggleStatus = async () => {
            if (isEditing.value) return; // Don't toggle status while editing
            
            const newStatus = props.todo.status === 'completed' ? 'pending' : 'completed';
            
            try {
                await store.dispatch('todos/updateTodo', {
                    id: props.todo.id,
                    todo: { ...props.todo, status: newStatus }
                });
                emit('update');
            } catch (error) {
                console.error('Failed to update todo status:', error);
            }
        };

        const startEdit = () => {
            isEditing.value = true;
            editTitle.value = props.todo.title;
            editDescription.value = props.todo.description || '';
            
            // Focus on title input after a brief delay
            setTimeout(() => {
                if (titleInput.value) {
                    titleInput.value.focus();
                }
            }, 50);
        };

        const saveEdit = async () => {
            if (!editTitle.value.trim()) {
                alert('Title is required');
                return;
            }

            saving.value = true;
            
            try {
                const updatedTodo = {
                    ...props.todo,
                    title: editTitle.value.trim(),
                    description: editDescription.value.trim()
                };

                const result = await store.dispatch('todos/updateTodo', {
                    id: props.todo.id,
                    todo: updatedTodo
                });

                if (result.success) {
                    isEditing.value = false;
                    emit('update');
                } else {
                    alert(result.error || 'Failed to update todo');
                }
            } catch (error) {
                console.error('Failed to save todo:', error);
                alert('Failed to save changes. Please try again.');
            } finally {
                saving.value = false;
            }
        };

        const cancelEdit = () => {
            isEditing.value = false;
            editTitle.value = '';
            editDescription.value = '';
        };

        const deleteTodo = async () => {
            if (isEditing.value && !confirm('You have unsaved changes. Delete anyway?')) {
                return;
            }
            
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
            isEditing,
            editTitle,
            editDescription,
            saving,
            titleInput,
            isAdmin,
            formatDate,
            toggleStatus,
            startEdit,
            saveEdit,
            cancelEdit,
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
    position: relative;
}

.todo-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.todo-item.completed {
    opacity: 0.7;
    background: #f9f9f9;
}

.todo-item.editing {
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.todo-checkbox {
    margin-right: 1rem;
    cursor: pointer;
    flex-shrink: 0;
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
    min-width: 0; /* Prevent overflow */
}

.todo-content h3 {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 1.1rem;
    font-weight: 600;
    word-break: break-word;
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
    white-space: pre-wrap;
    word-break: break-word;
}

.no-description {
    margin: 0 0 0.5rem 0;
    color: #999;
    font-size: 0.9rem;
    font-style: italic;
}

.todo-meta {
    display: flex;
    gap: 1rem;
    align-items: center;
    font-size: 0.85rem;
    flex-wrap: wrap;
}

.status {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    text-transform: capitalize;
    font-weight: 500;
    white-space: nowrap;
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

.created-at {
    color: #999;
}

/* Edit Form Styles */
.edit-form {
    margin-top: 0.5rem;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 500;
    color: #555;
    font-size: 0.9rem;
}

.edit-input {
    width: 100%;
    padding: 0.5rem;
    border: 2px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    font-family: inherit;
}

.edit-input:focus {
    outline: none;
    border-color: #4CAF50;
}

.edit-textarea {
    width: 100%;
    padding: 0.5rem;
    border: 2px solid #ddd;
    border-radius: 4px;
    font-size: 0.95rem;
    font-family: inherit;
    resize: vertical;
    min-height: 80px;
}

.edit-textarea:focus {
    outline: none;
    border-color: #4CAF50;
}

.edit-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
}

.btn-save {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
}

.btn-save:hover:not(:disabled) {
    background: #45a049;
}

.btn-save:disabled {
    background: #cccccc;
    cursor: not-allowed;
}

.btn-cancel {
    background: #f5f5f5;
    color: #666;
    border: 1px solid #ddd;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
}

.btn-cancel:hover:not(:disabled) {
    background: #e0e0e0;
}

.btn-cancel:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Actions Container */
.todo-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-left: 1rem;
    flex-shrink: 0;
}

.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.btn-edit {
    background: #2196F3;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
}

.btn-edit:hover {
    background: #1976d2;
}

.btn-delete {
    background: #f44336;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
}

.btn-delete:hover:not(:disabled) {
    background: #d32f2f;
}

.btn-delete:disabled {
    background: #cccccc;
    cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
    .todo-item {
        flex-direction: column;
    }
    
    .todo-checkbox {
        margin-right: 0;
        margin-bottom: 0.5rem;
    }
    
    .todo-actions {
        margin-left: 0;
        margin-top: 1rem;
        width: 100%;
    }
    
    .action-buttons {
        flex-direction: row;
        justify-content: flex-end;
    }
    
    .todo-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}
</style>