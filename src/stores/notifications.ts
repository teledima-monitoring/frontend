import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/services/api'
import type { NotificationView } from '@/types/api'
import { formatError } from '@/utils/format'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<NotificationView[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchNotifications() {
    loading.value = true
    error.value = null

    try {
      notifications.value = await api.getNotifications()
    } catch (e) {
      error.value = formatError(e as Error)
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(id: number) {
    loading.value = true
    error.value = null

    try {
      await api.markAsRead(id)
      notifications.value = await api.getNotifications()
    } catch (e) {
      error.value = formatError(e as Error)
    } finally {
      loading.value = false
    }
  }

  async function markAllAsRead() {
    loading.value = true
    error.value = null

    try {
      await api.markAllAsRead()
      notifications.value = await api.getNotifications()
    } catch (e) {
      error.value = formatError(e as Error)
    } finally {
      loading.value = false
    }
  }

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  }
})
