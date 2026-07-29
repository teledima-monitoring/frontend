import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/alerts'
import {
  Constraint,
  type AlertConfigCreate,
  type AlertConfigUpdate,
  type AlertConfigView,
} from '@/types/alert'
import { formatError } from '@/utils/format'

export const useAlertsStore = defineStore('alerts', () => {
  const alerts = ref<AlertConfigView[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const constraintNames: Record<Constraint, string> = {
    [Constraint.Less]: '<',
    [Constraint.LessEqual]: '≤',
    [Constraint.Equal]: '=',
    [Constraint.Greater]: '>',
    [Constraint.GreaterEqual]: '≥',
  }

  async function fetchAlerts() {
    loading.value = true
    error.value = null

    try {
      alerts.value = await api.getAlerts()
    } catch (e) {
      error.value = formatError(e as Error, 'Failed to fetch alerts')
    } finally {
      loading.value = false
    }
  }

  async function createAlert(data: AlertConfigCreate) {
    loading.value = true
    error.value = null

    try {
      await api.createAlert(data)
      await fetchAlerts()
    } catch (e) {
      error.value = formatError(e as Error, 'Failed to create alert')
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateAlert(id: number, data: AlertConfigUpdate) {
    loading.value = true
    error.value = null

    try {
      await api.updateAlert(id, data)
      await fetchAlerts()
    } catch (e) {
      error.value = formatError(e as Error, 'Failed to update alert')
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteAlert(id: number) {
    loading.value = true
    error.value = null

    try {
      await api.deleteAlert(id)
      await fetchAlerts()
    } catch (e) {
      error.value = formatError(e as Error, 'Failed to delete alert')
      throw e
    } finally {
      loading.value = false
    }
  }

  function getConstraintName(constraint: Constraint): string {
    return constraintNames[constraint] ?? '?'
  }

  return {
    alerts,
    loading,
    error,
    fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    getConstraintName,
  }
})
