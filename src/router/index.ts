import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/tabs/Home'
    },
    {
        path: '/tabs/',
        component: TabsPage,
        children: [
            {
                path: '',
                redirect: '/tabs/Home'
            },
            {
                name: 'Home',
                path: 'Home',
                component: () => import('@/views/HomePage.vue')
            },
            {
                name: 'TV Shows',
                path: 'TV',
                component: () => import('@/views/TVPage.vue')
            },
            {
                name: 'Movies',
                path: 'Movie',
                component: () => import('@/views/MoviePage.vue')
            },
            {
                name: 'Books',
                path: 'Book',
                component: () => import('@/views/BookPage.vue')
            }
        ]
    }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
