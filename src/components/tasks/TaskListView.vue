<script setup lang="ts">
import type { TaskView, TaskStatus } from '@/types/api'
import { formatDate } from '@/utils/format'

const props = defineProps<{
  tasks: TaskView[]
  taskStatusLabel: (status: TaskStatus) => string
  taskStatusBadgeClass: (status: TaskStatus) => string
  getUserNameById: (userId: number) => string
}>()

const emit = defineEmits<{
  select: [id: number]
}>()
</script>

<template>
  <div class="card">
    <div class="card-header">
      <span>All Tasks ({{ props.tasks.length }})</span>
    </div>
    <div class="card-body p-0">
      <div v-if="props.tasks.length === 0" class="text-center text-muted py-5">
        <i class="bi bi-inbox display-4"></i>
        <p class="mt-3">No tasks found</p>
      </div>
      <table v-else class="table table-striped table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th>Key</th>
            <th>Name</th>
            <th>Assignee</th>
            <th>Status</th>
            <th>Created</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="task in props.tasks"
            :key="task.id"
            class="task-row cursor-pointer"
            @click="emit('select', task.id)"
          >
            <td>
              <router-link :to="{ name: 'TaskDetail', params: { id: task.id } }">
                {{ task.key }}
              </router-link>
            </td>
            <td>{{ task.name }}</td>
            <td>{{ props.getUserNameById(task.assigneeId) }}</td>
            <td>
              <span class="badge" :class="props.taskStatusBadgeClass(task.status)">
                {{ props.taskStatusLabel(task.status) }}
              </span>
            </td>
            <td>{{ formatDate(task.createDt) }}</td>
            <td>{{ formatDate(task.updateDt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.task-row:hover {
  background-color: rgba(0, 123, 255, 0.05);
}
</style>
