<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useTasksStore } from '@/stores/tasks'
import { useUsersStore } from '@/stores/user'
import { TaskStatus } from '@/types/api'
import { formatDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const tasksStore = useTasksStore()
const { selectedTask, loading, error } = storeToRefs(tasksStore)
const { fetchTaskById, updateTask, clearSelectedTask } = tasksStore
 
const usersStore = useUsersStore()
const { users } = storeToRefs(usersStore)
const { fetchUsers, getUserNameById } = usersStore

const taskId = computed(() => Number(route.params.id))

// Local form state for editing
const editMode = ref(false)
const formData = reactive({
  name: '',
  description: '',
  assigneeId: undefined as number | undefined,
  status: undefined as TaskStatus | undefined,
})

async function loadTask() {
  try {
    await fetchTaskById(taskId.value)
    if (selectedTask.value) {
      formData.name = selectedTask.value.name
      formData.description = selectedTask.value.description
      formData.assigneeId = selectedTask.value.assigneeId
      formData.status = selectedTask.value.status
    }
  } catch {
    router.push({ name: 'Tasks' })
  }
}

async function saveChanges() {
  if (!selectedTask.value) return

  const updates: Record<string, unknown> = {}

  if (formData.name && formData.name !== selectedTask.value.name) {
    updates.name = formData.name
  }
  if (formData.description !== selectedTask.value.description) {
    updates.description = formData.description
  }
  if (formData.assigneeId && formData.assigneeId !== selectedTask.value.assigneeId) {
    updates.assigneeId = formData.assigneeId
  }
  if (formData.status && formData.status !== selectedTask.value.status) {
    updates.status = formData.status
  }

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

// Watch route param changes — handles both initial load and navigation to different tasks
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
    <div v-else-if="error" class="alert alert-danger d-flex align-items-center mt-3 shadow-sm" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
      <div>{{ error }}</div>
    </div>

    <!-- Task Detail -->
    <div v-else-if="selectedTask" class="card task-detail-card shadow-sm border-0">
      <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center p-4">
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
                  <span class="badge status-badge" :class="tasksStore.getTaskStatusBadgeClass(selectedTask.status)">
                    {{ tasksStore.getTaskStatusLabel(selectedTask.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="detail-box mb-4">
            <div class="detail-label"><i class="bi bi-text-paragraph me-2 text-primary"></i>Description</div>
            <div class="detail-value text-break">
              {{ selectedTask.description || 'No description provided.' }}
            </div>
          </div>

          <!-- Author and Assignee -->
          <div class="row g-4 mb-4">
            <div class="col-md-6">
              <div class="detail-box">
                <div class="detail-label"><i class="bi bi-person-badge me-2 text-primary"></i>Author</div>
                <div class="detail-value">{{ getUserNameById(selectedTask.authorId) }}</div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="detail-box">
                <div class="detail-label"><i class="bi bi-person-check me-2 text-primary"></i>Assignee</div>
                <div class="detail-value">{{ getUserNameById(selectedTask.assigneeId) || 'Unassigned' }}</div>
              </div>
            </div>
          </div>

          <!-- Dates -->
          <div class="row g-4 mb-4">
            <div class="col-md-6">
              <div class="detail-box">
                <div class="detail-label"><i class="bi bi-calendar-plus me-2 text-primary"></i>Created</div>
                <div class="detail-value">{{ formatDate(selectedTask.createDt) }}</div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="detail-box">
                <div class="detail-label"><i class="bi bi-calendar-check me-2 text-primary"></i>Updated</div>
                <div class="detail-value">{{ formatDate(selectedTask.updateDt) }}</div>
              </div>
            </div>
          </div>

          <!-- Comments placeholder -->
          <div class="detail-box comments-section">
            <div class="detail-label mb-3"><i class="bi bi-chat-dots me-2 text-primary"></i>Comments</div>
            <div class="comments-placeholder text-center py-4">
              <i class="bi bi-chat-square-text fs-1 text-muted d-block mb-2"></i>
              <p class="text-muted mb-0">No comments yet. Be the first to start the discussion!</p>
            </div>
          </div>
        </div>

        <!-- Edit Mode -->
        <form v-else @submit.prevent="saveChanges" class="needs-validation edit-form">
          <div class="mb-4">
            <label for="task-name" class="form-label fw-semibold">
              <i class="bi bi-card-heading me-2 text-primary"></i>Name
            </label>
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
            <label for="task-desc" class="form-label fw-semibold">
              <i class="bi bi-text-paragraph me-2 text-primary"></i>Description
            </label>
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
              <label for="task-status" class="form-label fw-semibold">
                <i class="bi bi-flag me-2 text-primary"></i>Status
              </label>
              <select id="task-status" v-model.number="formData.status" class="form-select form-select-lg">
                <option :value="TaskStatus.Open">Open</option>
                <option :value="TaskStatus.InProgress">In Progress</option>
                <option :value="TaskStatus.Closed">Closed</option>
              </select>
            </div>

            <div class="col-md-6">
              <label for="task-assignee" class="form-label fw-semibold">
                <i class="bi bi-person-check me-2 text-primary"></i>Assignee
              </label>
              <select id="task-assignee" v-model.number="formData.assigneeId" class="form-select form-select-lg">
                <option :value="undefined" disabled>Select assignee</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.login }}
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

/* Responsive adjustments */
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
