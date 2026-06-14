<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const router = useRouter()
const authStore = useAuthStore()
const { loading, error } = storeToRefs(authStore)

const login = ref('')
const password = ref('')

async function handleSignup() {
  if (!login.value || !password.value) return
  await authStore.signup({ login: login.value, password: password.value })
  await router.push('/')
}
</script>

<template>
  <div
    class="d-flex align-items-center justify-content-center"
    style="min-height: 100vh; background-color: #f5f5f5"
  >
    <div class="card shadow-sm" style="width: 360px">
      <div class="card-body">
        <h4 class="card-title text-center mb-4">Sign Up</h4>

        <form @submit.prevent="handleSignup">
          <div class="mb-3">
            <label for="signup-login" class="form-label">Username</label>
            <input
              id="signup-login"
              v-model="login"
              type="text"
              class="form-control"
              placeholder="Choose username"
            />
          </div>

          <div class="mb-3">
            <label for="signup-password" class="form-label">Password</label>
            <input
              id="signup-password"
              v-model="password"
              type="password"
              class="form-control"
              placeholder="Choose password"
            />
          </div>

          <div v-if="error" class="alert alert-danger py-2 small mb-3">{{ error }}</div>

          <button type="submit" class="btn btn-success w-100 mb-3" :disabled="loading">
            {{ loading ? 'Creating account...' : 'Sign Up' }}
          </button>

          <div class="text-center small">
            Already have an account?
            <router-link to="/login">Login</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
