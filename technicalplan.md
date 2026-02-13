## Technical Plan: Imperviousness Dashboard (Vue + MapLibre)

### 1. Purpose and Scope

This document specifies the **technical plan** for building an end-to-end web dashboard for visualizing and analyzing **imperviousness** across the Netherlands. It is written so an AI or developer can:

- Understand the **functional requirements** and constraints.
- Implement the **data pipeline** (GeoParquet → aggregated layers → vector tiles).
- Implement the **backend APIs** (tile serving, statistics, exports).
- Implement the **frontend** (Vue 3 + MapLibre GL JS + charts).
- Deploy a working application with documentation.

The dashboard must support exploration at **multiple spatial scales**, from national overview to neighborhood detail, with **good performance** and **intuitive UX**.

---

### 2. High-Level Requirements

#### 2.1 Core User Capabilities

The user must be able to:

- View **imperviousness** for the entire Netherlands on an interactive map.
- Zoom and pan smoothly between:
  - National level.
  - Regional and municipal levels.
  - Neighborhood and street scales.
- See **imperviousness statistics** for:
  - Predefined regions (e.g., provinces, municipalities).
  - The current map viewport.
  - A user-defined area (e.g., bounding box; polygons later).
- See **charts and graphs** for:
  - Distribution of imperviousness (histogram).
  - Regional comparisons (e.g., multiple municipalities).
  - Time series (only if the data has a temporal component).
- Optionally **export** selected data and statistics (CSV, GeoJSON).

#### 2.2 Non-Functional Requirements

- **Performance**:
  - Smooth map interactions at typical desktop hardware.
  - Vector tiles and statistics should load within 1–2 seconds for normal queries.
- **Scalability**:
  - Handle a **national-scale** dataset for the Netherlands.
  - Architecture should be extendable to additional regions or datasets.
- **Usability**:
  - Clean, modern dashboard design.
  - Progressive disclosure: simple at first, with advanced options available.
- **Maintainability**:
  - Modular and documented code.
  - Configuration-driven endpoints and style parameters.

---

### 3. System Architecture Overview

The system consists of three main parts:

1. **Data Pipeline and Storage**
   - Input: high-resolution **GeoParquet** imperviousness dataset for the Netherlands.
   - Output:
     - Aggregated multi-resolution layers (grid-based, possibly per region).
     - Multi-scale **vector tile pyramid** (`.pbf` tiles) for map rendering.
2. **Backend Services**
   - **Tile serving** for vector tiles (static hosting or tile server).
   - **REST API** for:
     - Region and viewport statistics.
     - Comparisons.
     - Exports.
     - Metadata and search.
3. **Frontend Dashboard**
   - Built with **Vue 3** + **MapLibre GL JS**.
   - Integrates map, filters, and analytical charts.

---

### 4. Data Pipeline Specification

#### 4.1 Input Data Definition

- **Source format**: GeoParquet.
- **Expected fields** (actual names may differ; adapt during implementation):
  - `geometry`: polygon or grid cell geometry.
  - `impervious_pct`: imperviousness percentage (0–100).
  - `year` or `timestamp`: optional temporal dimension.
  - `region_code`: optional reference to administrative region (municipality, province, etc.).
- **Coordinate reference system (CRS)**:
  - Use a projected CRS suited for the Netherlands (e.g., EPSG:28992) for area calculations and aggregation.
  - Reproject as necessary before tile generation.

#### 4.2 Level of Detail (LOD) Strategy

The data is too detailed to render directly at all zoom levels, so we define a **multi-resolution strategy**:

- For each zoom range, define appropriate **aggregation resolution**:
  - Approximate example (to adjust during experiments):
    - Zoom 4–6: grid size ~ 5–10 km.
    - Zoom 7–10: grid size ~ 1–2 km.
    - Zoom 11–14: grid size ~ 100–250 m.
    - Zoom 15–16+: original or lightly generalized resolution.

The pipeline will:

- Aggregate raw geometries into **grid cells** per level.
- Compute **statistical summaries** per cell:
  - Area-weighted mean imperviousness.
  - Median, min, max imperviousness.
  - Area of impervious surfaces (possibly above threshold, e.g., >10%).
