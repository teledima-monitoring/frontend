<script setup lang="ts">
import { onMounted, shallowRef, computed, useTemplateRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useIncidentsStore } from '@/stores/incident'
import TaskAssignDialog from '@/components/tasks/TaskAssignDialog.vue'
import { formatDate } from '@/utils/format'

const selectedIncidentId = shallowRef<number>(-1)

const incidentsStore = useIncidentsStore()
const { fetchIncidents, exportIncidents } = incidentsStore
const { incidents } = storeToRefs(incidentsStore)

const taskDialogRef = useTemplateRef<typeof TaskAssignDialog>('taskDialogRef')

const activeIncidents = computed(() => incidents.value.filter((i) => i.fired))
const closedIncidents = computed(() => incidents.value.filter((i) => !i.fired))

async function openAssignDialog(incidentId: number) {
  selectedIncidentId.value = incidentId
  await taskDialogRef.value?.openDialog()
}

async function handleTaskAssigned() {
  await fetchIncidents()
}

onMounted(() => {
  fetchIncidents()
})
</script>

<template>
  <div class="container-fluid py-4">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold mb-1">
          <i class="bi bi-exclamation-octagon me-2 text-danger"></i>{{ $t('incident.title') }}
        </h3>
        <p class="text-muted mb-0">{{ $t('incident.description') }}</p>
      </div>
      <button class="btn btn-outline-success shadow-sm" @click="exportIncidents">
        <i class="bi bi-download me-2"></i> {{ $t('exportCSV') }}
      </button>
    </div>

    <!-- Statistics Cards -->
    <div class="row g-4 mb-4">
      <div class="col-md-4">
        <div class="card border-0 shadow-sm stat-card h-100">
          <div class="card-body d-flex align-items-center p-4">
            <div class="stat-icon bg-primary bg-opacity-10 text-primary me-3">
              <i class="bi bi-list-task"></i>
            </div>
            <div>
              <p class="text-muted mb-1 small fw-semibold text-uppercase">
                {{ $t('incident.total') }}
              </p>
              <h3 class="fw-bold mb-0">{{ incidents.length }}</h3>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm stat-card h-100">
          <div class="card-body d-flex align-items-center p-4">
            <div class="stat-icon bg-danger bg-opacity-10 text-danger me-3">
              <i class="bi bi-fire"></i>
            </div>
            <div>
              <p class="text-muted mb-1 small fw-semibold text-uppercase">
                {{ $t('incident.active') }}
              </p>
              <h3 class="fw-bold mb-0 text-danger">{{ activeIncidents.length }}</h3>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm stat-card h-100">
          <div class="card-body d-flex align-items-center p-4">
            <div class="stat-icon bg-success bg-opacity-10 text-success me-3">
              <i class="bi bi-check-circle"></i>
            </div>
            <div>
              <p class="text-muted mb-1 small fw-semibold text-uppercase">
                {{ $t('incident.active') }}
              </p>
              <h3 class="fw-bold mb-0 text-success">{{ closedIncidents.length }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Incidents Table -->
    <div class="card border-0 shadow-sm table-card">
      <div
        class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center"
      >
        <h6 class="mb-0 fw-bold">
          <i class="bi bi-inbox me-2 text-primary"></i>{{ $t('incident.all') }}
        </h6>
        <button class="btn btn-sm btn-outline-secondary shadow-sm" @click="fetchIncidents">
          <i class="bi bi-arrow-clockwise me-1"></i>{{ $t('incident.refresh') }}
        </button>
      </div>
      <div class="card-body p-0">
        <div v-if="incidents.length === 0" class="text-center py-5">
          <i class="bi bi-shield-check display-1 text-muted d-block mb-3"></i>
          <h5 class="text-muted">{{ $t('incident.empty.title') }}</h5>
          <p class="text-muted">{{ $t('incident.empty.text') }}</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4">{{ $t('incident.table.key') }}</th>
                <th>{{ $t('incident.table.alertName') }}</th>
                <th>{{ $t('incident.table.status') }}</th>
                <th>{{ $t('incident.table.created') }}</th>
                <th>{{ $t('incident.table.updated') }}</th>
                <th>{{ $t('incident.table.linkedTask') }}</th>
                <th class="text-end pe-4">{{ $t('incident.table.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="incident in incidents"
                :key="incident.id"
                :class="{ 'table-row-danger': incident.fired }"
              >
                <td class="ps-4 fw-semibold text-muted">{{ incident.key }}</td>
                <td class="fw-bold">{{ incident.alertName }}</td>
                <td>
                  <span
                    class="badge status-pill"
                    :class="
                      incident.fired
                        ? 'bg-danger bg-opacity-10 text-danger'
                        : 'bg-success bg-opacity-10 text-success'
                    "
                  >
                    <i
                      :class="incident.fired ? 'bi bi-circle-fill' : 'bi bi-check-circle-fill'"
                      class="me-1"
                      style="font-size: 0.5rem; vertical-align: middle"
                    ></i>
                    {{
                      incident.fired ? $t('incident.status.active') : $t('incident.status.closed')
                    }}
                  </span>
                </td>
                <td class="text-muted small">{{ formatDate(incident.createDt) }}</td>
                <td class="text-muted small">{{ formatDate(incident.updateDt) }}</td>
                <td>
                  <router-link
                    v-if="incident.taskId"
                    :to="{ name: 'TaskDetail', params: { id: incident.taskId } }"
                    class="text-decoration-none fw-semibold"
                  >
                    <i class="bi bi-link-45deg me-1"></i> {{ incident.taskKey }}
                  </router-link>
                  <span v-else class="text-muted">—</span>
                </td>
                <td class="text-end pe-4">
                  <button
                    class="btn btn-sm btn-outline-primary shadow-sm"
                    @click="openAssignDialog(incident.id)"
                  >
                    <i class="bi bi-plus-lg me-1"></i>{{ $t('incident.assignTask') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <TaskAssignDialog
      ref="taskDialogRef"
      :incident-id="selectedIncidentId"
      @assigned="handleTaskAssigned"
    />
  </div>
</template>

<style scoped>
.stat-card {
  border-radius: 12px;
  transition: transform 0.2s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
}
.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.table-card {
  border-radius: 12px;
  overflow: hidden;
}
.table > :not(caption) > * > * {
  padding: 1rem 0.75rem;
}
.table-row-danger {
  --bs-table-bg: rgba(220, 53, 69, 0.04);
}
.status-pill {
  padding: 0.4em 0.8em;
  font-weight: 600;
  border-radius: 20px;
  font-size: 0.8rem;
}
</style>
