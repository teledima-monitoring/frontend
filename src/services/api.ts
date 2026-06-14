import type {
  LoginRequest,
  MeResponse,
  MetricsRequest,
  SignUpRequest,
  MetricsResponse,
  AlertConfigView,
  AlertConfigCreate,
  UserDashboardCreate,
  UserDashboard,
  UserDashboardUpdate,
} from '@/types/api'

const BASE_URL = 'http://localhost:1325/api'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`API error ${response.status}: ${errorBody}`)
  }

  // For responses with no body (e.g., logout returning plain text or empty)
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>
  }

  return response.text() as unknown as Promise<T>
}

export const api = {
  // Auth
  login: (data: LoginRequest) =>
    request<string>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  signup: (data: SignUpRequest) =>
    request<string>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

  me: () => request<MeResponse>('/auth/me'),

  logout: () => request<void>('/auth/logout', { method: 'POST' }),

  // Metrics
  getMetrics: (data: MetricsRequest) =>
    request<MetricsResponse>('/metrics', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Alerts
  getAlerts: () => request<Array<AlertConfigView>>('/alerts'),

  createAlert: (data: AlertConfigCreate) =>
    request<unknown>('/alerts', { method: 'POST', body: JSON.stringify(data) }),

  deleteAlert: (id: number) => request<void>(`/alerts/${id}`, { method: 'DELETE' }),

  toggleAlert: (id: number, fired: boolean) =>
    request<unknown>(`/alerts/${id}/toggle`, { method: 'POST', body: JSON.stringify({ fired }) }),

  // SSE for alerts
  listenAlerts: (): EventSource => new EventSource(`${BASE_URL}/alerts/listen`),

  // Dashboards
  getDashboards: () => request<Array<UserDashboard>>('/dashboards'),

  createDashboard: (data: UserDashboardCreate) =>
    request<UserDashboard>('/dashboards', { method: 'POST', body: JSON.stringify(data) }),

  updateDashboard: (id: number, data: UserDashboardUpdate) =>
    request<unknown>(`/dashboards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteDashboard: (id: number) => request<void>(`/dashboards/${id}`, { method: 'DELETE' }),
}
