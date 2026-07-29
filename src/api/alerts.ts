import { request } from '@/api/core'
import type { AlertConfigCreate, AlertConfigUpdate, AlertConfigView } from '@/types/alert'

export default {
  getAlerts: async () => request<Array<AlertConfigView>>('/alerts'),
  createAlert: async (data: AlertConfigCreate) =>
    request<void>('/alerts', { method: 'POST', body: JSON.stringify(data) }),
  updateAlert: async (id: number, data: AlertConfigUpdate) =>
    request<void>(`/alerts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAlert: async (id: number) => request<void>(`/alerts/${id}`, { method: 'DELETE' }),
}
