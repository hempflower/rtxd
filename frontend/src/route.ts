import { createRouter,createWebHashHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        component: () => import('./view/MainView.vue'),
    }
]

export default createRouter({
    history: createWebHashHistory(),
    routes
});
