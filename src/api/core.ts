export const BASE_URL = 'http://localhost:1325/api'

export class APIError extends Error {
  public readonly name = 'APIError'
  public readonly code: number
  public readonly responseBody: any

  constructor(code: number, responseBody: string | JSON, options?: ErrorOptions) {
    super(`API error ${code}: ${responseBody}`, options)

    this.code = code
    this.responseBody = responseBody
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  })

  if (!response.ok) {
    let errorBody

    try {
      errorBody = await response.json()
    } catch {
      errorBody = await response.text()
    }

    throw new APIError(response.status, errorBody)
  }

  // For responses with no body (e.g., logout returning plain text or empty)
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return <Promise<T>>response.json()
  }
  return <Promise<T>>response.text()
}

export abstract class SSEClient {
  private readonly eventSource: EventSource
  constructor(path: string) {
    this.eventSource = new EventSource(`${BASE_URL}${path}`)
  }

  abstract onmessage(): void
  abstract onopen(): void
  abstract onerror(): void

  connect(): void {
    if (
      ([EventSource.OPEN, EventSource.CONNECTING] as Array<number>).includes(
        this.eventSource.readyState,
      )
    ) {
      return
    }
    this.eventSource.onmessage = this.onmessage
    this.eventSource.onopen = this.onopen
    this.eventSource.onerror = this.onerror
  }

  disconnect(): void {
    this.eventSource.close()
    console.log('SSE connection closed')
  }
}
