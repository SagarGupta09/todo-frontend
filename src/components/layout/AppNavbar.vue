<template>
    <nav class="navbar">
        <div class="navbar-brand">Todo App</div>
        <div class="navbar-menu">
            <span class="user-info">{{ user?.name }} ({{ user?.role }})</span>
            <button @click="logout" class="logout-btn">Logout</button>
        </div>
    </nav>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
    name: 'AppNavbar',
    setup() {
        const store = useStore();
        const router = useRouter();
        
        const user = computed(() => store.getters['auth/currentUser']);
        
        const logout = async () => {
            await store.dispatch('auth/logout');
            router.push('/login');
        };
        
        return {
            user,
            logout
        };
    }
};
</script>

<style scoped>
.navbar {
    background: #2196F3;
    color: white;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.navbar-brand {
    font-size: 1.5rem;
    font-weight: bold;
}

.navbar-menu {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-info {
    font-size: 0.9rem;
}

.logout-btn {
    background: white;
    color: #2196F3;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
}

.logout-btn:hover {
    background: #f5f5f5;
}
</style>