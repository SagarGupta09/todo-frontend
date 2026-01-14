import { createStore } from 'vuex';
import auth from './modules/auth';
import tasks from './modules/tasks';

const store = createStore({
  modules: {
    auth,
    tasks
  }
});

export default store;