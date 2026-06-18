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
  async() => {
    editMode.value = false
    await loadTask()
    await fetchUsers()
  },
  { immediate: true },
)
</script>

<template>
  <div class="container-fluid">
    <!-- Back Button -->
    <button class="btn btn-outline-secondary mb-3" @click="goBack">
      <i class="bi bi-arrow-left"></i> Back to Tasks
    </button>

    <!-- Loading State -->
    <div v-if="loading && !selectedTask" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger mt-3">{{ error }}</div>

    <!-- Task Detail -->
    <div v-else-if="selectedTask" class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Task Details</h5>
        <div v-if="!editMode">
          <button class="btn btn-sm btn-outline-primary me-2" @click="startEdit">
            <i class="bi bi-pencil"></i> Edit
          </button>
        </div>
      </div>

      <div class="card-body">
        <!-- View Mode -->
        <div v-if="!editMode">
          <!-- Key and Name -->
          <div class="row mb-4">
            <div class="col-md-6">
              <label class="text-muted small">Key</label>
              <p class="fw-bold">{{ selectedTask.key }}</p>
            </div>
            <div class="col-md-6">
              <label class="text-muted small">Name</label>
              <p class="fw-bold">{{ selectedTask.name }}</p>
            </div>
          </div>

          <!-- Description -->
          <div class="row mb-4">
            <div class="col-12">
              <label class="text-muted small">Description</label>
              <p>{{ selectedTask.description || '—' }}</p>
            </div>
          </div>

          <!-- Author and Assignee -->
          <div class="row mb-4">
            <div class="col-md-6">
              <label class="text-muted small">Author</label>
              <p>{{ getUserNameById(selectedTask.authorId) }}</p>
            </div>
            <div class="col-md-6">
              <label class="text-muted small">Assignee</label>
              <p>{{ getUserNameById(selectedTask.assigneeId) }}</p>
            </div>
          </div>

          <!-- Status -->
          <div class="row mb-4">
            <div class="col-md-6">
              <label class="text-muted small">Status</label>
              <p>
                <span
                  class="badge"
                  :class="tasksStore.getTaskStatusBadgeClass(selectedTask.status)"
                >
                  {{ tasksStore.getTaskStatusLabel(selectedTask.status) }}
                </span>
              </p>
            </div>
          </div>

          <!-- Dates -->
          <div class="row mb-4">
            <div class="col-md-6">
              <label class="text-muted small">Created</label>
              <p>{{ formatDate(selectedTask.createDt) }}</p>
            </div>
            <div class="col-md-6">
              <label class="text-muted small">Updated</label>
              <p>{{ formatDate(selectedTask.updateDt) }}</p>
            </div>
          </div>

          <!-- Comments placeholder -->
          <div class="row mb-4">
            <div class="col-12">
              <label class="text-muted small">Comments</label>
              <div class="border rounded p-3 bg-light text-muted">No comments yet.</div>
            </div>
          </div>
        </div>

        <!-- Edit Mode -->
        <form v-else @submit.prevent="saveChanges" class="needs-validation">
          <!-- Name -->
          <div class="row mb-3">
            <div class="col-12">
              <label for="task-name" class="form-label">Name</label>
              <input
                id="task-name"
                v-model="formData.name"
                type="text"
                class="form-control"
                required
              />
            </div>
          </div>

          <!-- Description -->
          <div class="row mb-3">
            <div class="col-12">
              <label for="task-desc" class="form-label">Description</label>
              <textarea
                id="task-desc"
                v-model="formData.description"
                class="form-control"
                rows="4"
              ></textarea>
            </div>
          </div>

          <!-- Status -->
          <div class="row mb-3">
            <div class="col-md-6">
              <label for="task-status" class="form-label">Status</label>
              <select id="task-status" v-model.number="formData.status" class="form-select">
                <option :value="TaskStatus.Open">Open</option>
                <option :value="TaskStatus.InProgress">In Progress</option>
                <option :value="TaskStatus.Closed">Closed</option>
              </select>
            </div>

            <!-- Assignee -->
            <div class="col-md-6">
              <label for="task-assignee" class="form-label">Assignee</label>
              <select id="task-assignee" v-model.number="formData.assigneeId" class="form-select">
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.login }}
                </option>
              </select>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="d-flex gap-2 mt-3">
            <button type="submit" class="btn btn-primary" :disabled="!formData.name">
              <i class="bi bi-check-lg"></i> Save
            </button>
            <button type="button" class="btn btn-secondary" @click="cancelEdit">
              <i class="bi bi-x-lg"></i> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Not found -->
    <div v-else class="alert alert-warning mt-3">Task not found.</div>
  </div>
</template>
