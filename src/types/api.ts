export enum UserRole {
  Guest = 0,
  Owner = 1,
  Customer = 2,
}

export enum Constraint {
  Less = 1,
  LessEqual = 2,
  Equal = 3,
  Greater = 4,
  GreaterEqual = 5,
}

export interface LoginRequest {
  login: string
  password: string
}

export interface SignUpRequest {
  login: string
  password: string
}

export interface MeResponse {
  login: string
  role: UserRole
}

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
  filters?: Record<string, string>
}

export interface MetricsResponse {
  collectors: Collector[]
  metrics: Metric[]
}

export interface AlertRule {
  field: string
  constraint: Constraint
  value: number
}

export interface AlertConfigCreate {
  name: string
  collectorKind: string
  dataPeriod: number
  filters: Record<string, string>
  rules: AlertRule[]
}

export interface AlertConfigView extends AlertConfigCreate {
  id: number
  fired: boolean
  lastAlertRunDt: string
}

export interface AlertRun {
  alertId: number
  fired: boolean
}

export type DashboardGroupBy = 'none' | 'collector' | string

export interface UserDashboard {
  id: number
  name: string
  collectorKind: string
  metricName: string
  filters: Record<string, string>
  groupBy: DashboardGroupBy
}

export type UserDashboardCreate = Omit<UserDashboard, 'id'>
export type UserDashboardUpdate = Partial<UserDashboardCreate>

export interface Incident {
  id: number
  timestamp: string
  alertId: number
  fired: boolean
}

export interface AlertEvent {
  alertId: number
  fired: boolean
}
