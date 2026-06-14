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

function save() {
  const record: Record<string, string> = {}
  for (const entry of entries.value) {
    if (entry.key.trim()) {
      record[entry.key.trim()] = entry.value
    }
  }
  model.value = record
}

// Auto-save when entries change
watch(
  entries,
  () => {
    save()
  },
  { deep: true },
)
</script>

<template>
  <div class="filter-editor">
    <div v-if="props.readonly" class="readonly-filters">
      <span
        v-for="[key, value] in Object.entries(model)"
        :key="key"
        class="badge bg-secondary me-1 mb-1"
      >
        {{ key }}: {{ value || '(empty)' }}
      </span>
      <span v-if="Object.keys(model).length === 0" class="text-muted">No filters</span>
    </div>

    <div v-else>
      <div v-for="(entry, index) in entries" :key="index" class="row g-2 mb-2 align-items-center">
        <div class="col-auto">
          <input
            v-model="entry.key"
            type="text"
            class="form-control form-control-sm"
            placeholder="Key"
          />
        </div>
        <div class="col-auto">
          <input
            v-model="entry.value"
            type="text"
            class="form-control form-control-sm"
            placeholder="Value"
          />
        </div>
        <div class="col-auto">
          <button type="button" class="btn btn-outline-danger btn-sm" @click="removeEntry(index)">
            &times;
          </button>
        </div>
      </div>

      <button type="button" class="btn btn-outline-secondary btn-sm" @click="addEntry">
        + Add Filter
      </button>
    </div>
  </div>
</template>

<style scoped>
.readonly-filters .badge {
  font-size: 0.75rem;
}
</style>
