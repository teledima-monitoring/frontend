<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAlertsStore } from '@/stores/alerts'
import { useSSEStore } from '@/stores/sse'
import { storeToRefs } from 'pinia'

const alertsStore = useAlertsStore()
const sseStore = useSSEStore()
const { alerts: alertConfigs } = storeToRefs(alertsStore)
const { connected, incidents } = storeToRefs(sseStore)
const { clearIncidents } = sseStore

const incidentsWithNames = computed(() => {
  return incidents.value.map((incident) => {
    const alertConfig = alertConfigs.value.find((a) => a.id === incident.alertId)
    return {
      ...incident,
      alertName: alertConfig?.name ?? `Alert #${incident.alertId}`,
    }
  })
})

// Функция для ручного переподключения (если нужно)
const reconnect = () => {
  sseStore.disconnect()
  sseStore.connect()
}

onMounted(() => {
  alertsStore.fetchAlerts()
})
</script>

<template>
  <div class="container-fluid">
    <h3 class="mb-4">Incidents</h3>
    <!-- Connection status and controls -->
    <div class="card mb-4">
      <div class="card-body d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-2">
          <span :class="['badge', connected ? 'bg-success' : 'bg-danger']">
            {{ connected ? 'Connected' : 'Disconnected' }}
          </span>
          <small class="text-muted">Listening via SSE to alert events</small>
        </div>
        <div class="d-flex gap-2">
          <button v-if="!connected" class="btn btn-sm btn-outline-secondary" @click="reconnect">
            Reconnect
          </button>
          <button class="btn btn-sm btn-outline-danger" @click="clearIncidents">
            Clear History
          </button>
        </div>
      </div>
    </div>

    <!-- Incidents Table -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span>Event Log ({{ incidents.length }})</span>
      </div>
      <div class="card-body p-0" style="max-height: 500px; overflow-y: auto">
        <table class="table table-striped table-hover mb-0">
          <thead class="sticky-top bg-white">
            <tr>
              <th>Time</th>
              <th>Alert</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="incidentsWithNames.length === 0">
              <td colspan="3" class="text-center text-muted py-4">No incidents yet</td>
            </tr>
            <tr v-for="incident in incidentsWithNames" :key="incident.id">
              <td>{{ incident.timestamp }}</td>
              <td>{{ incident.alertName }} (ID: {{ incident.alertId }})</td>
              <td>
                <span :class="incident.fired ? 'badge bg-danger' : 'badge bg-success'">
                  {{ incident.fired ? '🚨 Triggered' : '✅ Cleared' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
