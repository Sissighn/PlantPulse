const openPlantbookService = require("../services/openPlantbookService");
const {
  plantBookDetailSchema,
  plantBookParamSchema,
  plantBookSearchQuerySchema,
  sendValidationError,
} = require("../validation/requestSchemas");

exports.searchPlants = async (req, res) => {
  try {
    const query = plantBookSearchQuerySchema.parse(req.query);
    const plants = await openPlantbookService.searchPlants(query.q, {
      lang: query.lang || "de",
      limit: query.limit || 12,
    });
    res.json({ plants });
  } catch (error) {
    if (sendValidationError(res, error)) return;
    const status = openPlantbookService.isConfigured() ? 502 : 503;
    res.status(status).json({
      message: error.message || "Open Plantbook is not available.",
    });
  }
};

exports.getPlantDetail = async (req, res) => {
  try {
    const { pid } = plantBookParamSchema.parse(req.params);
    const query = plantBookDetailSchema.parse(req.query);
    const plant = await openPlantbookService.getPlantDetail(pid, {
      lang: query.lang || "de",
    });
    res.json({ plant });
  } catch (error) {
    if (sendValidationError(res, error)) return;
    const status = openPlantbookService.isConfigured() ? 502 : 503;
    res.status(status).json({
      message: error.message || "Open Plantbook is not available.",
    });
  }
};
