const plantService = require("../services/plantService");
const {
  plantCreateSchema,
  sendValidationError,
  tipsQuerySchema,
  uuidParamSchema,
} = require("../validation/requestSchemas");

// GET /api/plants - Fetches all plants.
exports.getPlants = async (req, res) => {
  try {
    const plants = await plantService.getAllPlants(req.user.id);
    res.json({ plants });
  } catch (e) {
    res.status(500).json({ message: "Database error" });
  }
};

// POST /api/plants - Creates a new plant.
exports.createPlant = async (req, res) => {
  try {
    const body = plantCreateSchema.parse(req.body || {});
    const newPlant = await plantService.addPlant(body, req.user.id);
    res.status(201).json(newPlant);
  } catch (error) {
    if (sendValidationError(res, error)) return;
    res
      .status(400)
      .json({ message: error.message || "Could not create plant." });
  }
};

// DELETE /api/plants/:id - Removes a plant by its ID.
exports.removePlant = async (req, res) => {
  try {
    const { id } = uuidParamSchema.parse(req.params);
    const success = await plantService.deletePlant(id, req.user.id);
    if (success) res.json({ message: "Deleted successfully" });
    else res.status(404).json({ message: "Plant not found" });
  } catch (e) {
    if (sendValidationError(res, e)) return;
    res.status(500).json({ message: "Error deleting plant" });
  }
};

// POST /api/water/:id - Updates the last watered date for a plant.
exports.waterPlant = async (req, res) => {
  try {
    const { id } = uuidParamSchema.parse(req.params);
    const plant = await plantService.waterPlant(id, req.user.id);
    if (plant) res.json(plant);
    else res.status(404).json({ message: "Plant not found" });
  } catch (e) {
    if (sendValidationError(res, e)) return;
    res.status(500).json({ message: "Error watering plant" });
  }
};

// GET /api/tips - Fetches AI-generated care tips for a plant.
exports.getAiTips = async (req, res) => {
  try {
    const query = tipsQuerySchema.parse(req.query);
    const tips = await plantService.getTips(query.name, query.season);
    res.json({ tips });
  } catch (e) {
    if (sendValidationError(res, e)) return;
    res.status(500).json({ tips: "No tips available" });
  }
};
