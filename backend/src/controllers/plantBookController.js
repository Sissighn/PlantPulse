const openPlantbookService = require("../services/openPlantbookService");

exports.searchPlants = async (req, res) => {
  try {
    const plants = await openPlantbookService.searchPlants(req.query.q, {
      lang: req.query.lang || "de",
      limit: req.query.limit || 12,
    });
    res.json({ plants });
  } catch (error) {
    const status = openPlantbookService.isConfigured() ? 502 : 503;
    res.status(status).json({
      message: error.message || "Open Plantbook is not available.",
    });
  }
};

exports.getPlantDetail = async (req, res) => {
  try {
    const plant = await openPlantbookService.getPlantDetail(req.params.pid, {
      lang: req.query.lang || "de",
    });
    res.json({ plant });
  } catch (error) {
    const status = openPlantbookService.isConfigured() ? 502 : 503;
    res.status(status).json({
      message: error.message || "Open Plantbook is not available.",
    });
  }
};
