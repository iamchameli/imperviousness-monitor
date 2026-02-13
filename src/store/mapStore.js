import { defineStore } from "pinia";

export const useMapStore = defineStore("map", {
  state: () => ({
    center: [5.3, 52.2], // Approximate center of the Netherlands
    zoom: 7,
    bounds: null,
    selectedRegion: null,
    selectedGeometry: null
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
    selectRegion(region) {
      this.selectedRegion = region;
    },
    selectGeometry(geometry) {
      this.selectedGeometry = geometry;
    }
  }
});

