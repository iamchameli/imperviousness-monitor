module.exports = (req, res) => {
  res.status(200).json({
    layers: ["impervious_grid"],
    zoom: {
      min: 4,
      max: 16
    },
    colorRamps: ["default"],
    years: [],
    regionTypes: ["province", "municipality"]
  });
};

