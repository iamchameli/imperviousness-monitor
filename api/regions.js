module.exports = (req, res) => {
  const { type, q } = req.query;

  // Dutch provinces with approximate centers for map navigation
  const dutchProvinces = [
    { id: "DR", name: "Drenthe", center: [6.6, 52.9] },
    { id: "FL", name: "Flevoland", center: [5.4, 52.5] },
    { id: "FR", name: "Friesland", center: [5.8, 53.2] },
    { id: "GE", name: "Gelderland", center: [5.9, 52.0] },
    { id: "GR", name: "Groningen", center: [6.6, 53.2] },
    { id: "LI", name: "Limburg", center: [5.9, 51.2] },
    { id: "NB", name: "Noord-Brabant", center: [5.3, 51.5] },
    { id: "NH", name: "Noord-Holland", center: [4.9, 52.6] },
    { id: "OV", name: "Overijssel", center: [6.4, 52.5] },
    { id: "UT", name: "Utrecht", center: [5.1, 52.1] },
    { id: "ZE", name: "Zeeland", center: [3.8, 51.5] },
    { id: "ZH", name: "Zuid-Holland", center: [4.5, 52.0] }
  ];

  let regions = [];

  if (type === "province") {
    regions = dutchProvinces;
  } else if (type === "municipality") {
    // Placeholder for municipalities - can be expanded later
    regions = [];
  } else {
    // Return all types if no type specified
    regions = dutchProvinces;
  }

  // Filter by search query if provided
  if (q) {
    const queryLower = q.toLowerCase();
    regions = regions.filter(
      (r) =>
        r.name.toLowerCase().includes(queryLower) ||
        r.id.toLowerCase().includes(queryLower)
    );
  }

  res.status(200).json(regions);
};

