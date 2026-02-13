module.exports = (req, res) => {
  // Expect JSON body when called via POST in real implementation.
  // This is a stub response.
  res.status(200).json({
    target: "bbox",
    area_m2: 500000,
    impervious: {
      mean_pct: 35.0,
      median_pct: 32.0,
      min_pct: 0.0,
      max_pct: 100.0,
      impervious_area_m2: 175000
    },
    histogram: {
      bins: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      counts: [0, 1, 3, 5, 7, 6, 4, 2, 1, 0]
    }
  });
};

