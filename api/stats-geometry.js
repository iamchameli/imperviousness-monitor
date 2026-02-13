module.exports = (req, res) => {
  // Stub implementation for custom geometry stats.
  res.status(200).json({
    target: "geometry",
    area_m2: 250000,
    impervious: {
      mean_pct: 50.0,
      median_pct: 48.0,
      min_pct: 0.0,
      max_pct: 100.0,
      impervious_area_m2: 125000
    },
    histogram: {
      bins: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      counts: [0, 0, 1, 2, 3, 4, 3, 2, 1, 0]
    }
  });
};

