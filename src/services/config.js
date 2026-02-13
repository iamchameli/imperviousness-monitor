export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "/api",
  tileBaseUrl: import.meta.env.VITE_TILE_BASE_URL || "",
  defaultCenter: [5.3, 52.2],
  defaultZoom: 7,
  minZoom: 4,
  maxZoom: 16
};

