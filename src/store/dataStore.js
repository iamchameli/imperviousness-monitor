import { defineStore } from "pinia";
import { apiClient } from "../services/apiClient";

export const useDataStore = defineStore("data", {
  state: () => ({
    currentStats: null,
    comparisonStats: [],
    filters: {
      year: null,
      imperviousRange: [0, 100],
      regionType: null
    },
    loading: {
      stats: false,
      comparison: false
    },
    error: null
  }),
  actions: {
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

