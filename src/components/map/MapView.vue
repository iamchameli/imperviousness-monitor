<template>
  <div class="map-container" ref="mapContainer"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import maplibregl from "maplibre-gl";
import { useMapStore } from "../../store/mapStore";
import { config } from "../../services/config";

const mapContainer = ref(null);
let mapInstance = null;
const mapStore = useMapStore();

onMounted(() => {
  if (!mapContainer.value) return;

  mapInstance = new maplibregl.Map({
    container: mapContainer.value,
    style: "https://demotiles.maplibre.org/style.json",
    center: mapStore.center,
    zoom: mapStore.zoom,
    minZoom: config.minZoom,
    maxZoom: config.maxZoom
  });

  mapInstance.addControl(new maplibregl.NavigationControl(), "top-right");

  mapInstance.on("moveend", () => {
    const center = mapInstance.getCenter();
    mapStore.setCenter([center.lng, center.lat]);
    mapStore.setZoom(mapInstance.getZoom());
    mapStore.setBounds(mapInstance.getBounds().toArray().flat());
  });

  // Placeholder: here you will add the imperviousness vector tile source + layer
  // using config.tileBaseUrl once tiles are available.
});

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
});
</script>

<style scoped>
.map-container {
  flex: 1;
  position: relative;
}

.map-container :deep(canvas) {
  width: 100%;
  height: 100%;
}
</style>

