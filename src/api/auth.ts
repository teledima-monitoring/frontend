import type { LoginRequest, MeResponse, SignUpRequest, UserView } from '@/types/auth'
import { request } from '@/api/core'

export default {
  login: async (data: LoginRequest) =>
    request<string>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  signup: async (data: SignUpRequest) =>
    request<string>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  me: async () => request<MeResponse>('/auth/me'),
  logout: async () => request<void>('/auth/logout', { method: 'POST' }),
  getUsers: async () => request<UserView[]>('/auth/users'),
}
