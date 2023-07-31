import { createRouter,createWebHashHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        component: () => import('./view/main-view.vue'),
    }
]

export default createRouter({
    history: createWebHashHistory(),
    routes
});
