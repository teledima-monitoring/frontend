<script setup lang="ts">
import { onMounted } from 'vue'
import { useAlertsStore } from '@/stores/alerts'
import { storeToRefs } from 'pinia'
import AlertForm from '@/components/AlertForm.vue'
import type { AlertConfigCreate } from '@/types/api'

const alertsStore = useAlertsStore()
const { alerts, loading, error } = storeToRefs(alertsStore)
const { fetchAlerts, deleteAlert, getConstraintName } = alertsStore

onMounted(fetchAlerts)

async function handleCreate(data: AlertConfigCreate) {
  await alertsStore.createAlert(data)
}
</script>

<template>
  <div class="container-fluid">
    <h3 class="mb-4">Alerts Management</h3>

    <!-- Create Alert Form -->
    <div class="card mb-4">
      <div class="card-header">Create New Alert</div>
      <div class="card-body">
        <AlertForm @submit="handleCreate" :get-constraint-name="getConstraintName" />
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" />
    </div>

    <!-- Alerts Table -->
    <div class="card" v-if="!loading">
      <div class="card-header">Alert Configurations ({{ alerts.length }})</div>
      <div class="card-body p-0">
        <table class="table table-striped table-hover mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Collector Kind</th>
              <th>Period (s)</th>
              <th>Rules</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="alerts.length === 0">
              <td colspan="8" class="text-center text-muted py-4">No alerts configured</td>
            </tr>
            <tr v-for="alert in alerts" :key="alert.id">
              <td>{{ alert.id }}</td>
              <td>{{ alert.name }}</td>
              <td>{{ alert.collectorKind }}</td>
              <td>{{ alert.dataPeriod }}</td>
              <td>
                <ul class="list-unstyled mb-0 small">
                  <li v-for="(rule, idx) in alert.rules" :key="idx">
                    {{ rule.field }} {{ getConstraintName(rule.constraint) }} {{ rule.value }}
                  </li>
                </ul>
              </td>
              <td class="text-end">
                <button class="btn btn-outline-danger btn-sm" @click="deleteAlert(alert.id)">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
