import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { api } from '@/services/api'
import type { NotificationEvent, IncidentView } from '@/types/api'
import { formatError } from '@/utils/format'

export const useIncidentsStore = defineStore('incidenents', () => {
  const eventSource = ref<EventSource | null>(null)
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

  // Подключение к SSE
  function connect() {
    if (eventSource.value) {
      disconnect()
    }
    eventSource.value = api.listenIncidents()

    eventSource.value.onmessage = (event) => {
      try {
        if (typeof event.data == 'string' && event.data == 'OK') {
          return
        }
        const data = JSON.parse(event.data) as NotificationEvent

        if (typeof data.id !== 'number' || typeof data.fired !== 'boolean') {
          console.warn('Received invalid alert event data:', data)
          return
        }

        fetchIncidents()
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

  // Отключение от SSE
  function disconnect() {
    eventSource.value?.close()
    eventSource.value = null
    connected.value = false
    console.log('SSE connection closed')
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
    connect,
    disconnect,
    exportIncidents,
  }
})
