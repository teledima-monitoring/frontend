import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { api } from '@/services/api'
import { useAuthStore } from './auth'
import type { AlertEvent, Incident } from '@/types/api'

export const useSSEStore = defineStore('sse', () => {
  const eventSource = ref<EventSource | null>(null)
  const connected = ref(false)
  const incidents = ref<Incident[]>([])
  
  // Функция для добавления нового инцидента
  const addIncident = (alertId: number, fired: boolean) => {
    incidents.value.unshift({
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      alertId,
      fired,
    })
    
    // Keep max 100 incidents in memory
    if (incidents.value.length > 100) {
      incidents.value = incidents.value.slice(0, 100)
    }
  }
  
  // Функция для очистки истории
  const clearIncidents = () => {
    incidents.value = []
  }
  
  // Подключение к SSE
  const connect = () => {
    if (eventSource.value) {
      disconnect()
    }
    
    eventSource.value = api.listenAlerts()
    
    eventSource.value.onmessage = (event) => {
      try {
        if (typeof event.data == "string" && event.data == "OK") {
            return
        }
        const data = JSON.parse(event.data) as AlertEvent
        
        if (typeof data.alertId !== 'number' || typeof data.fired !== 'boolean') {
          console.warn('Received invalid alert event data:', data)
          return
        }
        
        addIncident(data.alertId, data.fired)
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
  const disconnect = () => {
    eventSource.value?.close()
    eventSource.value = null
    connected.value = false
    console.log('SSE connection closed')
  }
  
  return {
    connected,
    incidents,
    connect,
    disconnect,
    clearIncidents,
  }
})
