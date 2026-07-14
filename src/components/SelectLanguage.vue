<script setup lang="ts">
const props = defineProps<{
  locale: string
}>()
const emit = defineEmits<{
  changed: [newLocale: string]
}>()
</script>

<template>
  <div class="dropdown">
    <button
      class="btn btn-outline-light btn-sm dropdown-toggle d-flex align-items-center"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      <i class="bi bi-translate me-1"></i>
      {{ props.locale }}
    </button>
    <ul class="dropdown-menu dropdown-menu-end shadow-sm">
      <li>
        <a
          class="dropdown-item d-flex align-items-center"
          href="#"
          @click.prevent="emit('changed', 'en')"
        >
          <span class="me-2">🇬🇧</span>English
        </a>
      </li>
      <li>
        <a
          class="dropdown-item d-flex align-items-center"
          href="#"
          @click.prevent="emit('changed', 'ru')"
        >
          <span class="me-2">🇷🇺</span>Русский
        </a>
      </li>
    </ul>
  </div>
</template>
