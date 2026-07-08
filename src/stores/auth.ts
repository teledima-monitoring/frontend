import { defineStore } from 'pinia'
import { ref, shallowRef, computed } from 'vue'
import { api } from '@/services/api'
import { UserRole, type LoginRequest, type MeResponse, type SignUpRequest } from '@/types/auth'
import { formatError } from '@/utils/format'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<MeResponse>({
    id: 0,
    login: '',
    firstName: '',
    secondName: '',
    thirdName: '',
    email: '',
    jobTitle: '',
    role: UserRole.Guest,
  })
  const loading = shallowRef(false)
  const error = shallowRef<string | null>(null)

  const isLoggedIn = computed(() => user.value?.role != UserRole.Guest)

  async function login(data: LoginRequest) {
    loading.value = true
    error.value = null

    try {
      await api.login(data)
      await fetchMe()
    } catch (e) {
      error.value = formatError(e as Error, 'Login failed')

      throw e
    } finally {
      loading.value = false
    }
  }

  async function signup(data: SignUpRequest) {
    loading.value = true
    error.value = null

    try {
      await api.signup(data)
    } catch (e) {
      error.value = formatError(e as Error, 'Signup failed')

      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    user.value = await api.me()
  }

  async function logout() {
    await api.logout()

    user.value.id = 0
    user.value.login = ''
    user.value.role = UserRole.Guest
  }

  return {
    user,
    loading,
    error,
    isLoggedIn,
    login,
    signup,
    fetchMe,
    logout,
  }
})
