<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTasksStore } from '@/stores/tasks'
import { useUsersStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'

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

// New task form fields
const newTaskName = ref('')
const newTaskDescription = ref('')
const newTaskAssigneeId = ref<number | null>(null)

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
  selectedExistingTaskId.value = null
}

async function handleCreateTask() {
  if (!newTaskName.value.trim() || !newTaskAssigneeId.value) return

  await tasksStore.createTask({
    name: newTaskName.value,
    description: newTaskDescription.value,
    assigneeId: newTaskAssigneeId.value,
    authorId: currentUser.value.id, // Will be set by backend based on auth
    incidentId: props.incidentId,
  })

  emit('assigned', -1) // Signal parent to refresh
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
  <!-- Overlay/backdrop -->
  <teleport to="body">
    <div v-if="showForm" class="modal-backdrop fade show" style="z-index: 1040"></div>

    <!-- Modal -->
    <div
      v-show="showForm"
      class="modal fade show"
      tabindex="-1"
      role="dialog"
      style="z-index: 1050; display: block; position: fixed; overflow-y: auto"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Assign Task to Incident</h5>
            <button type="button" class="btn-close" @click="closeDialog"></button>
          </div>

          <div class="modal-body">
            <!-- Tabs -->
            <ul class="nav nav-tabs mb-3">
              <li class="nav-item">
                <a
                  class="nav-link active"
                  href="#"
                  data-bs-toggle="tab"
                  data-bs-target="#create-task"
                >
                  Create New Task
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#" data-bs-toggle="tab" data-bs-target="#existing-task">
                  Select Existing Task
                </a>
              </li>
            </ul>

            <div class="tab-content">
              <!-- Create New Task -->
              <div class="tab-pane fade show active" id="create-task">
                <form @submit.prevent="handleCreateTask" class="row g-3">
                  <div class="col-12">
                    <label for="task-name" class="form-label">Name *</label>
                    <input
                      id="task-name"
                      v-model="newTaskName"
                      type="text"
                      class="form-control"
                      placeholder="Enter task name"
                    />
                  </div>

                  <div class="col-12">
                    <label for="task-desc" class="form-label">Description</label>
                    <textarea
                      id="task-desc"
                      v-model="newTaskDescription"
                      class="form-control"
                      rows="3"
                      placeholder="Enter task description (optional)"
                    ></textarea>
                  </div>

                  <div class="col-12">
                    <label for="task-assignee" class="form-label">Assignee *</label>
                    <select
                      id="task-assignee"
                      v-model.number="newTaskAssigneeId"
                      class="form-select"
                    >
                      <option :value="null" disabled>Select assignee...</option>
                      <option v-for="user in users" :key="user.id" :value="user.id">
                        {{ user.login }}
                      </option>
                    </select>
                  </div>

                  <div class="col-12">
                    <button type="submit" class="btn btn-primary" :disabled="isCreateDisabled">
                      <i class="bi bi-plus-circle"></i> Create &amp; Assign Task
                    </button>
                  </div>
                </form>
              </div>

              <!-- Select Existing Task -->
              <div class="tab-pane fade" id="existing-task">
                <div v-if="tasks.length === 0" class="text-muted text-center py-3">
                  No tasks available.
                </div>

                <div v-else class="list-group">
                  <button
                    v-for="task in tasks"
                    :key="task.id"
                    type="button"
                    class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    :class="{ active: selectedExistingTaskId === task.id }"
                    @click="selectedExistingTaskId = task.id"
                  >
                    <div>
                      <strong>{{ task.key }}</strong> - {{ task.name }}
                      <br />
                      <small class="text-muted">
                        Assignee: {{ usersStore.getUserNameById(task.assigneeId) }}
                      </small>
                    </div>
                    <span class="badge" :class="tasksStore.getTaskStatusBadgeClass(task.status)">
                      {{ tasksStore.getTaskStatusLabel(task.status) }}
                    </span>
                  </button>
                </div>

                <div class="mt-3 text-end">
                  <button
                    type="button"
                    class="btn btn-primary"
                    :disabled="!selectedExistingTaskId"
                    @click="handleAssignExisting"
                  >
                    <i class="bi bi-link-45deg"></i> Assign Selected Task
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDialog">Close</button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>
