module.exports = (req, res) => {
  const { region_id: regionId, region_type: regionType, year } = req.query;

  // Placeholder: return a dummy stats object to prove wiring works.
  res.status(200).json({
    region_id: regionId || "dummy-region",
    region_name: "Dummy Region",
    region_type: regionType || null,
    year: year || null,
    area_m2: 1000000,
    impervious: {
      mean_pct: 40.5,
      median_pct: 38.0,
      min_pct: 0.0,
      max_pct: 100.0,
      impervious_area_m2: 405000
    },
    histogram: {
      bins: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      counts: [1, 2, 4, 6, 8, 7, 5, 3, 2, 1]
    }
  });
};

