<template>
    <div class="todo-list">
        <div v-if="todos.length === 0" class="no-todos">
            <p>No todos found. Create your first todo!</p>
        </div>
        <div v-else>
            <TodoItem 
                v-for="todo in todos" 
                :key="todo.id" 
                :todo="todo"
                @update="handleUpdate"
                @delete="handleDelete"
            />
        </div>
    </div>
</template>

<script>
import TodoItem from './TodoItem.vue';

export default {
    name: 'TodoList',
    components: {
        TodoItem
    },
    props: {
        todos: {
            type: Array,
            required: true,
            default: () => []
        }
    },
    emits: ['todo-updated', 'todo-deleted'],
    setup(props, { emit }) {
        const handleUpdate = () => {
            emit('todo-updated');
        };

        const handleDelete = () => {
            emit('todo-deleted');
        };

        return {
            handleUpdate,
            handleDelete
        };
    }
};
</script>

<style scoped>
.todo-list {
    margin-top: 1rem;
}

.no-todos {
    text-align: center;
    padding: 3rem;
    color: #666;
    background: #f9f9f9;
    border-radius: 8px;
    border: 2px dashed #ddd;
}

.no-todos p {
    margin: 0;
    font-size: 1.1rem;
}
</style>