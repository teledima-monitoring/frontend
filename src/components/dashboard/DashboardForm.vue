<script setup lang="ts">
import { reactive, computed } from 'vue'
import FilterKeyValueEditor from './FilterKeyValueEditor.vue'

const props = defineProps<{
  initial?: {
    name: string
    collectorKind: string
    metricName: string
    filters: Record<string, string>
    groupBy: string
  }
  availableLabelKeys: string[]
}>()

const emit = defineEmits<{
  save: [data: typeof props.initial & { groupBy: string }]
  cancel: []
}>()

const isEditing = computed(() => !!props.initial)

const form = reactive({
  name: props.initial?.name ?? '',
  collectorKind: props.initial?.collectorKind ?? '',
  metricName: props.initial?.metricName ?? '',
  filters: { ...(props.initial?.filters ?? {}) },
  groupBy: props.initial?.groupBy ?? 'collector',
})

const groupByOptions = computed(() => [
  { value: 'none', label: 'None (aggregate all)' },
  { value: 'collector', label: 'Collector name' },
  ...props.availableLabelKeys.map((key) => ({ value: key, label: `Label: ${key}` })),
])

function handleSubmit() {
  if (!form.name.trim() || !form.collectorKind.trim() || !form.metricName.trim()) return
  emit('save', { ...form })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="dashboard-form">
    <div class="row g-3">
      <!-- Name -->
      <div class="col-md-6">
        <label for="dash-name" class="form-label">Name</label>
        <input
          id="dash-name"
          v-model="form.name"
          type="text"
          class="form-control"
          placeholder="My Dashboard"
          required
        />
      </div>

      <!-- Collector Kind -->
      <div class="col-md-6">
        <label for="dash-kind" class="form-label">Collector Kind</label>
        <input
          id="dash-kind"
          v-model="form.collectorKind"
          type="text"
          class="form-control"
          placeholder="e.g. OSCollector"
          required
        />
      </div>

      <!-- Metric Name -->
      <div class="col-md-6">
        <label for="dash-metric" class="form-label">Metric Name</label>
        <input
          id="dash-metric"
          v-model="form.metricName"
          type="text"
          class="form-control"
          placeholder="e.g. cpu_idle"
          required
        />
      </div>

      <!-- Group By -->
      <div class="col-md-6">
        <label for="dash-group-by" class="form-label">Group By</label>
        <select id="dash-group-by" v-model="form.groupBy" class="form-select">
          <option v-for="opt in groupByOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- Filters -->
      <div class="col-12">
        <label class="form-label">Filters</label>
        <FilterKeyValueEditor v-model="form.filters" />
      </div>
    </div>

    <div class="mt-3 d-flex gap-2">
      <button type="submit" class="btn btn-primary">
        {{ isEditing ? 'Update' : 'Create' }} Dashboard
      </button>
      <button type="button" class="btn btn-secondary" @click="emit('cancel')">Cancel</button>
    </div>
  </form>
</template>

<style scoped>
.dashboard-form {
  padding: 1rem;
}
</style>
