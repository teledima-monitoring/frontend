<template>
  <AppLayout />
</template>

<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
import { ref, watch } from 'vue'
import { useIncidentsStore } from '@/stores/incident'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from './stores/notifications'
import { storeToRefs } from 'pinia'
import { api } from './services/api'
import { SSESource, type SSEEvent } from '@/types/api'

const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)

const incidentsStore = useIncidentsStore()
const notificationsStore = useNotificationsStore()

const connected = ref<boolean>(false)
const eventSource = ref<EventSource | null>(null)

// Следим за состоянием авторизации
watch(
  isLoggedIn,
  (isLoggedIn) => {
    if (isLoggedIn && !connected.value) {
      connect()
    } else if (!isLoggedIn && connected.value) {
      disconnect()
    }
  },
  { immediate: true },
)

function connect() {
  if (eventSource.value) {
    disconnect()
  }
  eventSource.value = api.listenEvents()

  eventSource.value.onmessage = async (event) => {
    try {
      if (typeof event.data == 'string' && event.data == 'OK') {
        return
      }
      const data = JSON.parse(event.data) as SSEEvent

      if (typeof data.id !== 'number') {
        console.warn('Received invalid alert event data:', data)
        return
      }

      if (data.source == SSESource.Incident) {
        await incidentsStore.fetchIncidents()
        await notificationsStore.fetchNotifications()
      } else if (data.source == SSESource.Task) {
        notificationsStore.fetchNotifications()
      } else {
        console.warn('Received unknown alert source:', data.source)
      }
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

function disconnect() {
  eventSource.value?.close()
  eventSource.value = null
  connected.value = false
  console.log('SSE connection closed')
}
</script>

<style></style>