- Optionally simplify boundaries for polygon-based layers (e.g., admin regions).

#### 4.3 Aggregation Methods

**Grid-Based Aggregation**:

- For each target resolution:
  - Generate a regular grid over the Netherlands domain.
  - Intersect the grid with input geometries (impervious features).
  - For each grid cell:
    - Compute:
      - `mean_imp`: area-weighted mean imperviousness.
      - `median_imp`, `min_imp`, `max_imp`.
      - `imp_area_pct`: percentage of cell area that is impervious.
    - Store these as attributes.

**Vector Simplification** (for region boundaries and detailed features):

- Apply a line simplification algorithm (e.g., **Douglas-Peucker**).
- Use a tolerance per LOD (coarser for low zoom levels, smaller for high zoom).
- Preserve topology to avoid invalid geometries.

#### 4.4 Vector Tile Generation

**Format**:

- **Mapbox Vector Tiles** (`.pbf`).

**Tile schema**:

- Tile URL template:
  - `https://{tile-host}/impervious/{z}/{x}/{y}.pbf`
- Each tile contains at least one layer, e.g.:
  - Layer name: `impervious_grid`.
  - Attributes per feature/grid cell:
    - `mean_imp` (float).
    - `median_imp` (float).
    - `imp_area_pct` (float).
    - `cell_id` or `region_id`.

**Zoom-level mapping**:

- Map tile zoom levels to the appropriate aggregated layers, e.g.:
  - z 4–6 → coarse grid layer (large cells, high aggregation).
  - z 7–10 → medium grid layer.
  - z 11–14 → fine grid layer.
  - z 15–16 → original resolution or highest-resolution grid.

**Implementation notes for AI**:

- Use geospatial tooling to:
  - Read GeoParquet.
  - Perform buffering/intersection/aggregation.
  - Output per-zoom-level vector tiles.
- Potential building blocks:
  - Python libraries: `geopandas`, `pyogrio`, `shapely`, `pyproj`.
  - Tile generation: `tippecanoe`-like workflow or other vector tile generators.

#### 4.5 Tile Storage and Access

- Store vector tiles in a directory structure:
  - `/impervious/{z}/{x}/{y}.pbf`
- Host on:
  - Static file hosting (CDN or cloud storage), or
  - A basic tile server (e.g., Node/Express, Python/FastAPI).
- Optimize with:
  - Gzip or brotli compression.
  - Caching headers (`Cache-Control`).

---

### 5. Backend API Design

The backend provides:

- **Vector tile serving** (possibly via static hosting).
- **REST API** for statistics, region information, and exports.

#### 5.1 Technology Stack (Example)

An AI can choose suitable technologies, but a recommended stack:

- Language: Python (FastAPI) or Node.js (Express).
- Database (optional, for regions and precomputed summaries):
  - Postgres + PostGIS, or
  - Precomputed Parquet/GeoParquet layers on disk.

#### 5.2 API Base

- Base URL: `https://{api-host}/api/v1`

#### 5.3 Endpoints

**1) Metadata**

- `GET /meta`
- Purpose:
  - Provide configuration to the frontend:
    - Available layers, zoom ranges, color ramps.
    - Available years (if temporal).
    - Region types (e.g., province, municipality).

**2) Region Catalog**

- `GET /regions`
- Query parameters:
  - `type`: region type (e.g., `"province"`, `"municipality"`).
  - `q`: optional search string (partial name or code).
- Response:
  - List of regions:
    - `id`, `name`, `type`, bounding box, optional simplified geometry.

**3) Region Statistics**

- `GET /stats/region`
- Query parameters:
  - `region_id`: region identifier.
  - `region_type`: optional; clarifies namespace.
  - `year`: optional temporal filter.
- Response:
  - Overall statistics for the region:
    - `area_m2`.
    - Imperviousness summary:
      - `mean_pct`, `median_pct`, `min_pct`, `max_pct`.
      - `impervious_area_m2`.
    - Histogram data for distribution (bins + counts).

**4) Viewport/BBOX Statistics**

- `POST /stats/bbox`
- Request body:

