<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { UserRole } from '@/types/api'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

const authStore = useAuthStore()
const { isLoggedIn, user } = storeToRefs(authStore)
const { logout } = authStore
const route = useRoute()
const router = useRouter()

const handleLogout = async () => {
  await logout()
  await router.push({ name: 'Login', query: { redirect: route.fullPath } })
}
</script>

<template>
  <div id="app" class="min-vh-100 bg-light">
    <nav v-if="isLoggedIn" class="navbar navbar-expand-lg navbar-dark bg-primary mb-3">
      <div class="container-fluid">
        <router-link class="navbar-brand" to="/">
          <i class="fas fa-tv me-2"></i>
          Monitoring
        </router-link>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link class="nav-link" :class="{ active: route.path === '/' }" to="/">
                <i class="fas fa-chart-line me-1"></i>
                Dashboard
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                :class="{ active: route.path === '/alerts' }"
                to="/alerts"
              >
                <i class="fas fa-bell me-1"></i>
                Alerts
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                :class="{ active: route.path === '/incidents' }"
                to="/incidents"
              >
                <i class="fas fa-exclamation-triangle me-1"></i>
                Incidents
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                :class="{ active: route.path.startsWith('/tasks') }"
                to="/tasks"
              >
                <i class="fas fa-tasks me-1"></i>
                Tasks
              </router-link>
            </li>
          </ul>
          <div class="d-flex align-items-center gap-2 text-white">
            <i class="fas fa-user me-1"></i>
            <span>{{ user.login }} ({{ UserRole[user.role] }})</span>
            <button class="btn btn-outline-light btn-sm" @click="handleLogout">
              <i class="fas fa-sign-out-alt me-1"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main>
      <router-view />
    </main>

    <footer v-if="isLoggedIn" class="bg-light border-top mt-4 py-3">
      <div class="container text-center">
        <a
          href="https://www.flaticon.com/free-icons/sock"
          target="_blank"
          rel="noopener noreferrer"
          class="text-decoration-none text-secondary"
          title="sock icons"
        >
          Sock icons created by Freepik - Flaticon
        </a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.nav-link.active {
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 0.375rem;
  font-weight: 500;
}

@media (max-width: 991.98px) {
  .nav-link.active {
    background-color: rgba(255, 255, 255, 0.3);
  }
}

footer a:hover {
  text-decoration: underline !important;
  color: #0d6efd !important;
}
</style>
