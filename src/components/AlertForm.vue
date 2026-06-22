<script setup lang="ts">
import type { AlertConfigView, AlertRule } from '@/types/api'
import { Constraint } from '@/types/api'
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  initialData?: AlertConfigView
  getConstraintName: (constraint: Constraint) => string
}>()

const emit = defineEmits<{
  submit: [data: any]
  cancel: []
}>()

const name = ref('')
const collectorKind = ref('')
const dataPeriod = ref(60)
const filterKey = ref('')
const filterValue = ref('')
const filters = ref<Record<string, string>>({})

const field = ref('')
const constraint = ref(Constraint.Equal)
const ruleValue = ref(0)
const rules = ref<AlertRule[]>([])

const isEditing = computed(() => !!props.initialData)

// Следим за изменением initialData, чтобы заполнять форму при редактировании
watch(() => props.initialData, (newData) => {
  if (newData) {
    name.value = newData.name
    collectorKind.value = newData.collectorKind
    dataPeriod.value = newData.dataPeriod
    filters.value = { ...newData.filters }
    rules.value = newData.rules.map(r => ({ ...r }))
  } else {
    name.value = ''
    collectorKind.value = ''
    dataPeriod.value = 60
    filters.value = {}
    rules.value = []
  }
  // Сбрасываем поля конструктора
  filterKey.value = ''
  filterValue.value = ''
  field.value = ''
  ruleValue.value = 0
}, { immediate: true })

const constraintValues = Object.keys(Constraint)
  .filter((key) => !isNaN(Number(key)))
  .map((k) => Number(k))

function addFilter() {
  if (filterKey.value) {
    filters.value[filterKey.value] = filterValue.value
    filterKey.value = ''
    filterValue.value = ''
  }
}

function removeFilter(key: string) {
  delete filters.value[key]
}

function addRule() {
  if (field.value) {
    rules.value.push({ field: field.value, constraint: constraint.value, value: ruleValue.value }) 
    field.value = ''
    ruleValue.value = 0
  }
}

function removeRule(index: number) {
  rules.value.splice(index, 1)
}

const isValid = computed(() => name.value && collectorKind.value && rules.value.length > 0)

