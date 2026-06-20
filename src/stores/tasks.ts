import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { api } from '@/services/api'
import type { TaskView, TaskCreate, TaskUpdate, IncidentSetTask } from '@/types/api'
import { TaskStatus } from '@/types/api'
import { formatError } from '@/utils/format'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<TaskView[]>([])
  const selectedTask = ref<TaskView | null>(null)
  const loading = shallowRef(false)
  const error = shallowRef<string | null>(null)

  const taskStatusLabels: Record<TaskStatus, string> = {
    [TaskStatus.Open]: 'Open',
    [TaskStatus.InProgress]: 'In Progress',
    [TaskStatus.Closed]: 'Closed',
  }

  const taskStatusBadgeClasses: Record<TaskStatus, string> = {
    [TaskStatus.Open]: 'bg-primary',
    [TaskStatus.InProgress]: 'bg-warning text-dark',
    [TaskStatus.Closed]: 'bg-success',
  }

  function getTaskStatusLabel(status: TaskStatus): string {
    return taskStatusLabels[status] ?? 'Unknown'
  }

  function getTaskStatusBadgeClass(status: TaskStatus): string {
    return taskStatusBadgeClasses[status] ?? 'bg-secondary'
  }

  async function fetchTasks() {
    loading.value = true
    error.value = null

    try {
      tasks.value = await api.getTasks()
    } catch (e) {
      error.value = formatError(e as Error, 'Failed to fetch tasks')
    } finally {
      loading.value = false
    }
  }

  async function fetchTaskById(id: number) {
    loading.value = true
    error.value = null

    try {
      const task = await api.getTaskById(id)
      selectedTask.value = task

      return task
    } catch (e) {
      error.value = formatError(e as Error, 'Failed to fetch task')
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createTask(data: TaskCreate) {
    loading.value = true
    error.value = null
    
    try {
      await api.createTask(data)
      await fetchTasks()
    } catch (e) {
      error.value = formatError(e as Error, 'Failed to create task')
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateTask(id: number, data: TaskUpdate) {
    loading.value = true
    error.value = null

    try {
      await api.updateTask(id, data)
      await fetchTasks()
      if (selectedTask.value?.id === id) {
        selectedTask.value = await api.getTaskById(id)
      }
    } catch (e) {
      error.value = formatError(e as Error, 'Failed to update task')
      throw e
    } finally {
      loading.value = false
    }
  }

  async function setIncidentTask(incidentId: number, taskId: number) {
    loading.value = true
    error.value = null
    const data: IncidentSetTask = { task_id: taskId }

    try {
      await api.setIncidentTask(incidentId, data)
    } catch(e) {
      error.value = formatError(e as Error, "Failed to set incident task")
    } finally {
      loading.value = false
    }
  }

  function clearSelectedTask() {
    selectedTask.value = null
  }

  return {
    tasks,
    selectedTask,
    loading,
    error,
    getTaskStatusLabel,
    getTaskStatusBadgeClass,
    fetchTasks,
    fetchTaskById,
    createTask,
    updateTask,
    setIncidentTask,
    clearSelectedTask,
  }
})
