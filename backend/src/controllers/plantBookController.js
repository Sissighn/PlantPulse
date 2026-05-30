const openPlantbookService = require("../services/openPlantbookService");

exports.searchPlants = async (req, res) => {
  const plants = await openPlantbookService.searchPlants(req.query.q, {
    lang: req.query.lang || "de",
    limit: req.query.limit || 12,
  });
  res.json({ plants });
};

exports.getPlantDetail = async (req, res) => {
  const plant = await openPlantbookService.getPlantDetail(req.params.pid, {
    lang: req.query.lang || "de",
  });
  res.json({ plant });
};
