import { request } from '@/api/core'
import type { DashboardCreate, DashboardUpdate, DashboardView } from '@/types/dashboard'

export default {
  getDashboards: async () => request<Array<DashboardView>>('/dashboards'),
  createDashboard: async (data: DashboardCreate) =>
    request<void>('/dashboards', { method: 'POST', body: JSON.stringify(data) }),
  updateDashboard: async (id: number, data: DashboardUpdate) =>
    request<void>(`/dashboards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDashboard: async (id: number) => request<void>(`/dashboards/${id}`, { method: 'DELETE' }),
}
