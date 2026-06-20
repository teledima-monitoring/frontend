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
  <div class="task-list-wrapper">
    <!-- Header -->
    <div class="list-header d-flex justify-content-between align-items-center p-4 border-bottom">
      <div>
        <h6 class="mb-0 fw-bold">
          <i class="bi bi-list-check me-2 text-primary"></i>All Tasks
          <span class="badge bg-primary bg-opacity-10 text-primary ms-2">{{
            props.tasks.length
          }}</span>
        </h6>
      </div>
    </div>

    <!-- Body -->
    <div class="list-body">
      <!-- Empty State -->
      <div v-if="props.tasks.length === 0" class="empty-state text-center py-5">
        <div class="empty-icon mx-auto mb-3">
          <i class="bi bi-inbox"></i>
        </div>
        <h5 class="text-muted fw-semibold">No tasks found</h5>
        <p class="text-muted small mb-0">Create your first task to get started.</p>
      </div>

      <!-- Table -->
      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-4"><i class="bi bi-hash me-1 text-muted small"></i>Key</th>
              <th><i class="bi bi-card-heading me-1 text-muted small"></i>Name</th>
              <th><i class="bi bi-person me-1 text-muted small"></i>Assignee</th>
              <th><i class="bi bi-flag me-1 text-muted small"></i>Status</th>
              <th><i class="bi bi-calendar-plus me-1 text-muted small"></i>Created</th>
              <th><i class="bi bi-calendar-check me-1 text-muted small"></i>Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="task in props.tasks"
              :key="task.id"
              class="task-row cursor-pointer"
              @click="emit('select', task.id)"
            >
              <td class="ps-4">
                <router-link
                  :to="{ name: 'TaskDetail', params: { id: task.id } }"
                  class="fw-semibold text-decoration-none"
                >
                  {{ task.key }}
                </router-link>
              </td>
              <td class="fw-medium">{{ task.name }}</td>
              <td>
                <div class="d-flex align-items-center">
                  <div class="assignee-avatar me-2">
                    {{ props.getUserNameById(task.assigneeId).charAt(0).toUpperCase() || '?' }}
                  </div>
                  <span class="small">{{
                    props.getUserNameById(task.assigneeId) || 'Unassigned'
                  }}</span>
                </div>
              </td>
              <td>
                <span class="badge status-pill" :class="props.taskStatusBadgeClass(task.status)">
                  {{ props.taskStatusLabel(task.status) }}
                </span>
              </td>
              <td class="text-muted small">{{ formatDate(task.createDt) }}</td>
              <td class="text-muted small">{{ formatDate(task.updateDt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-list-wrapper {
  background: #fff;
}

.list-header {
  background: #fff;
}

.empty-icon {
  width: 72px;
  height: 72px;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #adb5bd;
}

.cursor-pointer {
  cursor: pointer;
}

.task-row {
  transition: background-color 0.15s ease;
}

.task-row:hover {
  background-color: rgba(78, 115, 223, 0.04);
}

.task-row:hover td:first-child {
  box-shadow: inset 3px 0 0 #4e73df;
}

.assignee-avatar {
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

.status-pill {
  padding: 0.4em 0.8em;
  font-weight: 600;
  border-radius: 20px;
  font-size: 0.78rem;
}

.table > :not(caption) > * > * {
  padding: 1rem 0.75rem;
}

.table thead th {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  color: #6c757d;
  border-bottom-width: 1px;
}
</style>
