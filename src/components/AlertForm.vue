<script setup lang="ts">
import type { AlertRule } from '@/types/api'
import { ref, computed } from 'vue'

const props = defineProps<{
  initialName?: string
  initialKind?: string
}>()

const emit = defineEmits<{
  submit: [
    data: {
      name: string
      collectorKind: string
      dataPeriod: number
      filters: Record<string, string>
      rules: AlertRule[]
    },
  ]
}>()

const name = ref(props.initialName || '')
const collectorKind = ref(props.initialKind || '')
const dataPeriod = ref(60)
const filterKey = ref('')
const filterValue = ref('')
const filters = ref<Record<string, string>>({})

const field = ref('')
const constraint = ref(3)
const ruleValue = ref(0)
const rules = ref<AlertRule[]>([])

const constraintNames: Record<number, string> = {
  1: '<',
  2: '≤',
  3: '=',
  4: '>',
  5: '≥',
}

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
  emit('submit', {
    name: name.value,
    collectorKind: collectorKind.value,
    dataPeriod: dataPeriod.value,
    filters: filters.value,
    rules: rules.value,
  })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="row g-3">
    <!-- Name -->
    <div class="col-md-4">
      <label class="form-label">Alert Name *</label>
      <input v-model="name" type="text" class="form-control" placeholder="My Alert" />
    </div>

    <!-- Collector Kind -->
    <div class="col-md-4">
      <label class="form-label">Collector Kind *</label>
      <input
        v-model="collectorKind"
        type="text"
        class="form-control"
        placeholder="e.g. nginx, redis"
      />
    </div>

    <!-- Data Period -->
    <div class="col-md-4">
      <label class="form-label">Data Period (seconds)</label>
      <input v-model.number="dataPeriod" type="number" class="form-control" min="1" />
    </div>

    <!-- Filters -->
    <div class="col-12">
      <label class="form-label">Filters</label>
      <div class="d-flex gap-2 mb-2">
        <input v-model="filterKey" type="text" class="form-control" placeholder="Key" />
        <input v-model="filterValue" type="text" class="form-control" placeholder="Value" />
        <button type="button" class="btn btn-secondary" @click="addFilter">Add</button>
      </div>
      <div
        v-for="(val, key) in filters"
        :key="key"
        class="badge bg-secondary d-inline-block me-1 mb-1 p-2"
      >
        {{ key }}: {{ val }}
        <button type="button" class="btn-close btn-close-sm ms-1" @click="removeFilter(key)" />
      </div>
    </div>

    <!-- Rules -->
    <div class="col-12">
      <label class="form-label fw-bold">Rules *</label>
      <div class="d-flex gap-2 mb-2 align-items-end">
        <div>
          <small class="text-muted d-block">Field</small>
          <input
            v-model="field"
            type="text"
            class="form-control form-control-sm"
            placeholder="metric_name"
          />
        </div>
        <div>
          <small class="text-muted d-block">Constraint</small>
          <select
            v-model.number="constraint"
            class="form-select form-select-sm"
            style="width: 80px"
          >
            <option v-for="(label, val) in constraintNames" :key="val" :value="Number(val)">
              {{ label }}
            </option>
          </select>
        </div>
        <div>
          <small class="text-muted d-block">Value</small>
          <input
            v-model.number="ruleValue"
            type="number"
            class="form-control form-control-sm"
            style="width: 100px"
          />
        </div>
        <button type="button" class="btn btn-secondary btn-sm" @click="addRule">Add Rule</button>
      </div>

      <!-- Rules list -->
      <ul class="list-group">
        <li
          v-for="(rule, idx) in rules"
          :key="idx"
          class="list-group-item d-flex justify-content-between align-items-center"
        >
          <span>
            <strong>{{ rule.field }}</strong> {{ constraintNames[rule.constraint] }}
            <strong>{{ rule.value }}</strong>
          </span>
          <button type="button" class="btn btn-outline-danger btn-sm" @click="removeRule(idx)">
            Remove
          </button>
        </li>
      </ul>
    </div>

    <!-- Submit -->
    <div class="col-12">
      <button type="submit" class="btn btn-success" :disabled="!isValid">Create Alert</button>
    </div>
  </form>
</template>
