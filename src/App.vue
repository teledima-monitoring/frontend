<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useIncidentsStore } from '@/stores/incident'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { storeToRefs } from 'pinia'
import { api } from '@/services/api'
import { SSESource, type SSEEvent } from '@/types/sse'
import { useSettingsStore } from './stores/settings'
import { useRoute, useRouter } from 'vue-router'
import SelectLanguage from './components/SelectLanguage.vue'

const authStore = useAuthStore()
const { isLoggedIn, user } = storeToRefs(authStore)

const incidentsStore = useIncidentsStore()
const notificationsStore = useNotificationsStore()

const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)

const connected = ref<boolean>(false)
const eventSource = ref<EventSource | null>(null)

const route = useRoute()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  await router.push({ name: 'Login', query: { redirect: route.fullPath } })
}

const handleNewLanguage = (newLocale: string) => {
  settingsStore.setLanguage(newLocale)
}

// --- Логика всплывающих уведомлений (Toast) ---
const toasts = ref<Array<{ id: number; text: string }>>([])
let toastIdCounter = 0
const lastShownNotificationId = ref<number | null>(null)

function showToast(text: string) {
  const id = ++toastIdCounter
  toasts.value.push({ id, text })

  // Автоматически скрываем уведомление через 4 секунды
  setTimeout(() => {
    removeToast(id)
  }, 4000)
}

function removeToast(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}
// ----------------------------------------------

// Следим за состоянием авторизации
watch(
  isLoggedIn,
  (isLoggedIn) => {
    if (isLoggedIn && !connected.value) {
      connect()
    } else if (!isLoggedIn && connected.value) {
      disconnect()
    }
  },
  { immediate: true },
)

onMounted(async () => {
  await settingsStore.load()
})

function connect() {
  if (eventSource.value) {
    disconnect()
  }
  eventSource.value = api.listenEvents()

  eventSource.value.onmessage = async (event) => {
    try {
      if (typeof event.data == 'string' && event.data == 'OK') {
        return
      }
      const data = JSON.parse(event.data) as SSEEvent

      if (typeof data.id !== 'number') {
        console.warn('Received invalid alert event data:', data)
        return
      }

      if (data.source == SSESource.Incident) {
        await incidentsStore.fetchIncidents()
        await notificationsStore.fetchNotifications()
      } else if (data.source == SSESource.Task) {
        await notificationsStore.fetchNotifications()
      } else {
        console.warn('Received unknown alert source:', data.source)
      }

      // Показываем всплывающее сообщение с текстом последнего уведомления
      const notifications = notificationsStore.notifications as
        | Array<{ id: number; text: string }>
        | undefined
      const latestNotification = notifications?.[0]

      if (latestNotification && latestNotification.id !== lastShownNotificationId.value) {
        lastShownNotificationId.value = latestNotification.id
        showToast(latestNotification.text)
      }
    } catch (err) {
      console.error('Failed to parse SSE event:', event.data, err)
    }
  }

  eventSource.value.onopen = () => {
    connected.value = true
    console.log('SSE connection established')
  }

  eventSource.value.onerror = () => {
    connected.value = false
    console.error('SSE connection error')
  }
}

