import type {
  LoginRequest,
  MeResponse,
  MetricsRequest,
  SignUpRequest,
  MetricsResponse,
  AlertConfigView,
  AlertConfigCreate,
  DashboardCreate,
  DashboardView,
  DashboardUpdate,
  IncidentView,
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

  return response.text() as Promise<T>
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
    request<MetricsResponse>('/metrics', { method: 'POST', body: JSON.stringify(data)}),

  // Alerts
  getAlerts: () => request<Array<AlertConfigView>>('/alerts'),

  createAlert: (data: AlertConfigCreate) =>
    request<void>('/alerts', { method: 'POST', body: JSON.stringify(data) }),

  deleteAlert: (id: number) => request<void>(`/alerts/${id}`, { method: 'DELETE' }),

  // Dashboards
  getDashboards: () => request<Array<DashboardView>>('/dashboards'),

  createDashboard: (data: DashboardCreate) =>
    request<void>('/dashboards', { method: 'POST', body: JSON.stringify(data) }),

  updateDashboard: (id: number, data: DashboardUpdate) =>
    request<void>(`/dashboards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteDashboard: (id: number) => request<void>(`/dashboards/${id}`, { method: 'DELETE' }),

  // Incidents
  getIncidents: () => request<Array<IncidentView>>('/incidents'),
  
  // SSE for incidents
  listenIncidents: (): EventSource => new EventSource(`${BASE_URL}/incidents/listen`),

  // Export incidents to CSV
  exportIncidentsCSV: async (): Promise<void> => {
    const response = await fetch(`${BASE_URL}/incidents/export`, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`)
    }

    // Получаем blob с CSV данными
    const blob = await response.blob()

    // Извлекаем имя файла из заголовка Content-Disposition
    let filename = `incidents_${new Date().toISOString().split('T')[0]}.csv`
    const contentDisposition = response.headers.get('Content-Disposition')
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename=([^;]+)/)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].trim()
      }
    }

    // Создаем ссылку для скачивания
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()

    // Очистка
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  },
}
