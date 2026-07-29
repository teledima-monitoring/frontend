import { request } from '@/api/core'
import type { NotificationView } from '@/types/notification'

export default {
  getNotifications: async () => request<NotificationView[]>('/notifications'),
  markAsRead: async (notificationId: number) =>
    request<void>(`/notifications/${notificationId}/read`, { method: 'POST' }),
  markAllAsRead: async () => request<void>('/notifications/read-all', { method: 'POST' }),
}
