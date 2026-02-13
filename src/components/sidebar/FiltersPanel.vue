<template>
  <section class="panel">
    <h2 class="panel-title">Filters</h2>
    <div class="panel-body">
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
import { computed } from "vue";
import { useDataStore } from "../../store/dataStore";

const dataStore = useDataStore();

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
</style>

