module.exports = (req, res) => {
  const { type, q } = req.query;

  // Placeholder: return an empty list for now.
  res.status(200).json({
    type: type || null,
    query: q || null,
    regions: []
  });
};

