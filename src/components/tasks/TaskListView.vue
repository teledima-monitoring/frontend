<script setup lang="ts">
import { computed } from 'vue'
import type { TaskView, TaskStatus, UserView } from '@/types/api'
import { formatDate } from '@/utils/format'

const props = defineProps<{
  tasks: TaskView[]
  selectedTaskIds: Set<number>
  taskStatusLabel: (status: TaskStatus) => string
  taskStatusBadgeClass: (status: TaskStatus) => string
  getUserById: (id: number) => UserView | undefined
}>()

const emit = defineEmits<{
  (e: 'select', id: number): void
  (e: 'toggle-select', id: number): void
  (e: 'toggle-select-all'): void
}>()

// Проверяем, выбраны ли все задачи из текущего отфильтрованного списка
const isAllSelected = computed(() => {
  return props.tasks.length > 0 && props.tasks.every((task) => props.selectedTaskIds.has(task.id))
})
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
              <!-- Чекбокс "Выбрать все" в заголовке -->
              <th style="width: 50px" class="ps-4 text-center">
                <input
                  type="checkbox"
                  class="form-check-input task-checkbox"
                  :checked="isAllSelected"
                  @change="emit('toggle-select-all')"
                  title="Select / Unselect all"
                />
              </th>
              <th><i class="bi bi-hash me-1 text-muted small"></i>Key</th>
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
              :class="{ selected: props.selectedTaskIds.has(task.id) }"
              @click="emit('select', task.id)"
            >
              <!-- Чекбокс -->
              <td class="ps-4 text-center" @click.stop>
                <input
                  type="checkbox"
                  class="form-check-input task-checkbox"
                  :checked="props.selectedTaskIds.has(task.id)"
                  @change="emit('toggle-select', task.id)"
                />
              </td>

              <td>
                <router-link
                  :to="{ name: 'TaskDetail', params: { id: task.id } }"
                  class="fw-semibold text-decoration-none"
                  @click.stop
                >
                  {{ task.key }}
                </router-link>
              </td>
              <td class="fw-medium">{{ task.name }}</td>
              <td>
                <div
                  v-if="getUserById(task.assigneeId)"
                  class="assignee-cell position-relative d-inline-flex align-items-center"
                >
                  <!-- Аватарка с первой буквой имени -->
                  <div class="assignee-avatar me-2">
                    {{ getUserById(task.assigneeId)?.firstName?.charAt(0).toUpperCase() || '?' }}
                  </div>

                  <!-- Имя и Фамилия -->
                  <span class="assignee-name fw-medium text-nowrap">
                    {{ getUserById(task.assigneeId)?.firstName }}
                    {{ getUserById(task.assigneeId)?.secondName }}
                  </span>

                  <!-- Кастомный Tooltip -->
                  <div class="assignee-tooltip text-start">
                    <div class="fw-bold mb-1 text-dark">
                      {{ getUserById(task.assigneeId)?.firstName }}
                      {{ getUserById(task.assigneeId)?.secondName }}
                      {{ getUserById(task.assigneeId)?.thirdName }}
                    </div>
                    <div class="small text-muted mb-1">
                      <i class="bi bi-briefcase me-1"></i>
                      {{ getUserById(task.assigneeId)?.jobTitle || 'Должность не указана' }}
                    </div>
                    <div class="small text-muted">
                      <i class="bi bi-envelope me-1"></i>
                      {{ getUserById(task.assigneeId)?.email || 'Email не указан' }}
                    </div>
                  </div>
                </div>
                <span v-else class="text-muted fst-italic">Не назначен</span>
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
/* ... ваши существующие стили остаются без изменений ... */
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
.task-row.selected {
  background-color: rgba(78, 115, 223, 0.08) !important;
}
.task-row.selected td:first-child {
  box-shadow: inset 3px 0 0 #224abe;
}
.task-checkbox {
  cursor: pointer;
  width: 1.15em;
  height: 1.15em;
  margin: 0;
  vertical-align: middle;
  border: 1.5px solid #adb5bd;
  transition: all 0.15s ease;
}
.task-checkbox:checked {
  background-color: #4e73df;
  border-color: #4e73df;
}
.task-checkbox:focus {
  box-shadow: 0 0 0 0.2rem rgba(78, 115, 223, 0.25);
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

.assignee-cell {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.assignee-cell:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.assignee-avatar {
  width: 28px;
  height: 28px;
  background: var(--bs-primary-bg-subtle);
  color: var(--bs-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.assignee-name {
  font-size: 0.9rem;
}

/* Стили для всплывающей подсказки */
.assignee-tooltip {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  background: #fff;
  color: #212529;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  width: max-content;
  max-width: 250px;
  z-index: 1050;
  transition:
    opacity 0.2s ease,
    visibility 0.2s ease,
    transform 0.2s ease;
  transform: translateY(-5px);
  pointer-events: none;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* Стрелочка у тултипа */
.assignee-tooltip::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 16px;
  width: 12px;
  height: 12px;
  background: #fff;
  border-left: 1px solid rgba(0, 0, 0, 0.05);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  transform: rotate(45deg);
}

/* Показ тултипа при наведении */
.assignee-cell:hover .assignee-tooltip {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
}
</style>
