export type DashboardGroupBy = 'none' | 'collector' | string

export interface DashboardView {
  id: number
  name: string
  collectorKind: string
  metricName: string
  filters: Record<string, string>
  groupBy: DashboardGroupBy
}

export type DashboardCreate = Omit<DashboardView, 'id'>
export type DashboardUpdate = Partial<DashboardCreate>
