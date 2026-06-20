<script setup lang="ts">
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useTasksStore } from '@/stores/tasks'
import { useUsersStore } from '@/stores/user'
import TaskListView from '@/components/tasks/TaskListView.vue'

const route = useRoute()
const router = useRouter()

const tasksStore = useTasksStore()
const { tasks, loading } = storeToRefs(tasksStore)
const { fetchTasks, getTaskStatusLabel, getTaskStatusBadgeClass } = tasksStore

const { fetchUsers, getUserNameById } = useUsersStore()

function handleSelectTask(id: number) {
  router.push({ name: 'TaskDetail', params: { id } })
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
        <h3 class="fw-bold mb-1"><i class="bi bi-kanban me-2 text-primary"></i>Tasks Management</h3>
        <p class="text-muted mb-0">Track, manage, and update your project tasks.</p>
      </div>
      <!-- Можно добавить кнопку создания задачи здесь -->
    </div>

    <!-- Loading State -->
    <div v-if="loading && tasks.length === 0" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted mt-3">Fetching your tasks...</p>
    </div>

    <!-- Task List -->
    <div v-else class="card border-0 shadow-sm list-card">
      <div class="card-body p-0">
        <TaskListView
          :tasks="tasks"
          :task-status-label="getTaskStatusLabel"
          :task-status-badge-class="getTaskStatusBadgeClass"
          :get-user-name-by-id="getUserNameById"
          @select="handleSelectTask"
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
