<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { storeToRefs } from 'pinia'
import MetricChart from '@/components/MetricChart.vue'
import DashboardList from '@/components/dashboard/DashboardList.vue'
import DashboardForm from '@/components/dashboard/DashboardForm.vue'

const dashboardStore = useDashboardStore()
const { series, loading, error, userDashboards, selectedDashboard, availableLabelKeys } =
  storeToRefs(dashboardStore)
const {
  fetchMetrics,
  selectDashboard,
  createDashboard,
  updateDashboard,
  removeDashboard,
  fetchDashboards,
} = dashboardStore

const startTime = ref<Date>(new Date(Date.now() - 24 * 60 * 60 * 1000))
const endTime = ref<Date>(new Date())
const showForm = ref(false)
const editingId = ref<number | null>(null)

// Computed для двусторонней связи
const startTimeInput = computed({
  get: () => formatForInput(startTime.value),
  set: (value: string) => {
    startTime.value = parseFromInput(value)
  },
})

const endTimeInput = computed({
  get: () => formatForInput(endTime.value),
  set: (value: string) => {
    endTime.value = parseFromInput(value)
  },
})

// Форматирование для datetime-local input (локальное время)
function formatForInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Форматирование для API (ISO 8601 / UTC)
function formatForApi(date: Date): string {
  return date.toISOString()
}

// Парсинг строки из input обратно в Date
function parseFromInput(value: string): Date {
  return new Date(value)
}

async function handleFetch() {
  if (!selectedDashboard.value) {
    alert('Please select a dashboard first')
    return
  }
  await fetchMetrics({
    start: formatForApi(startTime.value),
    end: formatForApi(endTime.value),
    kind: selectedDashboard.value.collectorKind,
    metricName: selectedDashboard.value.metricName,
    filters: selectedDashboard.value.filters,
  })
}

function handleSelect(id: number) {
  selectDashboard(id)
  handleFetch()
}

function handleCreate() {
  editingId.value = null
  showForm.value = true
}

function handleEdit(id: number) {
  editingId.value = id
  showForm.value = true
}

async function handleDelete(id: number) {
  if (confirm('Delete this dashboard?')) {
    await removeDashboard(id)
  }
}

async function handleSave(data: {
  name: string
  collectorKind: string
  metricName: string
  filters: Record<string, string>
  groupBy: string
}) {
  if (editingId.value) {
    await updateDashboard(editingId.value, data)
  } else {
    await createDashboard(data)
  }
  showForm.value = false
  editingId.value = null
}

function handleCancel() {
  showForm.value = false
  editingId.value = null
}

onMounted(async () => {
  await fetchDashboards()
})
</script>

<template>
  <div class="container-fluid">
    <h3 class="mb-4">Dashboard</h3>

    <!-- Error -->
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div class="row">
      <!-- Sidebar: Dashboard list + form -->
      <div class="col-md-4">
        <div class="card mb-3">
          <div class="card-body">
            <!-- Form modal-like inline -->
            <div v-if="showForm" class="mb-3 p-3 border rounded bg-light">
              <h6 class="mb-2">{{ editingId ? 'Edit Dashboard' : 'New Dashboard' }}</h6>
              <DashboardForm
                :initial="editingId ? userDashboards.find((d) => d.id === editingId) : undefined"
                :available-label-keys="availableLabelKeys"
                @save="handleSave"
                @cancel="handleCancel"
              />
            </div>

            <DashboardList
              :dashboards="userDashboards"
              :selected-id="selectedDashboard?.id ?? null"
              @select="handleSelect"
              @delete="handleDelete"
              @edit="handleEdit"
              @create="handleCreate"
            />
          </div>
        </div>

        <!-- Time range -->
        <div class="card">
          <div class="card-body">
            <form @submit.prevent="handleFetch" class="row g-3 align-items-end">
              <div class="col-12">
                <label for="start-time" class="form-label">Start</label>
                <input
                  id="start-time"
                  v-model="startTimeInput"
                  type="datetime-local"
                  class="form-control"
                  :step="60"
                />
              </div>
              <div class="col-12">
                <label for="end-time" class="form-label">End</label>
                <input
                  id="end-time"
                  v-model="endTimeInput"
                  type="datetime-local"
                  class="form-control"
                  :step="60"
                />
              </div>
              <div class="col-12">
                <button
                  type="submit"
                  class="btn btn-primary w-100"
                  :disabled="loading || !selectedDashboard"
                >
                  {{ loading ? 'Loading...' : 'Fetch Metrics' }}
                </button>
              </div>
            </form>

            <!-- Selected dashboard info -->
            <div v-if="selectedDashboard" class="mt-3 small text-muted">
              <strong>Kind:</strong> {{ selectedDashboard.collectorKind }}<br />
              <strong>Metric:</strong> {{ selectedDashboard.metricName }}<br />
              <strong>Group by:</strong>
              {{
                selectedDashboard.groupBy === 'none'
                  ? 'None (aggregated)'
                  : selectedDashboard.groupBy
              }}
            </div>
          </div>
        </div>
      </div>

      <!-- Main: Chart -->
      <div class="col-md-8">
        <div class="card">
          <div class="card-body">
            <MetricChart :series="series" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
