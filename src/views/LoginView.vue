<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { loading, error } = storeToRefs(authStore)

const login = ref('')
const password = ref('')

async function handleLogin() {
  if (!login.value || !password.value) return
  await authStore.login({ login: login.value, password: password.value })
  const redirect = (route.query.redirect as string) ?? '/'
  await router.push(redirect)
}
</script>

<template>
  <div
    class="d-flex align-items-center justify-content-center"
    style="min-height: 100vh; background-color: #f5f5f5"
  >
    <div class="card shadow-sm" style="width: 360px">
      <div class="card-body">
        <h4 class="card-title text-center mb-4">Login</h4>

        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="login" class="form-label">Username</label>
            <input
              id="login"
              v-model="login"
              type="text"
              class="form-control"
              placeholder="Enter username"
            />
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-control"
              placeholder="Enter password"
            />
          </div>

          <div v-if="error" class="alert alert-danger py-2 small mb-3">{{ error }}</div>

          <button type="submit" class="btn btn-primary w-100 mb-3" :disabled="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>

          <div class="text-center small">
            Don't have an account?
            <router-link to="/signup">Sign up</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
