import { defineStore } from "pinia";
import { config } from "../services/config";

export const useMapStore = defineStore("map", {
  state: () => ({
    center: config.defaultCenter,
    zoom: config.defaultZoom,
    bounds: null,
    selectedRegion: null,
    selectedGeometry: null,
    mapInstance: null // Reference to MapLibre map instance
  }),
  actions: {
    setCenter(center) {
      this.center = center;
    },
    setZoom(zoom) {
      this.zoom = zoom;
    },
    setBounds(bounds) {
      this.bounds = bounds;
    },
    setMapInstance(instance) {
      this.mapInstance = instance;
    },
    selectRegion(region) {
      this.selectedRegion = region;
    },
    selectGeometry(geometry) {
      this.selectedGeometry = geometry;
    },
    // Pan to a specific province by its center coordinates
    panToProvince(center, zoom = 8) {
      if (this.mapInstance) {
        this.mapInstance.flyTo({
          center: center,
          zoom: zoom,
          duration: 1000
        });
      }
    }
  }
});

