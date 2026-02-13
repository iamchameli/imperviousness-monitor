export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "/api",
  tileBaseUrl: import.meta.env.VITE_TILE_BASE_URL || "",
  // Netherlands center (Amsterdam area)
  defaultCenter: [5.2913, 52.1326],
  defaultZoom: 7,
  minZoom: 6,
  maxZoom: 18,
  // Netherlands bounding box to constrain map view
  netherlandsBounds: [
    [3.3316, 50.7504], // Southwest corner
    [7.2275, 53.6756]  // Northeast corner
  ]
};

