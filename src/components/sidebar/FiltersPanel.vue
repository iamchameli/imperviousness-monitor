<template>
  <section class="panel">
    <h2 class="panel-title">Filters</h2>
    <div class="panel-body">
      <div class="field">
        <label class="label">Province</label>
        <select 
          v-model="province" 
          class="input"
          :disabled="loadingProvinces"
        >
          <option value="">All Provinces</option>
          <option 
            v-for="prov in provinces" 
            :key="prov.id" 
            :value="prov.id"
          >
            {{ prov.name }}
          </option>
        </select>
        <small v-if="loadingProvinces" class="hint">Loading provinces...</small>
      </div>

      <div class="field">
        <label class="label">Region type</label>
        <select v-model="regionType" class="input">
          <option value="">(none)</option>
          <option value="province">Province</option>
          <option value="municipality">Municipality</option>
        </select>
      </div>

      <div class="field">
        <label class="label">Year (optional)</label>
        <input
          v-model.number="year"
          type="number"
          min="1900"
          max="2100"
          class="input"
          placeholder="e.g. 2020"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useDataStore } from "../../store/dataStore";
import { useMapStore } from "../../store/mapStore";
import { config } from "../../services/config";

const dataStore = useDataStore();
const mapStore = useMapStore();

// Load provinces on mount
onMounted(() => {
  dataStore.fetchProvinces();
});

const provinces = computed(() => dataStore.provinces);
const loadingProvinces = computed(() => dataStore.loading.provinces);

const province = computed({
  get: () => dataStore.filters.province || "",
  set: (value) => {
    dataStore.filters.province = value || null;
    // Pan to selected province
    if (value) {
      const selectedProvince = provinces.value.find((p) => p.id === value);
      if (selectedProvince && selectedProvince.center) {
        mapStore.panToProvince(selectedProvince.center, 9);
      }
    } else {
      // Reset to Netherlands center if "All Provinces" is selected
      mapStore.panToProvince(config.defaultCenter, config.defaultZoom);
    }
  }
});

const regionType = computed({
  get: () => dataStore.filters.regionType || "",
  set: (value) => {
    dataStore.filters.regionType = value || null;
  }
});

const year = computed({
  get: () => dataStore.filters.year,
  set: (value) => {
    dataStore.filters.year = value || null;
  }
});
</script>

<style scoped>
.panel {
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  padding: 0.75rem;
  background-color: #ffffff;
}

.panel-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.8rem;
  color: #4b5563;
}

.input {
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  padding: 0.35rem 0.5rem;
  font-size: 0.85rem;
}

.input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.hint {
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
}
</style>

