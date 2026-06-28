<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useTasksStore } from '@/stores/tasks'
import { useUsersStore } from '@/stores/user'
import { useIncidentsStore } from '@/stores/incident'
import { TaskPriority, TaskStatus } from '@/types/api'
import { formatDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const tasksStore = useTasksStore()
const { selectedTask, loading, error } = storeToRefs(tasksStore)
const { fetchTaskById, updateTask, clearSelectedTask } = tasksStore

const usersStore = useUsersStore()
const { users } = storeToRefs(usersStore)
const { fetchUsers, getUserById } = usersStore

const incidentsStore = useIncidentsStore()
const { incidents } = storeToRefs(incidentsStore)
const { fetchIncidents } = incidentsStore

const taskId = computed(() => Number(route.params.id))

const showAllIncidents = ref(false)
const INCIDENTS_PREVIEW_LIMIT = 2

// Фильтрация инцидентов, привязанных к текущей задаче
const relatedIncidents = computed(() => {
  if (!selectedTask.value) return []
  return incidents.value.filter((i) => i.taskId === selectedTask.value?.id)
})

const displayedIncidents = computed(() => {
  if (showAllIncidents.value || relatedIncidents.value.length <= INCIDENTS_PREVIEW_LIMIT) {
    return relatedIncidents.value
  }
  return relatedIncidents.value.slice(0, INCIDENTS_PREVIEW_LIMIT)
})

const author = computed(() => {
  if (!selectedTask.value) return null
  return getUserById(selectedTask.value.authorId)!
})

const assignee = computed(() => {
  if (!selectedTask.value) return null
  return getUserById(selectedTask.value.assigneeId)
})

const hasMoreIncidents = computed(() => relatedIncidents.value.length > INCIDENTS_PREVIEW_LIMIT)

const hiddenIncidentsCount = computed(() =>
  Math.max(0, relatedIncidents.value.length - INCIDENTS_PREVIEW_LIMIT),
)

// Local form state for editing
const editMode = ref(false)
const formData = reactive({
  name: '',
  description: '',
  assigneeId: undefined as number | undefined,
  status: undefined as TaskStatus | undefined,
  priority: undefined as TaskPriority | undefined,
  estimate: '',
})

async function loadTask() {
  try {
    await Promise.all([fetchTaskById(taskId.value), fetchIncidents()])

    showAllIncidents.value = false

    if (selectedTask.value) {
      formData.name = selectedTask.value.name
      formData.description = selectedTask.value.description
      formData.status = selectedTask.value.status
      formData.priority = selectedTask.value.priority
      formData.estimate = selectedTask.value.estimate || ''
      formData.assigneeId = selectedTask.value.assigneeId
    }
  } catch {
    router.push({ name: 'Tasks' })
  }
}

async function saveChanges() {
  if (!selectedTask.value) return

  const updates: Record<string, unknown> = {}

  if (formData.name && formData.name !== selectedTask.value.name) updates.name = formData.name
  if (formData.description !== selectedTask.value.description)
    updates.description = formData.description
  if (formData.assigneeId && formData.assigneeId !== selectedTask.value.assigneeId)
    updates.assigneeId = formData.assigneeId
  if (formData.status && formData.status !== selectedTask.value.status)
    updates.status = formData.status

  if (formData.priority && formData.priority !== selectedTask.value.priority)
    updates.priority = formData.priority
  if (formData.estimate !== (selectedTask.value.estimate || ''))
    updates.estimate = formData.estimate || undefined

  if (Object.keys(updates).length > 0) {
    await updateTask(taskId.value, updates)
    editMode.value = false
  }
}

function cancelEdit() {
  if (selectedTask.value) {
    formData.name = selectedTask.value.name
    formData.description = selectedTask.value.description
    formData.assigneeId = selectedTask.value.assigneeId
    formData.status = selectedTask.value.status
    formData.priority = selectedTask.value.priority
    formData.estimate = selectedTask.value.estimate || ''
  }
  editMode.value = false
}

function startEdit() {
  editMode.value = true
}

function goBack() {
  clearSelectedTask()
  router.push({ name: 'Tasks' })
}

function toggleIncidents() {
  showAllIncidents.value = !showAllIncidents.value
}

watch(
  () => route.params.id,
  async () => {
    editMode.value = false
    await loadTask()
    await fetchUsers()
  },
  { immediate: true },
)
</script>

<template>
  <div class="container py-4">
    <!-- Back Button -->
    <button class="btn btn-link text-decoration-none text-muted mb-3 p-0 back-btn" @click="goBack">
      <i class="bi bi-arrow-left me-2"></i> Back to Tasks
    </button>

    <!-- Loading State -->
    <div v-if="loading && !selectedTask" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted mt-3">Loading task details...</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="alert alert-danger d-flex align-items-center mt-3 shadow-sm"
      role="alert"
    >
      <i class="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
      <div>{{ error }}</div>
    </div>

    <!-- Task Detail -->
    <div v-else-if="selectedTask" class="card task-detail-card shadow-sm border-0">
      <div
        class="card-header bg-white border-bottom d-flex justify-content-between align-items-center p-4"
      >
        <div class="d-flex align-items-center">
          <div class="task-icon-wrapper me-3">
            <i class="bi bi-clipboard-check fs-4 text-primary"></i>
          </div>
          <div>
            <h5 class="mb-0 fw-bold">{{ selectedTask.name }}</h5>
            <small class="text-muted">{{ selectedTask.key }}</small>
          </div>
        </div>
        <div v-if="!editMode">
          <button class="btn btn-sm btn-primary shadow-sm" @click="startEdit">
            <i class="bi bi-pencil-fill me-1"></i> Edit
          </button>
        </div>
      </div>

      <div class="card-body p-4">
        <!-- View Mode -->
        <div v-if="!editMode">
          <!-- Key and Status -->
          <div class="row g-4 mb-4">
            <div class="col-md-6">
              <div class="detail-box">
                <div class="detail-label"><i class="bi bi-hash me-2 text-primary"></i>Key</div>
                <div class="detail-value">{{ selectedTask.key }}</div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="detail-box">
                <div class="detail-label"><i class="bi bi-flag me-2 text-primary"></i>Status</div>
                <div class="detail-value">
                  <span
                    class="badge status-badge"
                    :class="tasksStore.getTaskStatusBadgeClass(selectedTask.status)"
                  >
                    {{ tasksStore.getTaskStatusLabel(selectedTask.status) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="row g-4 mb-4">
              <div class="col-md-6">
                <div class="detail-box">
                  <div class="detail-label">
                    <i class="bi bi-exclamation-triangle me-2 text-primary"></i>Priority
                  </div>
                  <div class="detail-value">
                    <span
                      class="badge status-badge"
                      :class="tasksStore.getTaskPriorityBadgeClass(selectedTask.priority)"
                    >
                      {{ tasksStore.getTaskPriorityLabel(selectedTask.priority) }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="detail-box">
                  <div class="detail-label">
                    <i class="bi bi-clock-history me-2 text-primary"></i>Estimate
                  </div>
                  <div class="detail-value">{{ selectedTask.estimate || 'Not estimated' }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="detail-box mb-4">
            <div class="detail-label">
              <i class="bi bi-text-paragraph me-2 text-primary"></i>Description
            </div>
            <div class="detail-value text-break">
              {{ selectedTask.description || 'No description provided.' }}
            </div>
          </div>

          <!-- Author and Assignee -->
          <div class="row g-4 mb-4">
            <div class="col-md-6">
              <div class="detail-box">
                <div class="detail-label">
                  <i class="bi bi-person-badge me-2 text-primary"></i>Author
                </div>
                <div
                  v-if="author"
                  class="assignee-cell position-relative d-inline-flex align-items-center"
                >
                  <!-- Имя и Фамилия -->
                  <span class="assignee-name fw-medium text-nowrap">
                    {{ author.firstName }} {{ author.secondName }}
                  </span>

                  <!-- Кастомный Tooltip -->
                  <div class="assignee-tooltip text-start">
                    <div class="fw-bold mb-1 text-dark">
                      {{ author.firstName }}
                      {{ author.secondName }}
                      {{ author?.thirdName }}
                    </div>
                    <div class="small text-muted mb-1">
                      <i class="bi bi-briefcase me-1"></i>
                      {{ author.jobTitle }}
                    </div>
                    <div class="small text-muted">
                      <i class="bi bi-envelope me-1"></i>
                      {{ author.email }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="detail-box">
                <div class="detail-label">
                  <i class="bi bi-person-check me-2 text-primary"></i>Assignee
                </div>
                <div
                  v-if="assignee"
                  class="assignee-cell position-relative d-inline-flex align-items-center"
                >
                  <!-- Имя и Фамилия -->
                  <span class="assignee-name fw-medium text-nowrap">
                    {{ assignee.firstName }} {{ assignee.secondName }}
                  </span>

                  <!-- Кастомный Tooltip -->
                  <div class="assignee-tooltip text-start">
                    <div class="fw-bold mb-1 text-dark">
                      {{ assignee.firstName }}
                      {{ assignee.secondName }}
                      {{ assignee?.thirdName }}
                    </div>
                    <div class="small text-muted mb-1">
                      <i class="bi bi-briefcase me-1"></i>
                      {{ assignee.jobTitle }}
                    </div>
                    <div class="small text-muted">
                      <i class="bi bi-envelope me-1"></i>
                      {{ assignee.email }}
                    </div>
                  </div>
                </div>
                <span v-else class="text-muted fst-italic">Не назначен</span>
              </div>
            </div>
          </div>

          <!-- Related Incidents Section с возможностью сворачивания -->
          <div class="detail-box mb-4">
            <div class="detail-label mb-3 d-flex justify-content-between align-items-center">
              <div>
                <i class="bi bi-exclamation-octagon me-2 text-primary"></i>Related Incidents
                <span
                  v-if="relatedIncidents.length > 0"
                  class="badge bg-primary bg-opacity-10 text-primary ms-2"
                >
                  {{ relatedIncidents.length }}
                </span>
              </div>
            </div>

            <div
              v-if="relatedIncidents.length === 0"
              class="text-muted small d-flex align-items-center"
            >
              <i class="bi bi-info-circle me-2"></i>No incidents linked to this task.
            </div>

            <div v-else>
              <!-- Список инцидентов с анимацией -->
              <div class="incident-list">
                <transition-group name="incident-fade">
                  <div
                    v-for="incident in displayedIncidents"
                    :key="incident.id"
                    class="incident-item"
                  >
                    <div class="d-flex justify-content-between align-items-center">
                      <div class="d-flex align-items-center">
                        <div
                          class="incident-icon me-3"
                          :class="
                            incident.fired
                              ? 'bg-danger bg-opacity-10 text-danger'
                              : 'bg-success bg-opacity-10 text-success'
                          "
                        >
                          <i :class="incident.fired ? 'bi bi-fire' : 'bi bi-check-circle'"></i>
                        </div>
                        <div>
                          <div class="fw-semibold">{{ incident.key }}</div>
                          <div class="text-muted small">{{ incident.alertName }}</div>
                        </div>
                      </div>
                      <div class="d-flex align-items-center gap-3">
                        <span class="text-muted small d-none d-md-inline">{{
                          formatDate(incident.createDt)
                        }}</span>
                        <span
                          class="badge status-pill"
                          :class="
                            incident.fired
                              ? 'bg-danger bg-opacity-10 text-danger'
                              : 'bg-success bg-opacity-10 text-success'
                          "
                        >
                          <i
                            :class="
                              incident.fired ? 'bi bi-circle-fill' : 'bi bi-check-circle-fill'
                            "
                            class="me-1"
                            style="font-size: 0.5rem; vertical-align: middle"
                          ></i>
                          {{ incident.fired ? 'Active' : 'Closed' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </transition-group>
              </div>

              <div v-if="hasMoreIncidents" class="text-center mt-3 pt-3 border-top">
                <button
                  class="btn btn-sm btn-link text-decoration-none toggle-incidents-btn"
                  @click="toggleIncidents"
                >
                  <i
                    :class="showAllIncidents ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"
                    class="me-1"
                  ></i>
                  <span v-if="showAllIncidents"> Show less </span>
                  <span v-else>
                    Show all {{ relatedIncidents.length }} incidents
                    <span class="text-muted small">({{ hiddenIncidentsCount }} more)</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- Dates -->
          <div class="row g-4 mb-4">
            <div class="col-md-6">
              <div class="detail-box">
                <div class="detail-label">
                  <i class="bi bi-calendar-plus me-2 text-primary"></i>Created
                </div>
                <div class="detail-value">{{ formatDate(selectedTask.createDt) }}</div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="detail-box">
                <div class="detail-label">
                  <i class="bi bi-calendar-check me-2 text-primary"></i>Updated
                </div>
                <div class="detail-value">{{ formatDate(selectedTask.updateDt) }}</div>
              </div>
            </div>
          </div>

          <!-- Comments placeholder -->
          <div class="detail-box comments-section">
            <div class="detail-label mb-3">
              <i class="bi bi-chat-dots me-2 text-primary"></i>Comments
            </div>
            <div class="comments-placeholder text-center py-4">
              <i class="bi bi-chat-square-text fs-1 text-muted d-block mb-2"></i>
              <p class="text-muted mb-0">No comments yet. Be the first to start the discussion!</p>
            </div>
          </div>
        </div>

        <!-- Edit Mode -->
        <form v-else @submit.prevent="saveChanges" class="needs-validation edit-form">
          <div class="mb-4">
            <label for="task-name" class="form-label fw-semibold"
              ><i class="bi bi-card-heading me-2 text-primary"></i>Name</label
            >
            <input
              id="task-name"
              v-model="formData.name"
              type="text"
              class="form-control form-control-lg"
              placeholder="Enter task name"
              required
            />
          </div>
          <div class="mb-4">
            <label for="task-desc" class="form-label fw-semibold"
              ><i class="bi bi-text-paragraph me-2 text-primary"></i>Description</label
            >
            <textarea
              id="task-desc"
              v-model="formData.description"
              class="form-control"
              rows="5"
              placeholder="Enter task description"
            ></textarea>
          </div>

          <div class="row g-4 mb-4">
            <div class="col-md-6">
              <label for="task-priority" class="form-label fw-semibold"
                ><i class="bi bi-exclamation-triangle me-2 text-primary"></i>Priority</label
              >
              <select
                id="task-priority"
                v-model.number="formData.priority"
                class="form-select form-select-lg"
              >
                <option :value="TaskPriority.High">High</option>
                <option :value="TaskPriority.Medium">Medium</option>
                <option :value="TaskPriority.Low">Low</option>
              </select>
            </div>
            <div class="col-md-6">
              <label for="task-estimate" class="form-label fw-semibold"
                ><i class="bi bi-clock-history me-2 text-primary"></i>Estimate</label
              >
              <input
                id="task-estimate"
                v-model="formData.estimate"
                type="text"
                class="form-control form-control-lg"
                placeholder="e.g., 2h, 1d"
              />
            </div>
          </div>

          <div class="row g-4 mb-4">
            <div class="col-md-6">
              <label for="task-status" class="form-label fw-semibold"
                ><i class="bi bi-flag me-2 text-primary"></i>Status</label
              >
              <select
                id="task-status"
                v-model.number="formData.status"
                class="form-select form-select-lg"
              >
                <option :value="TaskStatus.Open">Open</option>
                <option :value="TaskStatus.InProgress">In Progress</option>
                <option :value="TaskStatus.Closed">Closed</option>
              </select>
            </div>
            <div class="col-md-6">
              <label for="task-assignee" class="form-label fw-semibold"
                ><i class="bi bi-person-check me-2 text-primary"></i>Assignee</label
              >
              <select
                id="task-assignee"
                v-model.number="formData.assigneeId"
                class="form-select form-select-lg"
              >
                <option :value="undefined" disabled>Select assignee</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.firstName }}
                  {{ user.secondName }}
                  {{ user?.thirdName }}
                  ({{ user.email }})
                </option>
              </select>
            </div>
          </div>
          <div class="d-flex gap-2 mt-4 pt-3 border-top">
            <button type="submit" class="btn btn-primary px-4 shadow-sm" :disabled="!formData.name">
              <i class="bi bi-check-lg me-1"></i> Save Changes
            </button>
            <button type="button" class="btn btn-outline-secondary px-4" @click="cancelEdit">
              <i class="bi bi-x-lg me-1"></i> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Not found -->
    <div v-else class="alert alert-warning d-flex align-items-center mt-3 shadow-sm" role="alert">
      <i class="bi bi-question-circle-fill me-3 fs-4"></i>
      <div>Task not found.</div>
    </div>
  </div>
</template>

<style scoped>
.task-detail-card {
  border-radius: 12px;
  overflow: hidden;
}
.card-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.task-icon-wrapper {
  width: 48px;
  height: 48px;
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-btn:hover {
  color: var(--bs-primary) !important;
  transition: color 0.2s ease;
}
.detail-box {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  height: 100%;
  transition: all 0.2s ease;
}
.detail-box:hover {
  border-color: #dee2e6;
  background-color: #f1f3f5;
}
.detail-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}
.detail-value {
  font-size: 1rem;
  color: #212529;
  font-weight: 500;
  word-break: break-word;
}
.status-badge {
  font-size: 0.85rem;
  padding: 0.4em 0.8em;
  font-weight: 600;
  border-radius: 20px;
}
.comments-section {
  background-color: #fff;
  border: 2px dashed #dee2e6;
}
.comments-placeholder {
  background-color: transparent;
}
.edit-form .form-control,
.edit-form .form-select {
  border-radius: 8px;
  border: 1px solid #ced4da;
  transition: all 0.2s ease;
}
.edit-form .form-control:focus,
.edit-form .form-select:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.25rem rgba(var(--bs-primary-rgb), 0.15);
}

.incident-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.incident-item {
  padding: 0.85rem 1rem;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.15s ease;
}

.incident-item:hover {
  border-color: #dee2e6;
  background: #f8f9fa;
  transform: translateX(2px);
}

.incident-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.status-pill {
  font-size: 0.78rem;
  padding: 0.4em 0.8em;
  font-weight: 600;
  border-radius: 20px;
}

.toggle-incidents-btn {
  color: var(--bs-primary);
  font-weight: 500;
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
}

.toggle-incidents-btn:hover {
  color: var(--bs-primary);
  background-color: rgba(var(--bs-primary-rgb), 0.05);
  border-radius: 6px;
}

.toggle-incidents-btn i {
  transition: transform 0.3s ease;
}

.incident-fade-enter-active,
.incident-fade-leave-active {
  transition: all 0.3s ease;
}

.incident-fade-enter-from,
.incident-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.incident-fade-move {
  transition: transform 0.3s ease;
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

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 1rem;
  }
  .task-icon-wrapper {
    width: 40px;
    height: 40px;
  }
}
</style>
