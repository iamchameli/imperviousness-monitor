<template>
  <aside class="sidepanel">
    <FiltersPanel />
    <SummaryPanel class="sidepanel-section" />
  </aside>
</template>

<script setup>
import FiltersPanel from "../sidebar/FiltersPanel.vue";
import SummaryPanel from "../sidebar/SummaryPanel.vue";
</script>

<style scoped>
.sidepanel {
  width: 340px;
  max-width: 100%;
  border-left: 1px solid #e5e7eb;
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  gap: 0.75rem;
}

.sidepanel-section {
  flex: 1;
  overflow: auto;
}

@media (max-width: 768px) {
  .sidepanel {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 40vh;
    border-left: none;
    border-top: 1px solid #e5e7eb;
  }
}
</style>

