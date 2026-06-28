import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { api } from '@/services/api'
import type { UserView } from '@/types/api'
import { formatError } from '@/utils/format'

export const useUsersStore = defineStore('users', () => {
  const users = ref<UserView[]>([])
  const loading = shallowRef(false)
  const error = shallowRef<string | null>(null)

  function getUserById(id: number): UserView | undefined {
    return users.value.find((u) => u.id === id)
  }

  async function fetchUsers() {
    loading.value = true
    error.value = null

    try {
      users.value = await api.getUsers()
    } catch (e) {
      error.value = formatError(e as Error, 'Failed to fetch users')
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    getUserById,
    fetchUsers,
  }
})
