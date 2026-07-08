import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { api } from '@/services/api'
import type { IncidentView, IncidentSetTask } from '@/types/incident'
import { formatError } from '@/utils/format'

export const useIncidentsStore = defineStore('incidenents', () => {
  const connected = shallowRef(false)
  const incidents = ref<IncidentView[]>([])
  const error = shallowRef<string | null>(null)

  async function fetchIncidents() {
    error.value = null

    try {
      const data = await api.getIncidents()
      incidents.value = data
    } catch (e) {
      error.value = formatError(e as Error, 'failure fetching incidents')
    }
  }

  async function setIncidentTask(incidentId: number, taskId: number) {
    error.value = null
    const data: IncidentSetTask = { task_id: taskId }

    try {
      await api.setIncidentTask(incidentId, data)
    } catch (e) {
      error.value = formatError(e as Error, 'Failed to set incident task')
    }
  }

  // Экспорт инцидентов в CSV
  async function exportIncidents() {
    error.value = null

    try {
      await api.exportIncidentsCSV()
    } catch (e) {
      error.value = formatError(e as Error, 'Failed to export incidents')
      throw error
    }
  }

  return {
    connected,
    incidents,
    fetchIncidents,
    setIncidentTask,
    exportIncidents,
  }
})
