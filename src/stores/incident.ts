import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/services/api'
import type { NotificationEvent, IncidentView } from '@/types/api'

export const useIncidentsStore = defineStore('sse', () => {
  const eventSource = ref<EventSource | null>(null)
  const connected = ref(false)
  const incidents = ref<IncidentView[]>([])

  async function fetchIncidents() {
    const data = await api.getIncidents()
    incidents.value = data
  }
  
  // Подключение к SSE
  function connect() {
    if (eventSource.value) {
      disconnect()
    }
    
    eventSource.value = api.listenIncidents()
    
    eventSource.value.onmessage = (event) => {
      try {
        if (typeof event.data == "string" && event.data == "OK") {
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
  
  return {
    connected,
    incidents,
    fetchIncidents,
    connect,
    disconnect,
  }
})
