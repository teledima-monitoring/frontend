<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { UserRole } from '@/types/api'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import NotificationsDropdown from '@/components/NotificationsDropdown.vue'

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
  <div id="app" class="min-vh-100 bg-light d-flex flex-column">
    <!-- Navbar -->
    <nav
      v-if="isLoggedIn"
      class="navbar navbar-expand-lg navbar-dark shadow-sm sticky-top custom-navbar"
    >
      <div class="container-fluid px-4">
        <router-link class="navbar-brand d-flex align-items-center" to="/">
          <div class="brand-icon me-2">
            <i class="bi bi-activity"></i>
          </div>
          <span class="fw-bold">Monitoring</span>
        </router-link>

        <button
          class="navbar-toggler border-0"
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
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <router-link class="nav-link" :class="{ active: route.path === '/' }" to="/">
                <i class="bi bi-graph-up me-1"></i> Dashboard
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                :class="{ active: route.path === '/alerts' }"
                to="/alerts"
              >
                <i class="bi bi-bell me-1"></i> Alerts
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                :class="{ active: route.path === '/incidents' }"
                to="/incidents"
              >
                <i class="bi bi-exclamation-triangle me-1"></i> Incidents
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                :class="{ active: route.path.startsWith('/tasks') }"
                to="/tasks"
              >
                <i class="bi bi-kanban me-1"></i> Tasks
              </router-link>
            </li>
          </ul>

          <div class="d-flex align-items-center gap-3 user-section">
            <!-- Подключаем наш отдельный компонент уведомлений -->
            <NotificationsDropdown />

            <!-- User Info & Logout -->
            <div class="d-flex align-items-center text-white">
              <div class="user-avatar me-2">
                {{ user.login.charAt(0).toUpperCase() }}
              </div>
              <div class="d-none d-md-block">
                <div class="fw-semibold small lh-1">{{ user.login }}</div>
                <div class="opacity-75" style="font-size: 0.7rem">{{ UserRole[user.role] }}</div>
              </div>
            </div>
            <button class="btn btn-outline-light btn-sm logout-btn" @click="handleLogout">
              <i class="bi bi-box-arrow-right me-1"></i> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="flex-grow-1">
      <router-view />
    </main>

    <!-- Footer -->
    <footer v-if="isLoggedIn" class="bg-white border-top py-3 mt-auto">
      <div class="container text-center">
        <small class="text-muted">
          <i class="bi bi-heart-fill text-danger me-1" style="font-size: 0.7rem"></i>
          Monitoring System &copy; {{ new Date().getFullYear() }}
        </small>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.custom-navbar {
  background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
  border-bottom: none;
}

.brand-icon {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.nav-link {
  font-weight: 500;
  padding: 0.5rem 1rem !important;
  margin: 0 0.15rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff !important;
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  color: #fff;
}

.logout-btn {
  border-width: 1px;
  transition: all 0.2s ease;
}
.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

@media (max-width: 991.98px) {
  .navbar-nav {
    padding: 1rem 0;
  }
  .nav-link {
    margin: 0.25rem 0;
  }
  .user-section {
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
}
</style>
