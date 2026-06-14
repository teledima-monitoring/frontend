import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('@/views/SignupView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/alerts',
      name: 'Alerts',
      component: () => import('@/views/AlertsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/incidents',
      name: 'Incidents',
      component: () => import('@/views/IncidentsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // Check auth status on first visit
  if (!authStore.isLoggedIn && !authStore.loading) {
    await authStore.fetchMe()
  }

  const requiresAuth = !!to.meta.requiresAuth
  const guestOnly = !!to.meta.guestOnly

  if (requiresAuth && !authStore.isLoggedIn) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (guestOnly && authStore.isLoggedIn) {
    return { name: 'Dashboard' }
  }
})

router.afterEach((to) => {
  document.getElementById('title')!.innerText = `Monitoring - ${to.name?.toString()}`
})

export default router
