<script setup lang="ts">
import { shallowRef } from 'vue'

const toasts = shallowRef<Array<string>>([])

function remove(idx: number) {
  toasts.value = toasts.value.filter((_, i) => i != idx)
}

defineExpose({
  show: (text: string) => {
    const len = toasts.value.push(text)

    // Автоматически скрываем уведомление через 4 секунды
    setTimeout(() => {
      remove(len - 1)
    }, 4000)
  },
})
</script>

<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1080">
    <transition-group name="toast-fade">
      <div
        v-for="(toast, index) in toasts"
        :key="index"
        class="toast show custom-toast mb-2"
        role="alert"
      >
        <div class="toast-body d-flex align-items-center">
          <div class="toast-icon me-3">
            <i class="bi bi-bell-fill"></i>
          </div>
          <div class="flex-grow-1">
            <div class="fw-semibold small text-danger mb-1">{{ $t('newNotification') }}</div>
            <div class="text-dark">{{ toast }}</div>
          </div>
          <button
            type="button"
            class="btn-close ms-2"
            aria-label="Close"
            @click="remove(index)"
          ></button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.custom-toast {
  background: #fff;
  border: none;
  border-radius: 12px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.1),
    0 1px 4px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #dc3545;
  overflow: hidden;
  min-width: 320px;
  max-width: 400px;
  backdrop-filter: blur(10px);
}

.custom-toast .toast-body {
  padding: 1rem 1.25rem;
  font-size: 0.9rem;
}

.toast-icon {
  width: 36px;
  height: 36px;
  background: rgba(220, 53, 59, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: #dc3545;
  flex-shrink: 0;
}

/* Анимация появления и исчезновения тостов (адаптирована для нижнего правого угла) */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translateY(20px) translateX(20px) scale(0.95);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) translateX(20px) scale(0.95);
}

.toast-fade-move {
  transition: transform 0.3s ease;
}
</style>
