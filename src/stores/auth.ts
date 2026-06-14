import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'
import { UserRole, type LoginRequest, type SignUpRequest } from '@/types/api'

export const useAuthStore = defineStore('auth', () => {
  const username = ref('')
  const role = ref(UserRole.Guest)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isLoggedIn = computed(() => role.value != UserRole.Guest)

  async function login(data: LoginRequest) {
    loading.value = true
    error.value = null
    try {
      await api.login(data)
      await fetchMe()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Login failed'
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
      error.value = e instanceof Error ? e.message : 'Signup failed'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    try {
      const me = await api.me()
      username.value = me.login
      role.value = me.role
    } catch {
      username.value = ''
      role.value = UserRole.Guest
    }
  }

  async function logout() {
    try {
      await api.logout()
    } finally {
      username.value = ''
      role.value = UserRole.Guest
    }
  }

  return {
    username,
    role,
    loading,
    error,
    isLoggedIn,
    login,
    signup,
    fetchMe,
    logout,
  }
})
