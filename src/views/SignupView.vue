<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const router = useRouter()
const authStore = useAuthStore()
const { loading, error } = storeToRefs(authStore)

// Новые поля
const firstName = ref('')
const lastName = ref('')
const middleName = ref('')
const email = ref('')

// Существующие поля
const login = ref('')
const password = ref('')

async function handleSignup() {
  // Проверка обязательных полей
  if (!firstName.value || !lastName.value || !email.value || !login.value || !password.value) {
    return
  }
  
  await authStore.signup({
    firstName: firstName.value,
    lastName: lastName.value,
    middleName: middleName.value || undefined, // Отправляем undefined, если поле пустое
    email: email.value,
    login: login.value,
    password: password.value
  })
  
  await router.push('/')
}
</script>

<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <!-- Header -->
      <div class="text-center mb-4">
        <h3 class="fw-bold mb-1">Создание аккаунта</h3>
        <p class="text-muted small mb-0">Заполните данные для регистрации в системе.</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSignup">
        
        <!-- Фамилия -->
        <div class="mb-3">
          <label for="signup-last-name" class="form-label small fw-semibold">
            Фамилия <span class="text-danger">*</span>
          </label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0">
              <i class="bi bi-person-lines-fill text-muted"></i>
            </span>
            <input
              id="signup-last-name"
              v-model="lastName"
              type="text"
              class="form-control bg-light border-start-0"
              placeholder="Введите фамилию"
              autocomplete="family-name"
              required
            />
          </div>
        </div>

        <!-- Имя -->
        <div class="mb-3">
          <label for="signup-first-name" class="form-label small fw-semibold">
            Имя <span class="text-danger">*</span>
          </label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0">
              <i class="bi bi-person text-muted"></i>
            </span>
            <input
              id="signup-first-name"
              v-model="firstName"
              type="text"
              class="form-control bg-light border-start-0"
              placeholder="Введите имя"
              autocomplete="given-name"
              required
            />
          </div>
        </div>

        <!-- Отчество -->
        <div class="mb-3">
          <label for="signup-middle-name" class="form-label small fw-semibold">
            Отчество <span class="text-muted small fw-normal">(если есть)</span>
          </label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0">
              <i class="bi bi-person-vcard text-muted"></i>
            </span>
            <input
              id="signup-middle-name"
              v-model="middleName"
              type="text"
              class="form-control bg-light border-start-0"
              placeholder="Введите отчество"
              autocomplete="additional-name"
            />
          </div>
        </div>

        <!-- Электронная почта -->
        <div class="mb-3">
          <label for="signup-email" class="form-label small fw-semibold">
            Электронная почта <span class="text-danger">*</span>
          </label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0">
              <i class="bi bi-envelope text-muted"></i>
            </span>
            <input
              id="signup-email"
              v-model="email"
              type="email"
              class="form-control bg-light border-start-0"
              placeholder="example@mail.com"
              autocomplete="email"
              required
            />
          </div>
        </div>

        <hr class="my-4 border-dashed" />

        <!-- Username -->
        <div class="mb-3">
          <label for="signup-login" class="form-label small fw-semibold">
            Имя пользователя <span class="text-danger">*</span>
          </label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0">
              <i class="bi bi-person-circle text-muted"></i>
            </span>
            <input
              id="signup-login"
              v-model="login"
              type="text"
              class="form-control bg-light border-start-0"
              placeholder="Придумайте логин"
              autocomplete="username"
              required
            />
          </div>
        </div>

        <!-- Password -->
        <div class="mb-4">
          <label for="signup-password" class="form-label small fw-semibold">
            Пароль <span class="text-danger">*</span>
          </label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0">
              <i class="bi bi-lock text-muted"></i>
            </span>
            <input
              id="signup-password"
              v-model="password"
              type="password"
              class="form-control bg-light border-start-0"
              placeholder="Придумайте пароль"
              autocomplete="new-password"
              required
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
          class="btn btn-success w-100 py-2 fw-semibold shadow-sm auth-btn"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
          {{ loading ? 'Создание аккаунта...' : 'Зарегистрироваться' }}
        </button>
      </form>

      <!-- Footer -->
      <div class="text-center mt-4 pt-4 border-top">
        <p class="text-muted small mb-0">
          Уже есть аккаунт?
          <router-link to="/login" class="fw-semibold text-decoration-none text-primary">
            Войти
          </router-link>
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
  max-width: 460px; /* Чуть увеличим ширину для большего кол-ва полей */
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
  box-shadow: 0 4px 12px rgba(var(--bs-success-rgb), 0.25);
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
  box-shadow: 0 0 0 0.25rem rgba(var(--bs-success-rgb), 0.15);
  border-radius: 0.375rem;
}
.input-group:focus-within .input-group-text {
  border-color: var(--bs-success);
  background-color: #fff !important;
}
.input-group:focus-within .form-control {
  border-color: var(--bs-success);
}

/* Разделитель */
.border-dashed {
  border-top: 1px dashed #dee2e6 !important;
}
</style>
