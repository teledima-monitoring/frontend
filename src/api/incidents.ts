import { request } from '@/api/core'
import type { IncidentSetTask, IncidentView } from '@/types/incident'

export default {
  getIncidents: async () => request<Array<IncidentView>>('/incidents'),
  setIncidentTask: async (incidentId: number, data: IncidentSetTask) =>
    request<void>(`/incidents/${incidentId}/task`, { method: 'PUT', body: JSON.stringify(data) }),
  exportIncidentsCSV: async (): Promise<void> => {
    const response = await request<string>('/incidents/export', {
      method: 'GET',
      headers: {
        Accept: 'text/csv',
        'Content-Type': 'text/csv',
      },
      credentials: 'include',
    })

    const filename = `incidents_${new Date().toISOString().split('T')[0]}.csv`

    // Создаем ссылку для скачивания
    const blob = new Blob([response], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()

    // Очистка
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  },
}
