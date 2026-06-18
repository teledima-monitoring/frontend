import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'
import { Constraint } from '@/types/api'
import type { AlertConfigCreate, AlertConfigView } from '@/types/api'

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
      error.value = e instanceof Error ? e.message : 'Failed to fetch alerts'
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
      error.value = e instanceof Error ? e.message : 'Failed to create alert'
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
      error.value = e instanceof Error ? e.message : 'Failed to delete alert'
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
    deleteAlert,
    getConstraintName,
  }
})
