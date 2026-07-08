export interface Metric {
  collectorId: string
  dt: string
  name: string
  value: number
}

export interface Collector {
  id: number
  labels: Record<string, string>
  name: string
}

export interface MetricsRequest {
  start: string
  end: string
  kind: string
  metricName: string
  filters?: Record<string, string>
}

export interface MetricsResponse {
  collectors: Collector[]
  metrics: Metric[]
}
