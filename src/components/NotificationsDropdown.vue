<script setup lang="ts">
import { useNotificationsStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'

const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)

const notificationsStore = useNotificationsStore()
const { notifications, loading, error } = storeToRefs(notificationsStore)
const { fetchNotifications, markAsRead, markAllAsRead } = notificationsStore

// Подсчет непрочитанных уведомлений
const unreadCount = computed(() => notifications.value.filter((n) => !n.readed).length)

const handleMarkAsRead = async (id: number) => {
  await markAsRead(id)
}

const handleMarkAllAsRead = async () => {
  await markAllAsRead()
}

// Загружаем уведомления при монтировании, если пользователь авторизован
onMounted(() => {
  if (isLoggedIn.value) {
    fetchNotifications()
  }
})
</script>

<template>
  <div class="dropdown">
    <!-- Кнопка-колокольчик -->
    <button
      class="btn btn-outline-light btn-sm position-relative notification-btn"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      @click="fetchNotifications"
      title="Уведомления"
    >
      <i class="bi bi-bell-fill"></i>
      <!-- Бейдж с количеством непрочитанных -->
      <span
        v-if="unreadCount > 0"
        class="badge bg-danger rounded-pill position-absolute"
        style="top: -4px; right: -4px; font-size: 0.65rem"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Выпадающее меню -->
    <ul class="dropdown-menu dropdown-menu-end shadow-lg notification-menu">
      <!-- Заголовок -->
      <li
        class="dropdown-header d-flex justify-content-between align-items-center border-bottom pb-2 mb-2"
      >
        <span class="fw-bold text-dark">Уведомления</span>
        <button
          v-if="unreadCount > 0"
          class="btn btn-link btn-sm text-decoration-none p-0 text-primary fw-semibold"
          @click="handleMarkAllAsRead"
          :disabled="loading"
        >
          Прочитать все
        </button>
      </li>

      <!-- Список уведомлений -->
      <div class="notification-list" style="max-height: 320px; overflow-y: auto">
        <li v-if="loading && notifications.length === 0" class="text-center text-muted py-3">
          <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
          <span class="ms-2 small">Загрузка...</span>
        </li>
        <li v-else-if="error" class="text-center text-danger py-3 px-2 small">
          Ошибка: {{ error }}
        </li>
        <li v-else-if="notifications.length === 0" class="text-center text-muted py-3 small">
          <i class="bi bi-inbox d-block mb-1" style="font-size: 1.5rem"></i>
          Нет новых уведомлений
        </li>
        <li v-else v-for="notif in notifications" :key="notif.id">
          <a
            class="dropdown-item py-2 px-3 d-flex align-items-start gap-2 notification-item"
            :class="{ unread: !notif.readed }"
            href="#"
            @click.prevent="handleMarkAsRead(notif.id)"
          >
            <div class="mt-1">
              <i
                v-if="!notif.readed"
                class="bi bi-circle-fill text-primary"
                style="font-size: 0.5rem"
              ></i>
              <i v-else class="bi bi-check-circle text-muted" style="font-size: 0.9rem"></i>
            </div>
            <div class="flex-grow-1">
              <div class="small text-break text-dark">{{ notif.text }}</div>
              <div class="text-muted" style="font-size: 0.7rem">
                {{ new Date(notif.dt).toLocaleString() }}
              </div>
            </div>
          </a>
        </li>
      </div>
    </ul>
  </div>
</template>

<style scoped>
.notification-btn {
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.notification-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.notification-menu {
  width: 340px;
  padding: 0.75rem 0;
  border: none;
  border-radius: 12px;
  margin-top: 0.5rem !important;
}

.notification-item {
  white-space: normal;
  transition: background-color 0.2s;
  border-radius: 8px;
  margin: 0 0.25rem;
}
.notification-item.unread {
  background-color: rgba(78, 115, 223, 0.06);
}
.notification-item:hover {
  background-color: #f8f9fa;
}

/* Кастомный скроллбар для списка */
.notification-list::-webkit-scrollbar {
  width: 6px;
}
.notification-list::-webkit-scrollbar-track {
  background: transparent;
}
.notification-list::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}
</style>
