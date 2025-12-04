const plantService = require("../services/plantService");

// GET /api/plants - Fetches all plants.
exports.getPlants = async (req, res) => {
  try {
    const plants = await plantService.getAllPlants();
    res.json({ plants });
  } catch (e) {
    res.status(500).json({ message: "Database error" });
  }
};

// POST /api/plants - Creates a new plant.
exports.createPlant = async (req, res) => {
  try {
    const newPlant = await plantService.addPlant(req.body);
    res.status(201).json(newPlant);
  } catch (error) {
    res
      .status(400)
      .json({ message: error.message || "Could not create plant." });
  }
};

// DELETE /api/plants/:id - Removes a plant by its ID.
exports.removePlant = async (req, res) => {
  try {
    const success = await plantService.deletePlant(req.params.id);
    if (success) res.json({ message: "Deleted successfully" });
    else res.status(404).json({ message: "Plant not found" });
  } catch (e) {
    res.status(500).json({ message: "Error deleting plant" });
  }
};

// POST /api/water/:id - Updates the last watered date for a plant.
exports.waterPlant = async (req, res) => {
  try {
    const plant = await plantService.waterPlant(req.params.id);
    if (plant) res.json(plant);
    else res.status(404).json({ message: "Plant not found" });
  } catch (e) {
    res.status(500).json({ message: "Error watering plant" });
  }
};

// GET /api/tips - Fetches AI-generated care tips for a plant.
exports.getAiTips = async (req, res) => {
  try {
    const tips = await plantService.getTips(req.query.name, req.query.season);
    res.json({ tips });
  } catch (e) {
    res.status(500).json({ tips: "No tips available" });
  }
};
