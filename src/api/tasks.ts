import { request } from '@/api/core'
import type { TaskCreate, TaskUpdate, TaskView } from '@/types/task'

export default {
  getTasks: async () => request<TaskView[]>('/tasks'),
  createTask: async (data: TaskCreate) =>
    request<void>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  getTaskById: async (id: number) => request<TaskView>(`/tasks/${id}`),
  updateTask: async (id: number, data: TaskUpdate) =>
    request<void>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  exportTasksCSV: async (ids?: number[]): Promise<void> => {
    const response = await request<string>('/tasks/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/csv',
        Accept: 'text/csv',
      },
      credentials: 'include',
      body: ids ? JSON.stringify({ ids }) : undefined,
    })

    const blob = new Blob([response], { type: 'text/csv' })
    const filename = `tasks_${new Date().toISOString().split('T')[0]}.csv`

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()

    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  },
}
