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