function handleSubmit() {
  if (!isValid.value) return
  
  const payload = {
    name: name.value,
    collectorKind: collectorKind.value,
    dataPeriod: dataPeriod.value,
    filters: filters.value,
    rules: rules.value,
  }
  
  // Если редактируем, добавляем id в payload
  if (isEditing.value && props.initialData) {
    emit('submit', { id: props.initialData.id, ...payload })
  } else {
    emit('submit', payload)
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="alert-form">
    <!-- Main Fields -->
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <label class="form-label small fw-semibold">
          <i class="bi bi-tag me-1 text-primary"></i> Alert Name *
        </label>
        <div class="input-group">
          <span class="input-group-text bg-light border-end-0">
            <i class="bi bi-bell text-muted"></i>
          </span>
          <input v-model="name" type="text" class="form-control bg-light border-start-0" placeholder="My Alert" />
        </div>
      </div>
      <div class="col-md-4">
        <label class="form-label small fw-semibold">
          <i class="bi bi-hdd-network me-1 text-primary"></i> Collector Kind *
        </label>
        <div class="input-group">
          <span class="input-group-text bg-light border-end-0">
            <i class="bi bi-cpu text-muted"></i>
          </span>
          <input v-model="collectorKind" type="text" class="form-control bg-light border-start-0" placeholder="e.g. nginx, redis" />
        </div>
      </div>
      <div class="col-md-4">
        <label class="form-label small fw-semibold">
          <i class="bi bi-clock me-1 text-primary"></i> Data Period (seconds)
        </label>
        <div class="input-group">
          <span class="input-group-text bg-light border-end-0">
            <i class="bi bi-hourglass-split text-muted"></i>
          </span>
          <input v-model.number="dataPeriod" type="number" class="form-control bg-light border-start-0" min="1" />
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="form-section mb-4">
      <label class="form-label fw-semibold">
        <i class="bi bi-funnel me-1 text-primary"></i> Filters
      </label>
      <div class="d-flex gap-2 mb-3">
        <input v-model="filterKey" type="text" class="form-control" placeholder="Key" />
        <input v-model="filterValue" type="text" class="form-control" placeholder="Value" />
        <button type="button" class="btn btn-outline-primary" @click="addFilter">
          <i class="bi bi-plus-lg me-1"></i> Add
        </button>
      </div>
      <div v-if="Object.keys(filters).length > 0" class="d-flex flex-wrap gap-2">
        <span v-for="(val, key) in filters" :key="key" class="filter-badge">
          <code class="me-1">{{ key }}</code>
          <span class="text-muted">=</span>
          <code class="ms-1">{{ val }}</code>
          <button type="button" class="btn-close btn-close-sm ms-2" @click="removeFilter(key)" aria-label="Remove"></button>
        </span>
      </div>
      <div v-else class="text-muted small">
        <i class="bi bi-info-circle me-1"></i> No filters added. Leave empty to match all sources.
      </div>
    </div>

    <!-- Rules Section -->
    <div class="form-section mb-4">
      <label class="form-label fw-semibold">
        <i class="bi bi-shield-check me-1 text-primary"></i> Rules *
      </label>
      <div class="rule-builder p-3 bg-light rounded-3 mb-3">
        <div class="row g-2 align-items-end">
          <div class="col-md-3">
            <small class="text-muted d-block mb-1">Field</small>
            <input v-model="field" type="text" class="form-control form-control-sm" placeholder="metric_name" />
          </div>
          <div class="col-md-3">
            <small class="text-muted d-block mb-1">Constraint</small>
            <select v-model.number="constraint" class="form-select form-select-sm">
              <option v-for="c in constraintValues" :key="c" :value="c">{{ getConstraintName(c) }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <small class="text-muted d-block mb-1">Value</small>
            <input v-model.number="ruleValue" type="number" class="form-control form-control-sm" />
          </div>
          <div class="col-md-3">
            <button type="button" class="btn btn-primary btn-sm w-100" @click="addRule">
              <i class="bi bi-plus-lg me-1"></i> Add Rule
            </button>
          </div>
        </div>
      </div>

      <!-- Rules List -->
      <div v-if="rules.length > 0" class="rules-list">
        <div v-for="(rule, idx) in rules" :key="idx" class="rule-item d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <div class="rule-number me-3">{{ idx + 1 }}</div>
            <div>
              <code class="rule-field">{{ rule.field }}</code>
              <span class="text-muted mx-2">{{ getConstraintName(rule.constraint) }}</span>
              <code class="rule-value">{{ rule.value }}</code>
            </div>
          </div>
          <button type="button" class="btn btn-sm btn-outline-danger" @click="removeRule(idx)">
            <i class="bi bi-trash me-1"></i> Remove
          </button>
        </div>
      </div>
      <div v-else class="text-muted small text-center py-3">
        <i class="bi bi-list-ul d-block mb-1" style="font-size: 1.5rem"></i>
        No rules defined. Add at least one rule to create the alert.
      </div>
    </div>

    <!-- Submit -->
    <div class="d-flex justify-content-end pt-3 border-top gap-2">
      <button v-if="isEditing" type="button" class="btn btn-outline-secondary px-4" @click="emit('cancel')">
        <i class="bi bi-x-lg me-1"></i> Cancel
      </button>
      <button type="submit" class="btn btn-success px-4 shadow-sm" :disabled="!isValid">
        <i class="bi bi-check-circle me-1"></i> {{ isEditing ? 'Update Alert' : 'Create Alert' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.alert-form {
  padding: 0;
}

.form-section {
  padding: 1.25rem;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 10px;
}

.rule-builder {
  border: 1px dashed #ced4da;
  background: #f8f9fa !important;
}

.filter-badge {
  display: inline-flex;
  align-items: center;
  background: #f1f3f5;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 0.35rem 0.65rem;
  font-size: 0.85rem;
}

.filter-badge code {
  color: #4e73df;
  background: transparent;
  font-weight: 600;
}

.filter-badge .btn-close {
  font-size: 0.6rem;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rule-item {
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.15s ease;
}

.rule-item:hover {
  border-color: #dee2e6;
  background: #f1f3f5;
}

.rule-number {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.rule-field,
.rule-value {
  color: #d63384;
  background: rgba(214, 51, 128, 0.08);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-weight: 600;
}

/* Input group focus styling */
.input-group .form-control {
  border-left: 0;
}
.input-group .form-control:focus {
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
.input-group:focus-within .form-control {
  border-color: var(--bs-primary);
}
</style>
