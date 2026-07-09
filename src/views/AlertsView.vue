<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAlertsStore } from '@/stores/alerts'
import { useAuthStore } from '@/stores/auth' // Импортируем auth store
import { storeToRefs } from 'pinia'
import AlertForm from '@/components/AlertForm.vue'
import type { AlertConfigView } from '@/types/alert'

const alertsStore = useAlertsStore()
const authStore = useAuthStore() // Получаем auth store

const { alerts, loading, error } = storeToRefs(alertsStore)
const { user } = storeToRefs(authStore) // Получаем данные текущего пользователя

const { fetchAlerts, deleteAlert, createAlert, updateAlert, getConstraintName } = alertsStore

const editingAlert = ref<AlertConfigView | null>(null)

onMounted(fetchAlerts)

// Проверка, подписан ли текущий пользователь на алерт
function isSubscribed(alert: AlertConfigView): boolean {
  if (!user.value) return false
  return (alert.subscribers || []).includes(user.value.id)
}

// Переключение подписки (добавить/удалить себя из subscribers)
async function toggleSubscribe(alert: AlertConfigView) {
  if (!user.value) return

  const currentSubs = alert.subscribers || []
  let newSubs: number[]

  if (isSubscribed(alert)) {
    // Если уже подписан - удаляем себя
    newSubs = currentSubs.filter((id) => id !== user.value!.id)
  } else {
    // Если не подписан - добавляем себя
    newSubs = [...currentSubs, user.value.id]
  }

  // Вызываем обновление алерта, передавая только новый массив подписчиков
  await updateAlert(alert.id, { subscribers: newSubs })
}

async function handleSubmit(data: any) {
  if (data.id) {
    await updateAlert(data.id, data)
  } else {
    await createAlert(data)
  }
  editingAlert.value = null
}

function startEdit(alert: AlertConfigView) {
  editingAlert.value = alert
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  editingAlert.value = null
}
</script>

<template>
  <div class="container-fluid py-4">
    <!-- Page Header -->
    <div class="mb-4">
      <h3 class="fw-bold mb-1">
        <i class="bi bi-bell-fill me-2 text-warning"></i>{{ $t('alert.title') }}
      </h3>
      <p class="text-muted mb-0">{{ $t('alert.description') }}</p>
    </div>

    <!-- Create / Edit Alert Form -->
    <div class="card border-0 shadow-sm mb-4 form-card">
      <div
        class="card-header bg-light border-0 py-3 d-flex justify-content-between align-items-center"
      >
        <h6 class="mb-0 fw-bold">
          <i
            :class="
              editingAlert
                ? 'bi bi-pencil-square me-2 text-warning'
                : 'bi bi-plus-circle me-2 text-primary'
            "
          ></i>
          <template v-if="editingAlert">
            {{ $t('alert.edit') }} : {{ editingAlert.name }}
          </template>
          <template v-else>
            {{ $t('alert.create') }}
          </template>
        </h6>
        <button v-if="editingAlert" class="btn btn-sm btn-outline-secondary" @click="cancelEdit">
          <i class="bi bi-x-lg me-1"></i> {{ $t('cancel') }}
        </button>
      </div>
      <div class="card-body p-4">
        <AlertForm
          :key="editingAlert?.id || 'new'"
          :initial-data="editingAlert || undefined"
          :get-constraint-name="getConstraintName"
          @submit="handleSubmit"
          @cancel="cancelEdit"
        />
      </div>
    </div>

    <div v-if="error" class="alert alert-danger d-flex align-items-center shadow-sm">
      <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ error }}
    </div>

    <!-- Alerts Table -->
    <div class="card border-0 shadow-sm table-card">
      <div
        class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center"
      >
        <h6 class="mb-0 fw-bold">
          <i class="bi bi-list-ul me-2 text-primary"></i>{{ $t('alert.configurations.title') }}
          <span class="badge bg-primary bg-opacity-10 text-primary ms-2">{{ alerts.length }}</span>
        </h6>
      </div>
      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
        </div>

        <div v-else-if="alerts.length === 0" class="text-center py-5">
          <i class="bi bi-bell-slash display-1 text-muted d-block mb-3"></i>
          <h5 class="text-muted">{{ $t('alert.noConfigurations.title') }}</h5>
          <p class="text-muted">{{ $t('alert.noConfigurations.placeholder') }}</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4">{{ $t('alert.configurations.table.id') }}</th>
                <th>{{ $t('alert.configurations.table.name') }}</th>
                <th>{{ $t('alert.configurations.table.collector') }}</th>
                <th>{{ $t('alert.configurations.table.period') }}</th>
                <th>{{ $t('alert.configurations.table.rules') }}</th>
                <th class="text-end pe-4">{{ $t('alert.configurations.table.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="alert in alerts" :key="alert.id">
                <td class="ps-4 fw-semibold text-muted">#{{ alert.id }}</td>
                <td class="fw-bold">{{ alert.name }}</td>
                <td>
                  <span class="badge bg-light text-dark border">{{ alert.collectorKind }}</span>
                </td>
                <td>{{ alert.dataPeriod }}s</td>
                <td>
                  <div class="d-flex flex-wrap gap-1">
                    <span v-for="(rule, idx) in alert.rules" :key="idx" class="rule-badge">
                      <code>{{ rule.field }}</code>
                      <span class="text-muted mx-1">{{ getConstraintName(rule.constraint) }}</span>
                      <code>{{ rule.value }}</code>
                    </span>
                  </div>
                </td>
                <td class="text-end pe-4">
                  <div class="d-flex justify-content-end gap-2">
                    <button
                      class="btn btn-sm shadow-sm d-flex align-items-center"
                      :class="isSubscribed(alert) ? 'btn-outline-secondary' : 'btn-outline-primary'"
                      @click="toggleSubscribe(alert)"
                      :title="
                        isSubscribed(alert)
                          ? $t('alert.unsubscribe.tooltip')
                          : $t('alert.subscribe.tooltip')
                      "
                    >
                      <i :class="isSubscribed(alert) ? 'bi bi-bell-slash' : 'bi bi-bell-fill'"></i>
                      <span class="d-none d-xl-inline ms-1">
                        {{
                          isSubscribed(alert)
                            ? $t('alert.unsubscribe.text')
                            : $t('alert.subscribe.text')
                        }}
                      </span>
                    </button>

                    <button
                      class="btn btn-sm btn-outline-primary shadow-sm"
                      @click="startEdit(alert)"
                    >
                      <i class="bi bi-pencil me-1"></i>{{ $t('edit') }}
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger shadow-sm"
                      @click="deleteAlert(alert.id)"
                    >
                      <i class="bi bi-trash me-1"></i>{{ $t('del') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-card,
.table-card {
  border-radius: 12px;
  overflow: hidden;
}
.rule-badge {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
}
.rule-badge code {
  color: #d63384;
  background: transparent;
  font-weight: 600;
}
.table > :not(caption) > * > * {
  padding: 1rem 0.75rem;
}
</style>
