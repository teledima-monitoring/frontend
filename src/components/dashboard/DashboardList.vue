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
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h6 class="mb-0">Saved Dashboards</h6>
      <button class="btn btn-sm btn-outline-primary" @click="emit('create')">
        + New Dashboard
      </button>
    </div>

    <div v-if="props.dashboards.length === 0" class="text-muted small">
      No dashboards yet. Create one to get started.
    </div>

    <div v-else class="list-group">
      <button
        v-for="dash in props.dashboards"
        :key="dash.id"
        type="button"
        class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
        :class="{ active: dash.id === props.selectedId }"
        @click="emit('select', dash.id)"
      >
        <div>
          <strong>{{ dash.name }}</strong>
          <br />
          <small class="text-muted">
            {{ dash.collectorKind }} / {{ dash.metricName }} ({{ groupByLabel(dash.groupBy) }})
          </small>
        </div>
        <div class="btn-group btn-group-sm">
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm"
            title="Edit"
            @click.stop="emit('edit', dash.id)"
          >
            ✎
          </button>
          <button
            type="button"
            class="btn btn-outline-danger btn-sm"
            title="Delete"
            @click.stop="emit('delete', dash.id)"
          >
            🗑
          </button>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.dashboard-list {
  max-height: 400px;
  overflow-y: auto;
}

.list-group-item {
  cursor: pointer;
}

.btn-group-sm .btn {
  padding: 0.15rem 0.4rem;
  font-size: 0.8rem;
}
</style>
