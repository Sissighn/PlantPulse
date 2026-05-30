const plantService = require("../services/plantService");
const { createHttpError } = require("../middleware/errorHandler");

// GET /api/plants - Fetches all plants.
exports.getPlants = async (req, res) => {
  const plants = await plantService.getAllPlants(req.user.id);
  res.json({ plants });
};

// POST /api/plants - Creates a new plant.
exports.createPlant = async (req, res) => {
  const newPlant = await plantService.addPlant(req.body, req.user.id);
  res.status(201).json(newPlant);
};

// DELETE /api/plants/:id - Removes a plant by its ID.
exports.removePlant = async (req, res) => {
  const success = await plantService.deletePlant(req.params.id, req.user.id);
  if (!success) {
    throw createHttpError(404, "Plant not found");
  }

  res.json({ message: "Deleted successfully" });
};

// POST /api/water/:id - Updates the last watered date for a plant.
exports.waterPlant = async (req, res) => {
  const plant = await plantService.waterPlant(req.params.id, req.user.id);
  if (!plant) {
    throw createHttpError(404, "Plant not found");
  }

  res.json(plant);
};

// GET /api/tips - Fetches AI-generated care tips for a plant.
exports.getAiTips = async (req, res) => {
  const tips = await plantService.getTips(req.query.name, req.query.season);
  res.json({ tips });
};
