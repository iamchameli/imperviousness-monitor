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

  // Create OSM-based style
  const osmStyle = {
    version: 8,
    sources: {
      "osm-tiles": {
        type: "raster",
        tiles: [
          "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        ],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors"
      }
    },
    layers: [
      {
        id: "osm-layer",
        type: "raster",
        source: "osm-tiles",
        minzoom: 0,
        maxzoom: 19
      }
    ]
  };

  mapInstance = new maplibregl.Map({
    container: mapContainer.value,
    style: osmStyle,
    center: config.defaultCenter,
    zoom: config.defaultZoom,
    minZoom: config.minZoom,
    maxZoom: config.maxZoom
  });

  // Constrain map to Netherlands bounds
  mapInstance.setMaxBounds(config.netherlandsBounds);

  mapInstance.addControl(new maplibregl.NavigationControl(), "top-right");

  // Add scale control
  mapInstance.addControl(new maplibregl.ScaleControl({
    maxWidth: 100,
    unit: "metric"
  }), "bottom-left");

  mapInstance.on("load", () => {
    // Store map instance reference for programmatic control
    mapStore.setMapInstance(mapInstance);
    // Update store with initial values
    const center = mapInstance.getCenter();
    mapStore.setCenter([center.lng, center.lat]);
    mapStore.setZoom(mapInstance.getZoom());
    mapStore.setBounds(mapInstance.getBounds().toArray().flat());
  });

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

