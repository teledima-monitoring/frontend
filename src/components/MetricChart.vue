<script setup lang="ts">
import { computed } from 'vue'
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

interface DataPoint {
  time: number
  value: number
}

interface SeriesData {
  name: string
  data: DataPoint[]
}

const props = defineProps<{
  series: SeriesData[]
}>()

const option = computed(() => {
  if (props.series.length === 0) {
    return {
      title: { text: 'No data available', left: 'center' },
    }
  }

  const allTimes = props.series.flatMap((s) => s.data.map((d) => d.time))
  const minTime = Math.min(...allTimes)
  const maxTime = Math.max(...allTimes)

  return {
    title: {
      text: 'Metrics',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { type: 'cross' as const },
      formatter: (params: CallbackDataParams[] | undefined) => {
        if (!params || !Array.isArray(params)) return ''
        // const date = new Date(Number(params[0].axisValue)).toLocaleString();
        // let result = `<strong>${date}</strong><br/>`;
        let result = ''
        params.forEach((p: CallbackDataParams) => {
          //force cast p.value to int
          if (Array.isArray(p.value) && p.value.length >= 2) {
            result += `${p.marker} ${p.seriesName}: <strong>${Number(p.value[1])?.toFixed(2)}</strong><br/>`
          }
        })
        return result
      },
    },
    legend: {
      data: props.series.map((s) => s.name),
      top: 30,
    },
    grid: {
      left: 60,
      right: 30,
      top: 70,
      bottom: 50,
    },
    xAxis: {
      type: 'time' as const,
      min: minTime,
      max: maxTime,
    },
    yAxis: {
      type: 'value' as const,
    },
    series: props.series.map((s) => ({
      name: s.name,
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: s.data.map((d) => [d.time, d.value]),
    })),
  }
})
</script>

<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<style scoped>
.chart {
  width: 100%;
  height: 400px;
}
</style>
