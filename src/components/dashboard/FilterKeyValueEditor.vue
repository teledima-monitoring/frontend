<script setup lang="ts">
import { ref, watch } from 'vue'

const model = defineModel<Record<string, string>>({ default: () => ({}) })

const props = defineProps<{
  readonly?: boolean
}>()

// Internal entries for the editor
const entries = ref<Array<{ key: string; value: string }>>([])

function syncEntries() {
  if (props.readonly) return
  entries.value = Object.entries(model.value ?? {}).map(([key, value]) => ({ key, value }))
}

watch(model, syncEntries, { immediate: true })

function addEntry() {
  entries.value.push({ key: '', value: '' })
}

function removeEntry(index: number) {
  entries.value.splice(index, 1)
}

// Auto-save when entries change
watch(
  entries,
  () => {
    const record: Record<string, string> = {}
    for (const entry of entries.value) {
      if (entry.key.trim()) {
        record[entry.key.trim()] = entry.value
      }
    }

    const currentModel = model.value ?? {}
    if (JSON.stringify(record) !== JSON.stringify(currentModel)) {
      model.value = record
    }
  },
  { deep: true },
)
</script>

<template>
  <div class="filter-editor">
    <!-- Readonly Mode -->
    <div v-if="props.readonly" class="readonly-filters">
      <div v-if="Object.keys(model).length === 0" class="text-muted small">
        <i class="bi bi-info-circle me-1"></i>{{ $t('filterKeyValue.empty') }}
      </div>
      <div v-else class="d-flex flex-wrap gap-2">
        <span v-for="[key, value] in Object.entries(model)" :key="key" class="filter-badge">
          <code class="filter-key">{{ key }}</code>
          <span class="text-muted mx-1">=</span>
          <code class="filter-value">{{ value || $t('filterKeyValue.emptyValue') }}</code>
        </span>
      </div>
    </div>

    <!-- Edit Mode -->
    <div v-else>
      <div class="filter-entries">
        <div v-for="(entry, index) in entries" :key="index" class="filter-entry">
          <div class="row g-2 align-items-center">
            <div class="col">
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0">
                  <i class="bi bi-tag text-muted small"></i>
                </span>
                <input
                  v-model="entry.key"
                  type="text"
                  class="form-control bg-light border-start-0"
                  :placeholder="$t('filterKeyValue.key')"
                />
              </div>
            </div>
            <div class="col">
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0">
                  <i class="bi bi-input-cursor-text text-muted small"></i>
                </span>
                <input
                  v-model="entry.value"
                  type="text"
                  class="form-control bg-light border-start-0"
                  :placeholder="$t('filterKeyValue.value')"
                />
              </div>
            </div>
            <div class="col-auto">
              <button
                type="button"
                class="btn btn-outline-danger btn-sm"
                @click="removeEntry(index)"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <button type="button" class="btn btn-outline-primary btn-sm mt-2" @click="addEntry">
        <i class="bi bi-plus-lg me-1"></i>{{ $t('filterKeyValue.add') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.filter-badge {
  display: inline-flex;
  align-items: center;
  background: #f1f3f5;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 0.35rem 0.65rem;
  font-size: 0.85rem;
}

.filter-key,
.filter-value {
  color: #4e73df;
  background: transparent;
  font-weight: 600;
  font-size: 0.85rem;
}

.filter-entries {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-entry {
  padding: 0.75rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.15s ease;
}

.filter-entry:hover {
  border-color: #dee2e6;
  background: #f1f3f5;
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
