export enum TaskStatus {
  Open = 1,
  InProgress = 2,
  Closed = 3,
}

export enum TaskPriority {
  Low = 1,
  Medium = 2,
  High = 3,
}

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
