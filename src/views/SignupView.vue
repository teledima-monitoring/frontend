<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const router = useRouter()
const authStore = useAuthStore()
const { loading, error } = storeToRefs(authStore)

// Поля формы
const firstName = ref('')
const secondName = ref('')
const thirdName = ref('')
const email = ref('')
const jobTitle = ref('') // Инициализируем пустой строкой для корректной работы placeholder в select

const login = ref('')
const password = ref('')

async function handleSignup() {
  // Проверка обязательных полей (добавили position.value)
  if (
    !firstName.value ||
    !secondName.value ||
    !email.value ||
    !login.value ||
    !password.value ||
    !jobTitle.value
  ) {
    return
  }

  await authStore.signup({
    firstName: firstName.value,
    secondName: secondName.value,
    thirdName: thirdName.value || undefined,
    email: email.value,
    login: login.value,
    password: password.value,
    jobTitle: jobTitle.value,
  })

  await router.push('/')
}
</script>

<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <!-- Header -->
      <div class="text-center mb-4">
        <h3 class="fw-bold mb-1">{{ $t('signup.title') }}</h3>
        <p class="text-muted small mb-0">{{ $t('signup.description') }}</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSignup">
        <!-- Имя -->
        <div class="mb-3">
          <label for="signup-first-name" class="form-label small fw-semibold">
            {{ $t('signup.firstName.title') }} <span class="text-danger">*</span>
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
              :placeholder="$t('signup.firstName.placeholder')"
              autocomplete="given-name"
              required
            />
          </div>
        </div>

        <!-- Фамилия -->
        <div class="mb-3">
          <label for="signup-last-name" class="form-label small fw-semibold">
            {{ $t('signup.secondName.title') }} <span class="text-danger">*</span>
          </label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0">
              <i class="bi bi-person-lines-fill text-muted"></i>
            </span>
            <input
              id="signup-last-name"
              v-model="secondName"
              type="text"
              class="form-control bg-light border-start-0"
              :placeholder="$t('signup.secondName.placeholder')"
              autocomplete="family-name"
              required
            />
          </div>
        </div>

        <!-- Отчество -->
        <div class="mb-3">
          <label for="signup-middle-name" class="form-label small fw-semibold">
            {{ $t('signup.thirdName.title') }}
            <span class="text-muted small fw-normal">({{ $t('signup.thirdName.optional') }})</span>
          </label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0">
              <i class="bi bi-person-vcard text-muted"></i>
            </span>
            <input
              id="signup-middle-name"
              v-model="thirdName"
              type="text"
              class="form-control bg-light border-start-0"
              :placeholder="$t('signup.thirdName.placeholder')"
              autocomplete="additional-name"
            />
          </div>
        </div>

        <!-- Электронная почта -->
        <div class="mb-3">
          <label for="signup-email" class="form-label small fw-semibold">
            {{ $t('signup.email') }} <span class="text-danger">*</span>
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

        <div class="mb-3">
          <label for="signup-position" class="form-label small fw-semibold">
            {{ $t('signup.job.title') }} <span class="text-danger">*</span>
          </label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0">
              <i class="bi bi-briefcase text-muted"></i>
            </span>
            <select
              id="signup-position"
              v-model="jobTitle"
              class="form-select bg-light border-start-0"
              required
            >
              <option value="" disabled>{{ $t('signup.job.default') }}</option>
              <option value="Разработчик">{{ $t('signup.job.engineer') }}</option>
              <option value="Аналитик">{{ $t('signup.job.analytic') }}</option>
              <option value="Тестировщик">{{ $t('signup.job.qa') }}</option>
              <option value="Дизайнер">{{ $t('signup.job.designer') }}</option>
            </select>
          </div>
        </div>

        <hr class="my-4 border-dashed" />

        <!-- Username -->
        <div class="mb-3">
          <label for="signup-login" class="form-label small fw-semibold">
            {{ $t('signup.username.title') }} <span class="text-danger">*</span>
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
              :placeholder="$t('signup.username.placeholder')"
              autocomplete="username"
              required
            />
          </div>
        </div>

        <!-- Password -->
        <div class="mb-4">
          <label for="signup-password" class="form-label small fw-semibold">
            {{ $t('signup.password.title') }} <span class="text-danger">*</span>
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
              :placeholder="$t('signup.password.placeholder')"
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
          {{ loading ? $t('signup.signupProccess') : $t('signup.signup') }}
        </button>
      </form>

      <!-- Footer -->
      <div class="text-center mt-4 pt-4 border-top">
        <p class="text-muted small mb-0">
          {{ $t('signup.alreadyHave') }}
          <router-link to="/login" class="fw-semibold text-decoration-none text-primary">
            {{ $t('signup.login') }}
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
