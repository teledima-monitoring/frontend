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
  <div class="auth-wrapper">
    <div class="auth-card">
      <!-- Header -->
      <div class="text-center mb-4">
        <h3 class="fw-bold mb-1">{{ $t('login.title') }}</h3>
        <p class="text-muted small mb-0">{{ $t('login.description') }}</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin">
        <!-- Username -->
        <div class="mb-3">
          <label for="login" class="form-label small fw-semibold">{{
            $t('login.username.title')
          }}</label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0">
              <i class="bi bi-person text-muted"></i>
            </span>
            <input
              id="login"
              v-model="login"
              type="text"
              class="form-control bg-light border-start-0"
              :placeholder="$t('login.username.placeholder')"
              autocomplete="username"
            />
          </div>
        </div>

        <!-- Password -->
        <div class="mb-4">
          <label for="password" class="form-label small fw-semibold">{{
            $t('login.password.title')
          }}</label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0">
              <i class="bi bi-lock text-muted"></i>
            </span>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-control bg-light border-start-0"
              :placeholder="$t('login.password.placeholder')"
              autocomplete="current-password"
            />
          </div>
        </div>

        <!-- Error Alert -->
        <div
          v-if="error"
          class="alert alert-danger d-flex align-items-center py-2 small mb-3 border-0 shadow-sm"
        >
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          <span>{{ error }}</span>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="btn btn-primary w-100 py-2 fw-semibold shadow-sm auth-btn"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
          {{ loading ? $t('login.signinProcess') : $t('login.signin') }}
        </button>
      </form>

      <!-- Footer -->
      <div class="text-center mt-4 pt-4 border-top">
        <p class="text-muted small mb-0">
          {{ $t('login.dontHave') }}
          <router-link to="/signup" class="fw-semibold text-decoration-none text-primary">{{
            $t('login.signup')
          }}</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  padding: 1rem;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.05),
    0 1px 4px rgba(0, 0, 0, 0.02);
  padding: 2.5rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.auth-btn {
  transition: all 0.2s ease;
}
.auth-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--bs-primary-rgb), 0.25);
}

/* Input group focus styling */
.input-group .form-control {
  border-left: 0;
}
.input-group .form-control:focus {
  border-color: #ced4da;
  box-shadow: none;
  background-color: #fff !important;
}
.input-group:focus-within {
  box-shadow: 0 0 0 0.25rem rgba(var(--bs-primary-rgb), 0.15);
  border-radius: 0.375rem;
}
.input-group:focus-within .input-group-text {
  border-color: var(--bs-primary);
  background-color: #fff !important;
}
.input-group:focus-within .form-control {
  border-color: var(--bs-primary);
}
</style>
