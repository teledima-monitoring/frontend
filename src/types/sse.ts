export enum SSESource {
  Incident = 1,
  Task = 2,
}

export interface SSEEvent {
  id: number
  source: SSESource
}
