import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { api } from '@/services/api'
import {
  type TaskView,
  type TaskCreate,
  type TaskUpdate,
  TaskPriority,
  TaskStatus,
} from '@/types/task'
import { formatError } from '@/utils/format'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<TaskView[]>([])
  const selectedTask = ref<TaskView | null>(null)
  const loading = shallowRef(false)
  const error = shallowRef<string | null>(null)

  const taskStatusLabels: Record<TaskStatus, string> = {
    [TaskStatus.Open]: 'task.status.open',
    [TaskStatus.InProgress]: 'task.status.inProgress',
    [TaskStatus.Closed]: 'task.status.closed',
  }

  const taskStatusBadgeClasses: Record<TaskStatus, string> = {
    [TaskStatus.Open]: 'bg-primary',
    [TaskStatus.InProgress]: 'bg-warning text-dark',
    [TaskStatus.Closed]: 'bg-success',
  }

  const taskPriorityLabels: Record<TaskPriority, string> = {
    [TaskPriority.High]: 'task.priority.high',
    [TaskPriority.Medium]: 'task.priority.medium',
    [TaskPriority.Low]: 'task.priority.low',
  }
  const taskPriorityBadgeClasses: Record<TaskPriority, string> = {
    [TaskPriority.High]: 'bg-danger',
    [TaskPriority.Medium]: 'bg-warning text-dark',
    [TaskPriority.Low]: 'bg-info text-dark',
  }

  function getTaskStatusLabel(status: TaskStatus): string {
    return taskStatusLabels[status] ?? 'task.statusMap.unknown'
  }

  function getTaskStatusBadgeClass(status: TaskStatus): string {
    return taskStatusBadgeClasses[status] ?? 'bg-secondary'
  }

  function getTaskPriorityLabel(priority: TaskPriority): string {
    return taskPriorityLabels[priority] ?? 'Medium'
  }
  function getTaskPriorityBadgeClass(priority: TaskPriority): string {
    return taskPriorityBadgeClasses[priority] ?? 'bg-secondary'
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
    getTaskPriorityLabel,
    getTaskPriorityBadgeClass,
    fetchTasks,
    fetchTaskById,
    createTask,
    updateTask,
    clearSelectedTask,
  }
})
