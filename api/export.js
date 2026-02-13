module.exports = (req, res) => {
  const { format = "csv" } = req.query;

  if (format === "geojson") {
    res.status(200).json({
      type: "FeatureCollection",
      features: []
    });
    return;
  }

  // Very simple CSV placeholder
  res.setHeader("Content-Type", "text/csv");
  res.status(200).send("region_id,mean_impervious_pct\nexample,40.5\n");
};

