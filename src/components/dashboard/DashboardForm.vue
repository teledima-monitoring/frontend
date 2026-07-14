<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import FilterKeyValueEditor from './FilterKeyValueEditor.vue'
import { useMetricsStore } from '@/stores/metrics.ts'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  initial?: {
    name: string
    collectorKind: string
    metricName: string
    filters: Record<string, string>
    groupBy: string
  }
}>()

const emit = defineEmits<{
  save: [data: typeof props.initial & { groupBy: string }]
  cancel: []
}>()

const isEditing = computed(() => !!props.initial)

const metricsStore = useMetricsStore()
const { availableLabelKeys } = storeToRefs(metricsStore)

const { t } = useI18n()

const form = reactive({
  name: props.initial?.name ?? '',
  collectorKind: props.initial?.collectorKind ?? '',
  metricName: props.initial?.metricName ?? '',
  filters: { ...(props.initial?.filters ?? {}) },
  groupBy: props.initial?.groupBy ?? 'collector',
})

watch(
  () => props.initial,
  (newInitial) => {
    form.name = newInitial?.name ?? ''
    form.collectorKind = newInitial?.collectorKind ?? ''
    form.metricName = newInitial?.metricName ?? ''
    form.filters = { ...(newInitial?.filters ?? {}) }
    form.groupBy = newInitial?.groupBy ?? 'collector'
  },
  { deep: true },
)

const groupByOptions = computed(() => [
  { value: 'none', label: `${t('dashboard.form.groupBy.none')}` },
  { value: 'collector', label: `${t('dashboard.form.groupBy.collector')}` },
  ...availableLabelKeys.value.map((key) => ({ value: key, label: `Label: ${key}` })),
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
        <label for="dash-name" class="form-label small fw-semibold">
          <i class="bi bi-card-heading me-1 text-primary"></i
          >{{ $t('dashboard.form.name.title') }} *
        </label>
        <div class="input-group">
          <span class="input-group-text bg-light border-end-0">
            <i class="bi bi-tag text-muted"></i>
          </span>
          <input
            id="dash-name"
            v-model="form.name"
            type="text"
            class="form-control bg-light border-start-0"
            :placeholder="$t('dashboard.form.name.placeholder')"
            required
          />
        </div>
      </div>

      <!-- Collector Kind -->
      <div class="col-md-6">
        <label for="dash-kind" class="form-label small fw-semibold">
          <i class="bi bi-hdd-network me-1 text-primary"></i
          >{{ $t('dashboard.form.collectorKind.title') }} *
        </label>
        <div class="input-group">
          <span class="input-group-text bg-light border-end-0">
            <i class="bi bi-cpu text-muted"></i>
          </span>
          <input
            id="dash-kind"
            v-model="form.collectorKind"
            type="text"
            class="form-control bg-light border-start-0"
            :placeholder="$t('dashboard.form.collectorKind.placeholder')"
            required
          />
        </div>
      </div>

      <!-- Metric Name -->
      <div class="col-md-6">
        <label for="dash-metric" class="form-label small fw-semibold">
          <i class="bi bi-activity me-1 text-primary"></i
          >{{ $t('dashboard.form.metricName.title') }} *
        </label>
        <div class="input-group">
          <span class="input-group-text bg-light border-end-0">
            <i class="bi bi-graph-up text-muted"></i>
          </span>
          <input
            id="dash-metric"
            v-model="form.metricName"
            type="text"
            class="form-control bg-light border-start-0"
            :placeholder="$t('dashboard.form.metricName.placeholder')"
            required
          />
        </div>
      </div>

      <!-- Group By -->
      <div class="col-md-6">
        <label for="dash-group-by" class="form-label small fw-semibold">
          <i class="bi bi-diagram-3 me-1 text-primary"></i>{{ $t('dashboard.form.groupBy.title') }}
        </label>
        <div class="input-group">
          <span class="input-group-text bg-light border-end-0">
            <i class="bi bi-collection text-muted"></i>
          </span>
          <select
            id="dash-group-by"
            v-model="form.groupBy"
            class="form-select bg-light border-start-0"
          >
            <option v-for="opt in groupByOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Filters -->
      <div class="col-12">
        <label class="form-label small fw-semibold">
          <i class="bi bi-funnel me-1 text-primary"></i>{{ $t('dashboard.form.filter') }}
        </label>
        <div class="p-3 bg-light border rounded-3">
          <FilterKeyValueEditor v-model="form.filters" />
        </div>
      </div>
    </div>

    <div class="mt-4 d-flex gap-2 pt-3 border-top">
      <button type="submit" class="btn btn-primary shadow-sm">
        <i class="bi bi-check-circle me-1"></i>
        {{ isEditing ? $t('dashboard.form.update') : $t('dashboard.form.create') }}
      </button>
      <button type="button" class="btn btn-outline-secondary" @click="emit('cancel')">
        <i class="bi bi-x-lg me-1"></i>{{ $t('cancel') }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.dashboard-form {
  padding: 0;
}

/* Input group focus styling */
.input-group .form-control,
.input-group .form-select {
  border-left: 0;
}

.input-group .form-control:focus,
.input-group .form-select:focus {
  border-color: #ced4da;
  box-shadow: none;
  background-color: #fff !important;
}

.input-group:focus-within {
  box-shadow: 0 0 0 0.25rem rgba(var(--bs-primary-rgb), 0.15);
  border-radius: 0.375rem;
}

.input-group:focus-within .input-group-text {
  border-color: var(--bs-primary);
  background-color: #fff !important;
}

.input-group:focus-within .form-control,
.input-group:focus-within .form-select {
  border-color: var(--bs-primary);
}
</style>
