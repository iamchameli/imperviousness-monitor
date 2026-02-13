<template>
  <div class="app-root">
    <TopBar />
    <div class="app-main">
      <MapView />
      <SidePanel />
    </div>
  </div>
</template>

<script setup>
import TopBar from "./components/layout/TopBar.vue";
import MapView from "./components/map/MapView.vue";
import SidePanel from "./components/layout/SidePanel.vue";
</script>

<style scoped>
.app-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

.app-main {
  display: flex;
  flex: 1;
  min-height: 0;
}
</style>