```json
{
  "bbox": [minLon, minLat, maxLon, maxLat],
  "year": 2020,
  "resolution_hint": 10
}
```

- Behavior:
  - Backend chooses the appropriate aggregation layer based on BBOX and resolution or zoom.
  - Computes the same type of statistics as `/stats/region`.

**5) Custom Geometry Statistics**

- `POST /stats/geometry`
- Request body:

```json
{
  "geometry": {
    "type": "Polygon",
    "coordinates": [ ... ]
  },
  "year": 2020
}
```

- Behavior:
  - Compute statistics for the given polygon geometry.

**6) Region Comparison**

- `POST /stats/compare`
- Request body:

```json
{
  "region_type": "municipality",
  "region_ids": ["GM0001", "GM0002", "GM0003"],
  "year": 2020
}
```

- Response:
  - Array of stats objects (one per region) for comparison charts.

**7) Export**

- `POST /export`
- Request body:

```json
{
  "target": "region",
  "region_id": "GM0001",
  "region_type": "municipality",
  "year": 2020,
  "format": "csv"
}
```

- Behavior:
  - Generate and return:
    - CSV or GeoJSON with selected statistics and/or geometries.
  - Response:
    - Either file stream or a URL to a generated file.

#### 5.4 Response Example

Example structure for a region stats response:

```json
{
  "region_id": "GM1234",
  "region_name": "Example Municipality",
  "area_m2": 123456789,
  "impervious": {
    "mean_pct": 47.3,
    "median_pct": 45.0,
    "min_pct": 0.0,
    "max_pct": 100.0,
    "impervious_area_m2": 56789012
  },
  "histogram": {
    "bins": [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    "counts": [12, 34, 56, 78, 90, 87, 65, 43, 21, 10]
  }
}
```

---

### 6. Frontend Architecture (Vue + MapLibre)

#### 6.1 Technology Choices

- **Framework**: Vue 3 (Composition API).
- **State Management**: Pinia or Vuex; or a simple global store using composables.
- **Router**: Vue Router (for basic navigation, e.g., `/map`, `/about`).
- **Map Library**: MapLibre GL JS.
- **Charts**: Chart.js, ECharts, or D3.js (any one is acceptable).
- **Build Tool**: Vite.

#### 6.2 Project Structure (Suggested)

Organize the frontend project roughly as:

- `src/main.ts` – bootstraps Vue app.
- `src/App.vue` – root layout.
- `src/router/index.ts` – routes.
- `src/store/` – central state management.
  - `mapStore.ts` – map view, selection state.
  - `dataStore.ts` – stats, filters, loading/error.
- `src/components/`:
  - `map/MapView.vue` – map container and MapLibre initialization.
  - `map/MapControls.vue` – zoom, reset, base layer toggles.
  - `map/Legend.vue` – imperviousness color legend.
  - `sidebar/FiltersPanel.vue` – filters for region, year, impervious range.
  - `sidebar/SummaryPanel.vue` – key statistics for current selection.
  - `charts/HistogramChart.vue` – imperviousness distribution.
  - `charts/ComparisonChart.vue` – compare multiple regions.
  - `charts/TimeSeriesChart.vue` – optional time-based chart.
  - `layout/TopBar.vue` – title, global controls.
  - `layout/SidePanel.vue` – container for filters + charts.
- `src/services/`:
  - `apiClient.ts` – functions to call backend REST API endpoints.
  - `config.ts` – API URLs, tile URLs, map defaults, color ramps.
- `src/styles/`:
  - Global styles and variables.

#### 6.3 Map Setup (MapLibre GL JS)

**Initialization sequence** in `MapView.vue`:

1. On `mounted`:
   - Read configuration (API base URL, tile URL, default center, zoom).
   - Create a MapLibre map instance.
   - Add a base map layer (e.g., OSM or a custom basemap).
2. Add the imperviousness data source:

```javascript
map.addSource("impervious", {
  type: "vector",
  tiles: ["https://{tile-host}/impervious/{z}/{x}/{y}.pbf"],
  minzoom: 4,
  maxzoom: 16
});
```