function disconnect() {
  eventSource.value?.close()
  eventSource.value = null
  connected.value = false
  console.log('SSE connection closed')
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
          <span class="fw-bold">{{ $t('app.title') }}</span>
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
                <i class="bi bi-graph-up me-1"></i>{{ $t('app.nav.dashboard') }}
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                :class="{ active: route.path === '/alerts' }"
                to="/alerts"
              >
                <i class="bi bi-bell me-1"></i>{{ $t('app.nav.alerts') }}
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                :class="{ active: route.path === '/incidents' }"
                to="/incidents"
              >
                <i class="bi bi-exclamation-triangle me-1"></i>{{ $t('app.nav.incidents') }}
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                :class="{ active: route.path.startsWith('/tasks') }"
                to="/tasks"
              >
                <i class="bi bi-kanban me-1"></i>{{ $t('app.nav.tasks') }}
              </router-link>
            </li>
          </ul>

          <div class="d-flex align-items-center gap-3 user-section">
            <SelectLanguage :locale="settings.locale" @changed="handleNewLanguage" />

            <NotificationsDropdown />

            <!-- User Info & Logout -->
            <div class="user-info-wrapper position-relative d-flex align-items-center text-white">
              <div class="user-avatar me-2">
                {{ user.firstName ? user.firstName.charAt(0).toUpperCase() : '?' }}
              </div>

              <!-- Кастомный Tooltip -->
              <div class="custom-tooltip text-start">
                <div class="fw-bold mb-1 text-dark">
                  {{ user.firstName }} {{ user.secondName }} {{ user.thirdName }}
                </div>
                <div class="small text-muted mb-1">
                  <i class="bi bi-briefcase me-1"></i
                  >{{ user.jobTitle || $t('app.user.jobTitleEmpty') }}
                </div>
                <div class="small text-muted">
                  <i class="bi bi-envelope me-1"></i>{{ user.email || $t('app.user.emailEmpty') }}
                </div>
              </div>
            </div>

            <button class="btn btn-outline-light btn-sm logout-btn" @click="handleLogout">
              <i class="bi bi-box-arrow-right me-1"></i>{{ $t('app.logout') }}
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

  <!-- Контейнер для всплывающих уведомлений (справа внизу) -->
  <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1080">
    <transition-group name="toast-fade">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast show custom-toast mb-2"
        role="alert"
      >
        <div class="toast-body d-flex align-items-center">
          <div class="toast-icon me-3">
            <i class="bi bi-bell-fill"></i>
          </div>
          <div class="flex-grow-1">
            <div class="fw-semibold small text-danger mb-1">{{ $t('newNotification') }}</div>
            <div class="text-dark">{{ toast.text }}</div>
          </div>
          <button
            type="button"
            class="btn-close ms-2"
            aria-label="Close"
            @click="removeToast(toast.id)"
          ></button>
        </div>
      </div>
    </transition-group>
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

/* Стили для нового блока с пользователем и тултипа */
.user-info-wrapper {
  cursor: pointer;
}

.custom-tooltip {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 12px;
  background: #fff;
  color: #212529;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  width: max-content;
  max-width: 280px;
  z-index: 1050;
  transition:
    opacity 0.2s ease,
    visibility 0.2s ease,
    transform 0.2s ease;
  transform: translateY(-5px);
  pointer-events: none;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* Стрелочка у тултипа (опционально, для красоты) */
.custom-tooltip::before {
  content: '';
  position: absolute;
  top: -6px;
  right: 16px;
  width: 12px;
  height: 12px;
  background: #fff;
  border-left: 1px solid rgba(0, 0, 0, 0.05);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  transform: rotate(45deg);
}

.user-info-wrapper:hover .custom-tooltip {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
}

.logout-btn {
  border-width: 1px;
  transition: all 0.2s ease;
}
.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

/* Стили для кастомного тоста */
.custom-toast {
  background: #fff;
  border: none;
  border-radius: 12px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.1),
    0 1px 4px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #dc3545;
  overflow: hidden;
  min-width: 320px;
  max-width: 400px;
  backdrop-filter: blur(10px);
}

.custom-toast .toast-body {
  padding: 1rem 1.25rem;
  font-size: 0.9rem;
}

.toast-icon {
  width: 36px;
  height: 36px;
  background: rgba(220, 53, 59, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: #dc3545;
  flex-shrink: 0;
}

/* Анимация появления и исчезновения тостов (адаптирована для нижнего правого угла) */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translateY(20px) translateX(20px) scale(0.95);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) translateX(20px) scale(0.95);
}

.toast-fade-move {
  transition: transform 0.3s ease;
}

/* Адаптив для мобильных устройств */
@media (max-width: 576px) {
  .toast-container {
    left: 0;
    right: 0;
    top: auto;
    bottom: 0;
    padding: 1rem;
  }
  .custom-toast {
    min-width: 100%;
    max-width: 100%;
  }
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
