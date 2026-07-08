import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import { api } from '@/services/api'
import type { Metric } from '@/types/metrics'
import { formatError } from '@/utils/format'
import { useDashboardStore } from './dashboard'

export interface ChartSeries {
  name: string
  data: Array<{ time: number; value: number }>
}

export const useMetricsStore = defineStore('metrics', () => {
  const dashboardStore = useDashboardStore()

  // Metrics data
  const metrics = ref<Array<Metric>>([])
  const collectors = ref<Map<number, { name: string; labels: Record<string, string> }>>(new Map())
  const loading = shallowRef(false)
  const error = shallowRef<string | null>(null)

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

    const dashboard = dashboardStore.selectedDashboard
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
    metricName: string
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
      error.value = formatError(e as Error, 'Failed to fetch metrics')
    } finally {
      loading.value = false
    }
  }

  function clearMetrics() {
    metrics.value = []
    collectors.value.clear()
  }

  return {
    metrics,
    collectors,
    loading,
    error,
    series,
    availableLabelKeys,
    fetchMetrics,
    clearMetrics,
  }
})