3. Add the imperviousness layer:

```javascript
map.addLayer({
  id: "impervious-fill",
  type: "fill",
  source: "impervious",
  "source-layer": "impervious_grid",
  paint: {
    "fill-color": [
      "interpolate",
      ["linear"],
      ["get", "mean_imp"],
      0, "#f7fbff",
      20, "#c6dbef",
      40, "#6baed6",
      60, "#3182bd",
      80, "#08519c",
      100, "#08306b"
    ],
    "fill-opacity": 0.8
  }
});
```

4. Hook up map events:
   - `moveend`: update store with current center, zoom, and bounds.
   - `mousemove` / `mouseenter` on `impervious-fill`: show tooltip with feature stats.
   - `click` on `impervious-fill`: select feature; update selection in store and request detailed stats.

#### 6.4 State Management

**Map store** (`mapStore`):

- State:
  - `center`: `[lon, lat]`.
  - `zoom`: number.
  - `bounds`: map bounds (for stats calls).
  - `selectedRegion`: object with `id`, `type`, `name`, and optional geometry/bbox.
  - `selectedGeometry`: custom AOI geometry or bbox (optional).
- Actions:
  - `setCenter`, `setZoom`, `setBounds`.
  - `selectRegion(region)`.
  - `selectGeometry(geometry)`.

**Data store** (`dataStore`):

- State:
  - `currentStats`: stats object for current selection (region, bbox, or geometry).
  - `comparisonStats`: stats array for multiple regions.
  - `filters`: `year`, `imperviousRange`, `regionType`, etc.
  - `loading`: booleans for different requests.
  - `error`: error messages or codes.
- Actions:
  - `fetchRegionStats(regionId, regionType, year)`.
  - `fetchBboxStats(bbox, year)`.
  - `fetchGeometryStats(geometry, year)`.
  - `fetchComparison(regionType, regionIds, year)`.

#### 6.5 Filters and Selections

**Region selection**:

- In `FiltersPanel.vue`:
  - Provide a select/dropdown for region type (e.g., province, municipality).
  - Provide a search box or dropdown for region name.
  - On region change:
    - Call `/regions` to fetch matching regions.
    - Let user choose one.
    - Once selected, call `/stats/region`.
    - Pan/zoom the map to the region’s bounding box.

**BBOX selection**:

- Implement a simple drawing interaction:
  - On a button click, enter “bbox selection mode”.
  - On `mousedown` + `mousemove` + `mouseup`, draw a rectangular overlay.
  - Convert the drawn rectangle to a geographic bbox.
  - Call `/stats/bbox` with this bbox.

**Custom geometry selection** (later/enhanced):

- Optional: integrate a small drawing tool (polygon).
  - On completion, call `/stats/geometry`.

#### 6.6 Charts Integration

**HistogramChart.vue**:

- Props:
  - `bins`: array of bin edges.
  - `counts`: array of counts.
- Uses chosen chart library to render imperviousness distribution (bars).
- Updates automatically when `currentStats.histogram` changes.

**ComparisonChart.vue**:

- Props:
  - Array of objects with region name and mean imperviousness (and possibly more metrics).
- Displays a bar chart or similar:
  - X-axis: region names.
  - Y-axis: mean imperviousness (%).

**TimeSeriesChart.vue** (if temporal data is present):

- Props:
  - `data`: list of `{year, mean_pct}` entries for a region.
- Displays a line chart of imperviousness over time.

#### 6.7 UX and Layout

- **Layout**:
  - Top bar (`TopBar.vue`): title, basic navigation, and global actions.
  - Left/center: Map (main view).
  - Right: Side panel (`SidePanel.vue`):
    - Tabs for:
      - Filters.
      - Summary and distribution.
      - Comparisons.
      - Exports (if implemented).
- **Progressive disclosure**:
  - On initial load:
    - Show map and a minimal summary panel (mean imperviousness, total impervious area).
    - Keep advanced tabs (distribution, comparison, export) collapsed or in secondary tabs.
  - Only show detailed options when user clicks into those sections.
