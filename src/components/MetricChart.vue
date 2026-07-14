<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '@/stores/dashboard'
import { useMetricsStore } from '@/stores/metrics'
import { formatDate } from '@/utils/format'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import type { CallbackDataParams } from 'echarts/types/dist/shared'

use([CanvasRenderer, LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent])

// --- Store & State ---
const dashboardStore = useDashboardStore()
const { selectedDashboard } = storeToRefs(dashboardStore)

const metricsStore = useMetricsStore()
const { series, loading: loadingMetrics } = storeToRefs(metricsStore)
const { fetchMetrics } = metricsStore

// --- Chart Options ---
const startTime = ref<Date>(new Date(Date.now() - 24 * 60 * 60 * 1000))
const endTime = ref<Date>(new Date())

const startTimeInput = computed({
  get: () => formatDate(startTime.value),
  set: (value: string) => {
    startTime.value = new Date(value)
  },
})

const endTimeInput = computed({
  get: () => formatDate(endTime.value),
  set: (value: string) => {
    endTime.value = new Date(value)
  },
})

async function handleFetch() {
  if (!selectedDashboard.value) return

  await fetchMetrics({
    start: startTime.value.toISOString(),
    end: endTime.value.toISOString(),
    kind: selectedDashboard.value.collectorKind,
    metricName: selectedDashboard.value.metricName,
    filters: selectedDashboard.value.filters,
  })
}

const option = computed(() => {
  if (series.value.length === 0) {
    return { title: { text: '', left: 'center' } }
  }

  const allTimes = series.value.flatMap((s) => s.data.map((d) => d.time))
  const minTime = Math.min(...allTimes)
  const maxTime = Math.max(...allTimes)

  return {
    title: { text: '', left: 'center' },
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { type: 'cross' as const },
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#e9ecef',
      borderWidth: 1,
      textStyle: { color: '#212529', fontSize: 13 },
      formatter: (params: CallbackDataParams[] | undefined) => {
        if (!params || !Array.isArray(params)) return ''
        let result = ''
        params.forEach((p: CallbackDataParams) => {
          if (Array.isArray(p.value) && p.value.length >= 2) {
            result += `<div style="display:flex;align-items:center;margin:2px 0;">
              ${p.marker}
              <span style="flex:1;margin:0 8px;">${p.seriesName}</span>
              <strong>${Number(p.value[1])?.toFixed(2)}</strong>
            </div>`
          }
        })
        return result
      },
    },
    legend: {
      data: series.value.map((s) => s.name),
      top: 10,
      textStyle: { color: '#6c757d' },
    },
    grid: { left: 60, right: 30, top: 60, bottom: 50 },
    xAxis: {
      type: 'time' as const,
      min: minTime,
      max: maxTime,
      axisLine: { lineStyle: { color: '#e9ecef' } },
      axisLabel: { color: '#6c757d' },
    },
    yAxis: {
      type: 'value' as const,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f1f3f5', type: 'dashed' } },
      axisLabel: { color: '#6c757d' },
    },
    series: series.value.map((s) => ({
      name: s.name,
      type: 'line',
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2.5 },
      areaStyle: { opacity: 0.08 },
      emphasis: { focus: 'series' },
      data: s.data.map((d) => [d.time, d.value]),
    })),
  }
})

const hasData = computed(
  () => series.value.length > 0 && series.value.some((s) => s.data.length > 0),
)
</script>

<template>
  <div class="chart-wrapper">
    <!-- Header & Controls -->
    <div
      class="chart-header p-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-3"
    >
      <div>
        <h6 class="mb-0 fw-bold">
          <i class="bi bi-bar-chart-line me-2 text-primary"></i>{{ $t("dashboard.metrics.title") }}
        </h6>
      </div>

      <!-- Time Range Controls -->
      <div class="d-flex flex-wrap align-items-end gap-2">
        <div>
          <label class="form-label small fw-semibold mb-1 text-muted">
            <i class="bi bi-calendar-event me-1"></i>{{ $t("dashboard.metrics.timeRange.start") }}
          </label>
          <input
            v-model="startTimeInput"
            type="datetime-local"
            class="form-control form-control-sm"
            style="width: 210px"
            :step="60"
          />
        </div>
        <div>
          <label class="form-label small fw-semibold mb-1 text-muted">
            <i class="bi bi-calendar-check me-1"></i>{{ $t("dashboard.metrics.timeRange.end") }}
          </label>
          <input
            v-model="endTimeInput"
            type="datetime-local"
            class="form-control form-control-sm"
            style="width: 210px"
            :step="60"
          />
        </div>
        <button
          type="button"
          class="btn btn-primary btn-sm shadow-sm"
          :disabled="loadingMetrics || !selectedDashboard"
          @click="handleFetch"
        >
          <span
            v-if="loadingMetrics"
            class="spinner-border spinner-border-sm me-1"
            role="status"
          ></span>
          <i v-else class="bi bi-arrow-clockwise me-1"></i>
          {{
            loadingMetrics
              ? $t('dashboard.metrics.fetch.loading')
              : $t('dashboard.metrics.fetch.initial')
          }}
        </button>
      </div>
    </div>

    <!-- Chart or Empty State -->
    <div v-if="!hasData" class="chart-empty">
      <div class="empty-icon mx-auto mb-3">
        <i class="bi bi-graph-up"></i>
      </div>
      <h5 class="text-muted fw-semibold mb-1">{{ $t('dashboard.metrics.noData.title') }}</h5>
      <p class="text-muted small mb-0">
        {{ $t('dashboard.metrics.noData.text') }}
      </p>
    </div>
    <div v-else class="chart-container">
      <v-chart class="chart" :option="option" autoresize />
    </div>
  </div>
</template>

<style scoped>
.chart-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.chart-header {
  border-bottom: 1px solid #f1f3f5;
  margin-bottom: 0;
  flex-shrink: 0;
}

.chart-container {
  flex-grow: 1;
  width: 100%;
  position: relative;
  min-height: 500px;
}

.chart {
  position: absolute;
  top: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;
}

.chart-empty {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(78, 115, 223, 0.1) 0%, rgba(34, 74, 190, 0.1) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  color: #4e73df;
}
</style>
