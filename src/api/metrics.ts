import type { MetricsRequest, MetricsResponse } from '@/types/metrics'
import { request } from '@/api/core'

export default {
  getMetrics: async (data: MetricsRequest) =>
    request<MetricsResponse>('/metrics', { method: 'POST', body: JSON.stringify(data) }),
}
