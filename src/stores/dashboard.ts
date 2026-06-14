import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import { api } from '@/services/api'
import type { Metric, UserDashboard, UserDashboardCreate, UserDashboardUpdate } from '@/types/api'

export interface ChartSeries {
  name: string
  data: Array<{ time: number; value: number }>
}

export type DashboardGroupBy = 'none' | 'collector' | string

export const useDashboardStore = defineStore('dashboard', () => {
  // Metrics data
  const metrics = ref<Array<Metric>>([])
  const collectors = ref<Map<number, { name: string; labels: Record<string, string> }>>(new Map())
  const loading = ref(false)
  const error = ref<string | null>(null)

  // User dashboards
  const userDashboards = ref<UserDashboard[]>([])
  const selectedDashboardId = shallowRef<number | null>(null)
  const dashboardsLoading = ref(false)

  const selectedDashboard = computed(
    () => userDashboards.value.find((d) => d.id === selectedDashboardId.value) ?? null,
  )

  const availableLabelKeys = computed(() => {
    const keys = new Set<string>()
    for (const collector of collectors.value.values()) {
      for (const key of Object.keys(collector.labels)) {
        keys.add(key)
      }
    }
    return Array.from(keys)
  })

  // Build chart series based on selected dashboard's groupBy setting
  const series = computed<ChartSeries[]>(() => {
    if (metrics.value.length === 0) return []

    const dashboard = selectedDashboard.value
    const groupBy = dashboard?.groupBy ?? 'collector'

    // Group metrics by timestamp first
    const timeValueMap = new Map<string, number[]>()
    for (const metric of metrics.value) {
      const key = metric.dt
      if (!timeValueMap.has(key)) {
        timeValueMap.set(key, [])
      }
      timeValueMap.get(key)!.push(metric.value)
    }

    if (groupBy === 'none') {
      // Aggregate all values per timestamp (sum)
      const aggregated: Array<{ time: number; value: number }> = []
      for (const [dt, values] of timeValueMap) {
        aggregated.push({
          time: new Date(dt).getTime(),
          value: values.reduce((a, b) => a + b, 0),
        })
      }
      return [{ name: 'Total', data: aggregated }]
    }

    // Group by collector or label key
    const groups = new Map<string, Array<{ time: number; value: number }>>()

    for (const metric of metrics.value) {
      const collector = collectors.value.get(Number(metric.collectorId))
      let groupName: string

      if (groupBy === 'collector') {
        groupName = collector?.name ?? metric.collectorId
      } else {
        groupName = collector?.labels[groupBy] ?? 'unknown'
      }

      if (!groups.has(groupName)) {
        groups.set(groupName, [])
      }
      groups.get(groupName)!.push({
        time: new Date(metric.dt).getTime(),
        value: metric.value,
      })
    }

    return Array.from(groups.entries()).map(([name, data]) => ({ name, data }))
  })

  async function fetchMetrics(params: {
    start: string
    end: string
    kind: string
    metricName?: string
    filters?: Record<string, string>
  }) {
    loading.value = true
    error.value = null
    try {
      const response = await api.getMetrics(params)
      metrics.value = response.metrics
      collectors.value = new Map(
        response.collectors.map((c) => [c.id, { name: c.name, labels: c.labels }]),
      )
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch metrics'
    } finally {
      loading.value = false
    }
  }

  // Dashboard CRUD
  async function fetchDashboards() {
    dashboardsLoading.value = true
    try {
      const response = await api.getDashboards()
      userDashboards.value = response
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch dashboards'
    } finally {
      dashboardsLoading.value = false
    }
  }

  async function createDashboard(data: UserDashboardCreate) {
    try {
      await api.createDashboard(data)
      await fetchDashboards()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create dashboard'
      throw e
    }
  }

  async function updateDashboard(id: number, data: UserDashboardUpdate) {
    try {
      await api.updateDashboard(id, data)
      await fetchDashboards()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update dashboard'
      throw e
    }
  }

  async function removeDashboard(id: number) {
    try {
      await api.deleteDashboard(id)
      if (selectedDashboardId.value === id) {
        selectedDashboardId.value = null
        metrics.value = []
      }
      await fetchDashboards()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete dashboard'
      throw e
    }
  }

  function selectDashboard(id: number | null) {
    selectedDashboardId.value = id
    if (id === null) {
      metrics.value = []
    }
  }

  async function loadDashboardMetrics(dashboard: UserDashboard, start: string, end: string) {
    await fetchMetrics({
      start,
      end,
      kind: dashboard.collectorKind,
      metricName: dashboard.metricName,
      filters: dashboard.filters,
    })
  }

  return {
    metrics,
    collectors,
    loading,
    error,
    series,
    availableLabelKeys,
    fetchMetrics,
    userDashboards,
    selectedDashboardId,
    selectedDashboard,
    dashboardsLoading,
    fetchDashboards,
    createDashboard,
    updateDashboard,
    removeDashboard,
    selectDashboard,
    loadDashboardMetrics,
  }
})
