<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useIncidentsStore } from '@/stores/incident'
import { storeToRefs } from 'pinia'

const incidentsStore = useIncidentsStore()
const { fetchIncidents, exportIncidents } = incidentsStore
const { incidents } = storeToRefs(incidentsStore)

// Вычисляемые свойства для статистики
const activeIncidents = computed(() => incidents.value.filter(i => i.fired))
const closedIncidents = computed(() => incidents.value.filter(i => !i.fired))

// Форматирование даты
const formatDate = (dateString: Date | string): string => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  fetchIncidents()
})
</script>

<template>
  <div class="container-fluid">
    <h3 class="mb-4">Incidents Management</h3>

    <!-- Statistics Cards -->
    <div class="row mb-4">
      <div class="col-md-4">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <h5 class="card-title">Total Incidents</h5>
            <p class="card-text display-6">{{ incidents.length }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card bg-danger text-white">
          <div class="card-body">
            <h5 class="card-title">Active</h5>
            <p class="card-text display-6">{{ activeIncidents.length }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card bg-success text-white">
          <div class="card-body">
            <h5 class="card-title">Closed</h5>
            <p class="card-text display-6">{{ closedIncidents.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Incidents Table -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span>All Incidents ({{ incidents.length }})</span>
        <div>
          <button class="btn btn-sm btn-outline-success me-2" @click="exportIncidents">
            <i class="bi bi-download"></i> Export CSV
          </button>
          <button class="btn btn-sm btn-outline-secondary" @click="fetchIncidents">
            <i class="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
      </div>
      <div class="card-body p-0">
        <div v-if="incidents.length === 0" class="text-center text-muted py-5">
          <i class="bi bi-inbox display-4"></i>
          <p class="mt-3">No incidents found</p>
        </div>
        <table v-else class="table table-striped table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Name</th>
              <th>Alert Name</th>
              <th>Fired At</th>
              <th>Updated At</th>
              <th>Assignee</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="incident in incidents" 
              :key="incident.id"
              :class="{ 'table-danger': incident.fired }"
            >
              <td>{{ incident.id }}</td>
              <td>
                <span 
                  class="badge" 
                  :class="incident.fired ? 'bg-danger' : 'bg-success'"
                >
                  {{ incident.fired ? 'Active' : 'Closed' }}
                </span>
              </td>
              <td>{{ incident.name }}</td>
              <td>{{ incident.alertName }}</td>
              <td>{{ formatDate(incident.createDt) }}</td>
              <td>{{ formatDate(incident.updateDt) }}</td>
              # TODO: make link to /tasks/:id
              <td>{{ incident.taskKey || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-danger {
  --bs-table-bg: rgba(220, 53, 69, 0.1);
}
</style>
