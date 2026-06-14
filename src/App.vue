<template>
  <AppLayout />
</template>

<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
import { watch } from 'vue'
import { useSSEStore } from '@/stores/sse'
import { useAuthStore } from './stores/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const sseStore = useSSEStore()
const { connect, disconnect } = sseStore

const { connected } = storeToRefs(sseStore)
const { isLoggedIn } = storeToRefs(authStore)

// Следим за состоянием авторизации
watch(
  isLoggedIn,
  (isLoggedIn) => {
    if (isLoggedIn && !connected.value) {
      connect()
    } else if (!isLoggedIn && connected.value) {
      disconnect()
    }
  },
  { immediate: true },
)
</script>

<style></style>
