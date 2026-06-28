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

export enum TaskStatus {
  Open = 1,
  InProgress = 2,
  Closed = 3,
}

export enum SSESource {
  Incident = 1,
  Task = 2,
}

export enum TaskPriority {
  High = 1,
  Medium = 2,
  Low = 3,
}

// --- Auth Types ---
export interface LoginRequest {
  login: string
  password: string
}

export interface SignUpRequest {
  login: string
  password: string
  firstName: string
  secondName: string
  thirdName?: string
  email: string
}

export interface MeResponse {
  id: number
  login: string
  role: UserRole
}

export interface UserView {
  id: number
  login: string
  role: UserRole
}

// --- Metrics Types ---
export interface Metric {
  collectorId: string
  dt: string
  name: string
  value: number
}

export interface SSEEvent {
  id: number
  source: SSESource
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

// --- Alerts Types ---
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

export interface AlertConfigView {
  id: number
  name: string
  collectorKind: string
  dataPeriod: number
  filters: Record<string, string>
  rules: AlertRule[]
  subscribers: number[]
}

export interface AlertConfigUpdate {
  name?: string
  collectorKind?: string
  dataPeriod?: number
  filters?: Record<string, string>
  rules?: AlertRule[]
  subscribers?: number[]
}

// --- Dashboards Types ---
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

// --- Incidents Types ---
export interface IncidentView {
  id: number
  key: string
  fired: boolean
  alertId: number
  alertName: string
  taskId?: number
  taskKey?: string
  createDt: Date
  updateDt: Date
}

export interface IncidentSetTask {
  task_id: number
}

// --- Tasks Types ---
export interface TaskCreate {
  assigneeId: number
  authorId: number
  description: string
  incidentId: number
  name: string
  priority: TaskPriority
  estimate?: string
}

export interface TaskUpdate {
  assigneeId?: number
  description?: string
  name?: string
  status?: TaskStatus
  priority?: TaskPriority
  estimate?: string
}

export interface TaskView {
  id: number
  key: string
  name: string
  description: string
  status: TaskStatus
  assigneeId: number
  authorId: number
  incidentsId: Array<number>
  createDt: Date
  updateDt: Date
  priority: TaskPriority
  estimate?: string
}

// Notifications
export interface NotificationView {
  id: number
  text: string
  readed: boolean
  dt: Date
}
