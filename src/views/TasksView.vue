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
  <div class="container-fluid">
    <h3 class="mb-4">Tasks Management</h3>

    <!-- Loading State -->
    <div v-if="loading && tasks.length === 0" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Task List -->
    <TaskListView
      v-else
      :tasks="tasks"
      :task-status-label="getTaskStatusLabel"
      :task-status-badge-class="getTaskStatusBadgeClass"
      :get-user-name-by-id="getUserNameById"
      @select="handleSelectTask"
    />
  </div>
</template>
