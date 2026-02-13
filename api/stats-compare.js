module.exports = (req, res) => {
  // Stub comparison endpoint – returns two dummy regions.
  res.status(200).json({
    region_type: "municipality",
    regions: [
      {
        region_id: "GM0001",
        region_name: "Example A",
        impervious: { mean_pct: 30.0 }
      },
      {
        region_id: "GM0002",
        region_name: "Example B",
        impervious: { mean_pct: 45.0 }
      }
    ]
  });
};

