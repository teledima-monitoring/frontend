import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import { api } from '@/services/api'
import type { DashboardView, DashboardCreate, DashboardUpdate } from '@/types/api'
import { formatError } from '@/utils/format'

export type DashboardGroupBy = 'none' | 'collector' | string

export const useDashboardStore = defineStore('dashboard', () => {
  // User dashboards
  const userDashboards = ref<DashboardView[]>([])
  const selectedDashboardId = shallowRef<number | null>(null)
  const loading = shallowRef(false)
  const error = shallowRef<string | null>(null)

  const selectedDashboard = computed(
    () => userDashboards.value.find((d) => d.id === selectedDashboardId.value) ?? null,
  )

  // Dashboard CRUD
  async function fetchDashboards() {
    loading.value = true
    error.value = null
    try {
      const response = await api.getDashboards()
      userDashboards.value = response
    } catch (e) {
      error.value = formatError(e as Error, 'Failed to fetch dashboards')
    } finally {
      loading.value = false
    }
  }

  async function createDashboard(data: DashboardCreate) {
    loading.value = true
    error.value = null
    try {
      await api.createDashboard(data)
      await fetchDashboards()
    } catch (e) {
      error.value = formatError(e as Error, 'Failed to create dashboard')
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateDashboard(id: number, data: DashboardUpdate) {
    loading.value = true
    error.value = null
    try {
      await api.updateDashboard(id, data)
      await fetchDashboards()
    } catch (e) {
      error.value = formatError(e as Error, 'Failed to update dashboard')
      throw e
    } finally {
      loading.value = false
    }
  }

  async function removeDashboard(id: number) {
    loading.value = true
    error.value = null
    try {
      await api.deleteDashboard(id)
      if (selectedDashboardId.value === id) {
        selectedDashboardId.value = null
      }
      await fetchDashboards()
    } catch (e) {
      error.value = formatError(e as Error, 'Failed to delete dashboard')
      throw e
    } finally {
      loading.value = false
    }
  }

  function selectDashboard(id: number | null) {
    selectedDashboardId.value = id
  }

  return {
    loading,
    error,
    userDashboards,
    selectedDashboardId,
    selectedDashboard,
    fetchDashboards,
    createDashboard,
    updateDashboard,
    removeDashboard,
    selectDashboard,
  }
})