- **Responsive behavior**:
  - Desktop:
    - Map and side panel visible concurrently.
  - Tablet/mobile:
    - Side panel becomes a collapsible drawer (e.g., slides up from bottom or side).

---

### 7. Configuration and Environments

**Config file** (`config.ts` or JSON):

- `apiBaseUrl`
- `tileBaseUrl`
- `defaultCenter` (lon, lat)
- `defaultZoom`
- `minZoom`, `maxZoom`
- `colorRamps` for imperviousness visualization
- `defaultYear` (if applicable)

**Environment files**:

- `.env.development`: local API endpoints and tile URLs.
- `.env.production`: production endpoints and tile URLs.

---

### 8. Testing and Validation Plan

#### 8.1 Backend

- Unit tests for:
  - Aggregation functions (means, medians, percent area).
  - Histogram construction.
- Integration tests for:
  - `/stats/region` using known test regions with expected results.
  - `/stats/bbox` with small and large bounding boxes.
  - `/stats/compare` with multiple regions.
- Performance tests:
  - Measure response time for typical region and bbox queries.

#### 8.2 Frontend

- Component tests:
  - `MapView.vue` renders and adds expected layers.
  - Chart components display correct values when props change.
  - Filters and selections dispatch correct actions.
- End-to-end tests (manual or automated):
  - Load dashboard.
  - Zoom and pan map.
  - Select region and verify stats and charts update.
  - Draw bbox and verify stats update.

#### 8.3 Validation against Source Data

- Spot-check:
  - Compare sample tiles and aggregated values against the original GeoParquet data for a few regions.
  - Ensure aggregated statistics are consistent with source values.

---

### 9. Deployment and Operations

#### 9.1 Backend and Tiles

- Containerize backend service (e.g., Docker).
- Host:
  - Backend API on a suitable platform (e.g., VM, container service).
  - Vector tile files and static assets on a CDN or object storage with caching.

#### 9.2 Frontend

- Build static assets with Vite.
- Deploy to:
  - Static hosting service or web server (e.g., nginx).
  - Configure base URL and environment variables for API and tile endpoints.

#### 9.3 Monitoring and Logs

- Log:
  - API request metrics.
  - Errors (HTTP 4xx/5xx).
- Optional:
  - Frontend error reporting.
  - Basic usage metrics (page views, common interactions).

---

### 10. Implementation Checklist (High-Level)

This is a concise checklist that an AI or developer can follow:

1. **Data Understanding and Setup**
   - Load GeoParquet imperviousness data.
   - Confirm schema, CRS, attribute fields.
2. **Aggregation Experiments**
   - Define grid resolutions aligned to zoom levels.
   - Implement and test grid-based aggregation on a sample area.
   - Validate statistics vs source data.
3. **Full Data Pipeline**
   - Run aggregation for all required resolutions, for all of the Netherlands.
   - Generate vector tiles for each zoom level.
   - Store tiles in `/{z}/{x}/{y}.pbf` structure.
4. **Backend Implementation**
   - Implement `GET /meta`, `GET /regions`, `GET /stats/region`, `POST /stats/bbox`, `POST /stats/geometry`, `POST /stats/compare`, `POST /export`.
   - Optimize queries and caching as needed.
5. **Frontend Foundation**
   - Scaffold Vue 3 + Vite app.
   - Add MapLibre GL JS.
   - Implement `MapView.vue` and base map with impervious layer.
6. **Interactivity and State Management**
   - Implement map event handlers (click, moveend, hover).
   - Add Pinia/Vuex stores for map and data state.
   - Connect frontend to backend API for stats.
7. **Filters, Panels, and Charts**
   - Implement `FiltersPanel.vue`, `SummaryPanel.vue`.
   - Implement histogram and comparison charts.
   - Add region selection and bbox selection tooling.
8. **UX Polish and Progressive Disclosure**
   - Refine layout for desktop and mobile.
   - Implement tabs and collapsible advanced panels.
9. **Testing and Validation**
   - Run unit and integration tests.
   - Validate outputs with sample regions and stakeholders.
10. **Deployment and Documentation**
   - Deploy backend and frontend.
   - Document architecture, API, and usage.
   - Prepare final demo and knowledge transfer materials.

