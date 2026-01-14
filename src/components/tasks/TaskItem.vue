<template>
    <div class="task-item" :class="{ completed: task.status === 'completed' }">
        <div class="task-content">
            <h3>{{ task.title }}</h3>
            <p>{{ task.description }}</p>
            <div class="task-meta">
                <span class="status">{{ task.status }}</span>
                <span v-if="isAdmin" class="user">User ID: {{ task.user_id }}</span>
            </div>
        </div>
        <div class="task-actions">
            <button @click="toggleComplete" class="complete-btn">
                {{ task.status === 'completed' ? 'Mark Incomplete' : 'Complete' }}
            </button>
            <button @click="editTask" class="edit-btn">Edit</button>
            <button @click="deleteTask" class="delete-btn">Delete</button>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        task: {
            type: Object,
            required: true
        }
    },
    computed: {
        isAdmin() {
            return this.$store.getters['auth/isAdmin'];
        }
    },
    methods: {
        async toggleComplete() {
            const updatedTask = {
                ...this.task,
                status: this.task.status === 'completed' ? 'pending' : 'completed'
            };
            
            const result = await this.$store.dispatch('tasks/updateTask', {
                id: this.task.id,
                task: updatedTask
            });
            
            if (result.success) {
                this.$emit('update', result.data);
            }
        },
        
        editTask() {
            // Implement edit modal or inline editing
            const newTitle = prompt('Edit title:', this.task.title);
            if (newTitle !== null) {
                this.updateTask({ title: newTitle });
            }
        },
        
        async updateTask(updates) {
            const updatedTask = { ...this.task, ...updates };
            
            const result = await this.$store.dispatch('tasks/updateTask', {
                id: this.task.id,
                task: updatedTask
            });
            
            if (result.success) {
                this.$emit('update', result.data);
            }
        },
        
        async deleteTask() {
            if (confirm('Are you sure you want to delete this task?')) {
                const result = await this.$store.dispatch('tasks/deleteTask', this.task.id);
                if (result.success) {
                    this.$emit('delete', this.task.id);
                }
            }
        }
    }
};
</script>

<style scoped>
.task-item {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.task-item.completed {
    opacity: 0.7;
    background: #f9f9f9;
}

.task-item.completed h3 {
    text-decoration: line-through;
}

.task-content {
    flex: 1;
}

.task-content h3 {
    margin: 0 0 0.5rem 0;
    color: #333;
}

.task-content p {
    margin: 0 0 1rem 0;
    color: #666;
}

.task-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
    color: #888;
}

.status {
    text-transform: capitalize;
    padding: 0.25rem 0.5rem;
    background: #e0e0e0;
    border-radius: 4px;
}

.user {
    font-style: italic;
}

.task-actions {
    display: flex;
    gap: 0.5rem;
}

.task-actions button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
}

.complete-btn {
    background: #4CAF50;
    color: white;
}

.edit-btn {
    background: #FF9800;
    color: white;
}

.delete-btn {
    background: #f44336;
    color: white;
}
</style>