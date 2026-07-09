<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useTasksStore } from '@/stores/tasks'
import { useUsersStore } from '@/stores/user'
import TaskListView from '@/components/tasks/TaskListView.vue'
import { api } from '@/services/api'
import { TaskStatus } from '@/types/task'

const route = useRoute()
const router = useRouter()

const tasksStore = useTasksStore()
const { tasks, loading } = storeToRefs(tasksStore)
const { fetchTasks, getTaskStatusLabel, getTaskStatusBadgeClass } = tasksStore

const usersStore = useUsersStore()
const { users } = storeToRefs(usersStore)
const { fetchUsers, getUserById } = usersStore

// --- Фильтры и Выделение ---
const statusFilter = ref<TaskStatus | ''>('')
const assigneeFilter = ref<number | ''>('')
const selectedTaskIds = ref<Set<number>>(new Set())

const filteredTasks = computed(() => {
  return tasks.value.filter((task) => {
    if (statusFilter.value !== '' && task.status !== statusFilter.value) return false
    if (assigneeFilter.value !== '' && task.assigneeId !== assigneeFilter.value) return false
    return true
  })
})

const hasFilters = computed(() => statusFilter.value !== '' || assigneeFilter.value !== '')
const hasSelection = computed(() => selectedTaskIds.value.size > 0)
const isExportSelected = computed(() => hasFilters.value || hasSelection.value)

// При применении фильтров автоматически выделяем отфильтрованные задачи
watch([statusFilter, assigneeFilter], () => {
  if (hasFilters.value) {
    selectedTaskIds.value = new Set(filteredTasks.value.map((t) => t.id))
  }
})

// Обработка массового выделения из заголовка таблицы
function handleToggleSelectAll() {
  if (selectedTaskIds.value.size === filteredTasks.value.length && filteredTasks.value.length > 0) {
    selectedTaskIds.value = new Set() // Снять все отметки
  } else {
    selectedTaskIds.value = new Set(filteredTasks.value.map((t) => t.id)) // Выделить все отфильтрованные
  }
}

function clearFiltersAndSelection() {
  statusFilter.value = ''
  assigneeFilter.value = ''
  selectedTaskIds.value = new Set()
}

async function exportTasks() {
  let ids: number[] | undefined = undefined

  if (isExportSelected.value) {
    if (hasFilters.value) {
      ids = filteredTasks.value.map((t) => t.id)
    } else {
      ids = Array.from(selectedTaskIds.value)
    }
  }

  try {
    await api.exportTasksCSV(ids)
  } catch (e) {
    console.error('Export failed', e)
  }
}

function handleSelectTask(id: number) {
  router.push({ name: 'TaskDetail', params: { id } })
}

function handleTaskToggle(id: number) {
  const newSet = new Set(selectedTaskIds.value)
  if (newSet.has(id)) {
    newSet.delete(id)
  } else {
    newSet.add(id)
  }
  selectedTaskIds.value = newSet
}

watch(
  () => route.path,
  async () => {
    await Promise.all([fetchTasks(), fetchUsers()])
  },
  { immediate: true },
)
</script>

<template>
  <div class="container-fluid py-4">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold mb-1">
          <i class="bi bi-kanban me-2 text-primary"></i>{{ $t('task.title') }}
        </h3>
        <p class="text-muted mb-0">{{ $t('task.description') }}</p>
      </div>
      <!-- Кнопка экспорта -->
      <button class="btn btn-outline-primary shadow-sm" @click="exportTasks" :disabled="loading">
        <i class="bi bi-download me-2"></i>
        {{ isExportSelected ? $t('task.export.selected') : $t('task.export.all') }}
      </button>
    </div>

    <!-- Filters & Actions -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body p-3">
        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label small fw-semibold text-muted mb-1">{{
              $t('task.filters.status.title')
            }}</label>
            <select v-model="statusFilter" class="form-select">
              <option :value="''">{{ $t('task.filters.status.all') }}</option>
              <option
                v-for="status in [TaskStatus.Open, TaskStatus.InProgress, TaskStatus.Closed]"
                :key="status"
                :value="status"
              >
                {{ $t(getTaskStatusLabel(status)) }}
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label small fw-semibold text-muted mb-1">{{
              $t('task.filters.assignee.title')
            }}</label>
            <select v-model.number="assigneeFilter" class="form-select">
              <option :value="''">{{ $t('task.filters.assignee.all') }}</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.login }}
              </option>
            </select>
          </div>
          <!-- Аккуратная ссылка для сброса вместо громоздкой кнопки -->
          <div class="col-md-4 d-flex justify-content-end align-items-end pb-1">
            <button
              class="btn btn-link text-decoration-none text-muted small p-0"
              @click="clearFiltersAndSelection"
              :disabled="!hasFilters && selectedTaskIds.size === 0"
            >
              <i class="bi bi-x-circle me-1"></i>{{ $t('task.filters.clear') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && tasks.length === 0" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted mt-3">{{ $t('task.load') }}</p>
    </div>

    <!-- Task List -->
    <div v-else class="card border-0 shadow-sm list-card">
      <div class="card-body p-0">
        <TaskListView
          :tasks="filteredTasks"
          :task-status-label="getTaskStatusLabel"
          :task-status-badge-class="getTaskStatusBadgeClass"
          :get-user-by-id="getUserById"
          :selected-task-ids="selectedTaskIds"
          @select="handleSelectTask"
          @toggle-select="handleTaskToggle"
          @toggle-select-all="handleToggleSelectAll"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-card {
  border-radius: 12px;
  overflow: hidden;
}
</style>
