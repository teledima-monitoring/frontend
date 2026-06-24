<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTasksStore } from '@/stores/tasks'
import { useUsersStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import { TaskPriority } from '@/types/api'

const props = defineProps<{
  incidentId: number
}>()

const emit = defineEmits<{
  assigned: [taskId: number]
  close: []
}>()

const tasksStore = useTasksStore()
const { tasks } = storeToRefs(tasksStore)

const usersStore = useUsersStore()
const { users } = storeToRefs(usersStore)

const authStore = useAuthStore()
const { user: currentUser } = storeToRefs(authStore)

const showForm = ref(false)
const selectedExistingTaskId = ref<number | null>(null)
const activeTab = ref<'create' | 'existing'>('create')

// New task form fields
const newTaskName = ref('')
const newTaskDescription = ref('')
const newTaskAssigneeId = ref<number | null>(null)
const newTaskPriority = ref(TaskPriority.Medium)
const newTaskEstimate = ref('')

async function openDialog() {
  await usersStore.fetchUsers()
  showForm.value = true
}

function closeDialog() {
  showForm.value = false
  resetForm()
}

function resetForm() {
  newTaskName.value = ''
  newTaskDescription.value = ''
  newTaskAssigneeId.value = null
  newTaskPriority.value = TaskPriority.Medium
  newTaskEstimate.value = ''
  selectedExistingTaskId.value = null
  activeTab.value = 'create'
}

async function handleCreateTask() {
  if (!newTaskName.value.trim() || !newTaskAssigneeId.value) return

  await tasksStore.createTask({
    name: newTaskName.value,
    description: newTaskDescription.value,
    assigneeId: newTaskAssigneeId.value,
    authorId: currentUser.value.id,
    incidentId: props.incidentId,
    priority: newTaskPriority.value,
    estimate: newTaskEstimate.value || undefined,
  })

  emit('assigned', -1)
  closeDialog()
}

async function handleAssignExisting() {
  if (!selectedExistingTaskId.value) return

  await tasksStore.setIncidentTask(props.incidentId, selectedExistingTaskId.value)
  emit('assigned', selectedExistingTaskId.value)
  closeDialog()
}

const isCreateDisabled = computed(
  () => !newTaskName.value.trim() || newTaskAssigneeId.value === null,
)

defineExpose({ openDialog })
</script>

<template>
  <teleport to="body">
    <!-- Backdrop -->
    <div v-if="showForm" class="modal-backdrop fade show" style="z-index: 1040"></div>

    <!-- Modal -->
    <div
      v-show="showForm"
      class="modal fade show"
      tabindex="-1"
      role="dialog"
      style="z-index: 1050; display: block; position: fixed; overflow-y: auto"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content custom-modal">
          <!-- Header -->
          <div class="modal-header border-0 pb-0">
            <div class="d-flex align-items-center">
              <div class="modal-icon me-3">
                <i class="bi bi-link-45deg"></i>
              </div>
              <div>
                <h5 class="modal-title fw-bold mb-0">Assign Task to Incident</h5>
                <small class="text-muted">Incident #{{ incidentId }}</small>
              </div>
            </div>
            <button type="button" class="btn-close" @click="closeDialog"></button>
          </div>

          <!-- Tabs -->
          <div class="modal-body pt-3">
            <ul class="nav nav-pills mb-4 gap-2">
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeTab === 'create' }"
                  @click="activeTab = 'create'"
                >
                  <i class="bi bi-plus-circle me-1"></i> Create New Task
                </button>
              </li>
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeTab === 'existing' }"
                  @click="activeTab = 'existing'"
                >
                  <i class="bi bi-list-ul me-1"></i> Select Existing Task
                </button>
              </li>
            </ul>

            <!-- Create New Task Tab -->
            <div v-if="activeTab === 'create'" class="tab-content">
              <form @submit.prevent="handleCreateTask">
                <div class="mb-3">
                  <label for="task-name" class="form-label small fw-semibold">
                    <i class="bi bi-card-heading me-1 text-primary"></i> Name *
                  </label>
                  <input
                    id="task-name"
                    v-model="newTaskName"
                    type="text"
                    class="form-control"
                    placeholder="Enter task name"
                  />
                </div>

                <div class="mb-3">
                  <label for="task-desc" class="form-label small fw-semibold">
                    <i class="bi bi-text-paragraph me-1 text-primary"></i> Description
                  </label>
                  <textarea
                    id="task-desc"
                    v-model="newTaskDescription"
                    class="form-control"
                    rows="3"
                    placeholder="Enter task description (optional)"
                  ></textarea>
                </div>

                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label for="new-task-priority" class="form-label small fw-semibold">
                      <i class="bi bi-exclamation-triangle me-1 text-primary"></i> Priority *
                    </label>
                    <select
                      id="new-task-priority"
                      v-model.number="newTaskPriority"
                      class="form-select"
                    >
                      <option :value="TaskPriority.High">High</option>
                      <option :value="TaskPriority.Medium">Medium</option>
                      <option :value="TaskPriority.Low">Low</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label for="new-task-estimate" class="form-label small fw-semibold">
                      <i class="bi bi-clock-history me-1 text-primary"></i> Estimate
                    </label>
                    <input
                      id="new-task-estimate"
                      v-model="newTaskEstimate"
                      type="text"
                      class="form-control"
                      placeholder="e.g., 2h, 1d"
                    />
                  </div>
                </div>

                <div class="mb-4">
                  <label for="task-assignee" class="form-label small fw-semibold">
                    <i class="bi bi-person-check me-1 text-primary"></i> Assignee *
                  </label>
                  <select id="task-assignee" v-model.number="newTaskAssigneeId" class="form-select">
                    <option :value="null" disabled>Select assignee...</option>
                    <option v-for="user in users" :key="user.id" :value="user.id">
                      {{ user.login }}
                    </option>
                  </select>
                </div>

                <div class="d-flex justify-content-end gap-2 pt-3 border-top">
                  <button type="button" class="btn btn-outline-secondary" @click="closeDialog">
                    <i class="bi bi-x-lg me-1"></i> Cancel
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary shadow-sm"
                    :disabled="isCreateDisabled"
                  >
                    <i class="bi bi-plus-circle me-1"></i> Create & Assign Task
                  </button>
                </div>
              </form>
            </div>

            <!-- Select Existing Task Tab -->
            <div v-else class="tab-content">
              <!-- Empty state -->
              <div v-if="tasks.length === 0" class="text-center py-5">
                <div class="empty-icon mx-auto mb-3">
                  <i class="bi bi-inbox"></i>
                </div>
                <h6 class="text-muted fw-semibold">No tasks available</h6>
                <p class="text-muted small mb-0">Create a new task instead.</p>
              </div>

              <!-- Tasks list -->
              <div v-else class="task-select-list">
                <div
                  v-for="task in tasks"
                  :key="task.id"
                  class="task-select-item"
                  :class="{ selected: selectedExistingTaskId === task.id }"
                  @click="selectedExistingTaskId = task.id"
                >
                  <div class="d-flex align-items-center flex-grow-1">
                    <div class="task-radio me-3">
                      <i
                        v-if="selectedExistingTaskId === task.id"
                        class="bi bi-check-circle-fill"
                      ></i>
                      <i v-else class="bi bi-circle"></i>
                    </div>
                    <div class="flex-grow-1">
                      <div class="d-flex align-items-center mb-1">
                        <span class="fw-semibold me-2">{{ task.key }}</span>
                        <span class="text-muted">{{ task.name }}</span>
                      </div>
                      <div class="d-flex align-items-center gap-2 small text-muted">
                        <span
                          ><i class="bi bi-person me-1"></i
                          >{{ usersStore.getUserNameById(task.assigneeId) }}</span
                        >
                        <span
                          class="badge"
                          :class="tasksStore.getTaskStatusBadgeClass(task.status)"
                        >
                          {{ tasksStore.getTaskStatusLabel(task.status) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action buttons -->
              <div
                v-if="tasks.length > 0"
                class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top"
              >
                <button type="button" class="btn btn-outline-secondary" @click="closeDialog">
                  <i class="bi bi-x-lg me-1"></i> Cancel
                </button>
                <button
                  type="button"
                  class="btn btn-primary shadow-sm"
                  :disabled="!selectedExistingTaskId"
                  @click="handleAssignExisting"
                >
                  <i class="bi bi-link-45deg me-1"></i> Assign Selected Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.custom-modal {
  border-radius: 16px;
  border: none;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(78, 115, 223, 0.1) 0%, rgba(34, 74, 190, 0.1) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #4e73df;
}

/* Pills tabs */
.nav-pills .nav-link {
  color: #6c757d;
  font-weight: 500;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
  border: none;
  background: transparent;
}

.nav-pills .nav-link:hover:not(.active) {
  background: #f1f3f5;
  color: #495057;
}

.nav-pills .nav-link.active {
  background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
  color: #fff;
}

/* Form inputs */
.form-control,
.form-select {
  border-radius: 8px;
  border: 1px solid #ced4da;
  transition: all 0.2s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: #4e73df;
  box-shadow: 0 0 0 0.25rem rgba(78, 115, 223, 0.15);
}

/* Task select list */
.task-select-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.task-select-item {
  padding: 1rem;
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.task-select-item:hover {
  background: #f1f3f5;
  border-color: #dee2e6;
}

.task-select-item.selected {
  background: rgba(78, 115, 223, 0.05);
  border-color: #4e73df;
}

.task-radio {
  font-size: 1.3rem;
  color: #adb5bd;
}

.task-select-item.selected .task-radio {
  color: #4e73df;
}

/* Empty state */
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
</style>
