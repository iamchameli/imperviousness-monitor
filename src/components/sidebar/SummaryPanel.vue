<template>
  <section class="panel">
    <h2 class="panel-title">Summary</h2>
    <div class="panel-body">
      <p v-if="!stats" class="placeholder">
        Select a region or draw an area to see statistics.
      </p>
      <div v-else class="stats">
        <div class="row">
          <span class="label">Region</span>
          <span class="value">{{ stats.region_name || stats.region_id }}</span>
        </div>
        <div class="row">
          <span class="label">Mean imperviousness</span>
          <span class="value">
            {{ stats.impervious?.mean_pct?.toFixed(1) ?? "–" }}%
          </span>
        </div>
        <div class="row">
          <span class="label">Median imperviousness</span>
          <span class="value">
            {{ stats.impervious?.median_pct?.toFixed(1) ?? "–" }}%
          </span>
        </div>
        <div class="row">
          <span class="label">Impervious area</span>
          <span class="value">
            {{ formatArea(stats.impervious?.impervious_area_m2) }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useDataStore } from "../../store/dataStore";

const dataStore = useDataStore();
const stats = computed(() => dataStore.currentStats);

function formatArea(m2) {
  if (!m2 && m2 !== 0) return "–";
  if (m2 > 1_000_000) {
    return `${(m2 / 1_000_000).toFixed(2)} km²`;
  }
  return `${m2.toLocaleString()} m²`;
}
</script>

<style scoped>
.panel {
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  padding: 0.75rem;
  background-color: #ffffff;
  height: 100%;
}

.panel-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.panel-body {
  font-size: 0.85rem;
}

.placeholder {
  color: #6b7280;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.label {
  color: #6b7280;
}

.value {
  font-weight: 500;
}
</style>

