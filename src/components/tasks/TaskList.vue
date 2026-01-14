<template>
    <div class="task-list">
        <div v-if="tasks.length === 0" class="no-tasks">
            No tasks found. Create your first task!
        </div>
        <div v-else>
            <TaskItem 
                v-for="task in tasks" 
                :key="task.id" 
                :task="task"
                @update="handleUpdate"
                @delete="handleDelete"
            />
        </div>
    </div>
</template>

<script>
import TaskItem from './TaskItem.vue';

export default {
    components: {
        TaskItem
    },
    props: {
        tasks: {
            type: Array,
            required: true
        }
    },
    methods: {
        handleUpdate(task) {
            this.$emit('task-updated', task);
        },
        handleDelete(id) {
            this.$emit('task-deleted', id);
        }
    }
};
</script>