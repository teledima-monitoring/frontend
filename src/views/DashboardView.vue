<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { storeToRefs } from 'pinia'
import MetricChart from '@/components/MetricChart.vue'
import DashboardList from '@/components/dashboard/DashboardList.vue'
import DashboardForm from '@/components/dashboard/DashboardForm.vue'

const dashboardStore = useDashboardStore()
const { error, userDashboards, selectedDashboard } = storeToRefs(dashboardStore)
const { selectDashboard, createDashboard, updateDashboard, removeDashboard, fetchDashboards } =
  dashboardStore

const showForm = ref(false)
const editingId = ref<number | null>(null)

function handleSelect(id: number) {
  selectDashboard(id)
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
  if (confirm('Delete this dashboard?')) await removeDashboard(id)
}

async function handleSave(data: any) {
  if (editingId.value) await updateDashboard(editingId.value, data)
  else await createDashboard(data)
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
  <div class="container-fluid py-4">
    <!-- Page Header -->
    <div class="mb-4">
      <h3 class="fw-bold mb-1"><i class="bi bi-graph-up-arrow me-2 text-primary"></i>Dashboard</h3>
      <p class="text-muted mb-0">Monitor metrics and visualize system performance.</p>
    </div>

    <div v-if="error" class="alert alert-danger d-flex align-items-center shadow-sm">
      <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ error }}
    </div>

    <!-- Chart Section (Full Width) -->
    <div class="row g-4 mb-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm chart-card">
          <div class="card-body p-0 d-flex flex-column chart-card-body">
            <MetricChart />
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboards Section (Below Chart) -->
    <div class="row g-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <h6 class="fw-bold text-uppercase text-muted small mb-3">
              <i class="bi bi-collection me-2"></i>Dashboards
            </h6>

            <!-- Inline Form -->
            <div v-if="showForm" class="mb-4 p-3 bg-light border rounded-3">
              <h6 class="fw-bold mb-3">
                <i class="bi bi-pencil-square me-2"></i>{{ editingId ? 'Edit' : 'New' }} Dashboard
              </h6>
              <DashboardForm
                :initial="editingId ? userDashboards.find((d) => d.id === editingId) : undefined"
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
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-card {
  border-radius: 12px;
  overflow: hidden;
  min-height: 650px;
}

.chart-card-body {
  height: 100%;
  min-height: 650px;
}
</style>
