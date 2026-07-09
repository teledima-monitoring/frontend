<script setup lang="ts">
interface DashboardSummary {
  id: number
  name: string
  collectorKind: string
  metricName: string
  groupBy: string
}

const props = defineProps<{
  dashboards: DashboardSummary[]
  selectedId: number | null
}>()

const emit = defineEmits<{
  select: [id: number]
  delete: [id: number]
  edit: [id: number]
  create: []
}>()

const groupByLabel = (groupBy: string) => {
  if (groupBy === 'none') return 'aggregated'
  if (groupBy === 'collector') return 'by collector'
  return `by ${groupBy}`
}
</script>

<template>
  <div class="dashboard-list">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="mb-0 fw-bold">
        <i class="bi bi-grid-3x3-gap me-2 text-primary"></i>{{ $t('dashboard.list.title') }}
      </h6>
      <button class="btn btn-sm btn-primary shadow-sm" @click="emit('create')">
        <i class="bi bi-plus-lg me-1"></i>{{ $t('dashboard.list.new') }}
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="props.dashboards.length === 0" class="empty-state text-center py-4">
      <div class="empty-icon mx-auto mb-2">
        <i class="bi bi-inbox"></i>
      </div>
      <p class="text-muted small mb-0">{{ $t('dashboard.list.empty') }}</p>
    </div>

    <!-- Dashboard Cards -->
    <div v-else class="dashboard-cards">
      <div
        v-for="dash in props.dashboards"
        :key="dash.id"
        class="dashboard-card"
        :class="{ selected: dash.id === props.selectedId }"
        @click="emit('select', dash.id)"
      >
        <div class="d-flex justify-content-between align-items-start">
          <div class="flex-grow-1">
            <div class="d-flex align-items-center mb-2">
              <div class="dashboard-icon me-2">
                <i class="bi bi-graph-up"></i>
              </div>
              <h6 class="mb-0 fw-semibold">{{ dash.name }}</h6>
            </div>
            <div class="dashboard-meta">
              <span class="meta-item">
                <i class="bi bi-cpu me-1"></i>{{ dash.collectorKind }}
              </span>
              <span class="meta-item">
                <i class="bi bi-activity me-1"></i>{{ dash.metricName }}
              </span>
              <span class="meta-item">
                <i class="bi bi-diagram-3 me-1"></i>{{ groupByLabel(dash.groupBy) }}
              </span>
            </div>
          </div>
          <div class="dashboard-actions">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              title="Edit"
              @click.stop="emit('edit', dash.id)"
            >
              <i class="bi bi-pencil"></i>
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-danger"
              title="Delete"
              @click.stop="emit('delete', dash.id)"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-list {
  max-height: 500px;
  overflow-y: auto;
}

.empty-icon {
  width: 56px;
  height: 56px;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #adb5bd;
}

.dashboard-cards {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dashboard-card {
  padding: 1rem;
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dashboard-card:hover {
  background: #f1f3f5;
  border-color: #dee2e6;
  transform: translateY(-1px);
}

.dashboard-card.selected {
  background: rgba(78, 115, 223, 0.05);
  border-color: #4e73df;
  box-shadow: 0 2px 8px rgba(78, 115, 223, 0.15);
}

.dashboard-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, rgba(78, 115, 223, 0.1) 0%, rgba(34, 74, 190, 0.1) 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: #4e73df;
}

.dashboard-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.meta-item {
  font-size: 0.75rem;
  color: #6c757d;
  display: flex;
  align-items: center;
}

.dashboard-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.dashboard-card:hover .dashboard-actions {
  opacity: 1;
}

.dashboard-actions .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}
</style>
