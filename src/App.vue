<template>
  <AppLayout />

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
            <div class="fw-semibold small text-danger mb-1">{{ $t('newToast') }}</div>
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

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useIncidentsStore } from '@/stores/incident'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { storeToRefs } from 'pinia'
import { api } from '@/services/api'
import { SSESource, type SSEEvent } from '@/types/sse'
import AppLayout from '@/components/AppLayout.vue'
import { useSettingsStore } from './stores/settings'

const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)

const incidentsStore = useIncidentsStore()
const notificationsStore = useNotificationsStore()

const settingsStore = useSettingsStore()

const connected = ref<boolean>(false)
const eventSource = ref<EventSource | null>(null)

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

<style scoped>
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
</style>
