<template>
  <AppLayout />
</template>

<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
import { watch } from 'vue'
import { useIncidentsStore } from '@/stores/incident'
import { useAuthStore } from './stores/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const incidentsStore = useIncidentsStore()
const { connect, disconnect } = incidentsStore

const { connected } = storeToRefs(incidentsStore)
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
