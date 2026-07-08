export enum Constraint {
  Less = 1,
  LessEqual = 2,
  Equal = 3,
  Greater = 4,
  GreaterEqual = 5,
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
