import { defineStore } from "pinia";
import { apiClient } from "../services/apiClient";

export const useDataStore = defineStore("data", {
  state: () => ({
    currentStats: null,
    comparisonStats: [],
    filters: {
      year: null,
      imperviousRange: [0, 100],
      regionType: null,
      province: null
    },
    provinces: [],
    loading: {
      stats: false,
      comparison: false,
      provinces: false
    },
    error: null
  }),
  actions: {
    async fetchProvinces() {
      if (this.provinces.length > 0) return; // Cache provinces
      this.loading.provinces = true;
      try {
        const res = await apiClient.get("/regions", {
          params: { type: "province" }
        });
        this.provinces = res.data || [];
      } catch (e) {
        console.error("Failed to load provinces:", e);
        // Fallback to hardcoded Dutch provinces if API fails
        this.provinces = [
          { id: "DR", name: "Drenthe", center: [6.6, 52.9] },
          { id: "FL", name: "Flevoland", center: [5.4, 52.5] },
          { id: "FR", name: "Friesland", center: [5.8, 53.2] },
          { id: "GE", name: "Gelderland", center: [5.9, 52.0] },
          { id: "GR", name: "Groningen", center: [6.6, 53.2] },
          { id: "LI", name: "Limburg", center: [5.9, 51.2] },
          { id: "NB", name: "Noord-Brabant", center: [5.3, 51.5] },
          { id: "NH", name: "Noord-Holland", center: [4.9, 52.6] },
          { id: "OV", name: "Overijssel", center: [6.4, 52.5] },
          { id: "UT", name: "Utrecht", center: [5.1, 52.1] },
          { id: "ZE", name: "Zeeland", center: [3.8, 51.5] },
          { id: "ZH", name: "Zuid-Holland", center: [4.5, 52.0] }
        ];
      } finally {
        this.loading.provinces = false;
      }
    },
    async fetchRegionStats(regionId, regionType, year) {
      this.loading.stats = true;
      this.error = null;
      try {
        const res = await apiClient.get("/stats/region", {
          params: { region_id: regionId, region_type: regionType, year }
        });
        this.currentStats = res.data;
      } catch (e) {
        this.error = "Failed to load region statistics.";
      } finally {
        this.loading.stats = false;
      }
    }
  }
});

