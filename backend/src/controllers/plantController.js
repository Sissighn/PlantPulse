const plantService = require("../services/plantService");

exports.getPlants = (req, res) => {
  const plants = plantService.getAllPlants();
  res.json({ plants });
};

exports.createPlant = async (req, res) => {
  try {
    const newPlant = await plantService.addPlant(req.body);
    res.status(201).json(newPlant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.removePlant = (req, res) => {
  const success = plantService.deletePlant(req.params.id);
  if (success) res.json({ message: "Gelöscht" });
  else res.status(404).json({ message: "Nicht gefunden" });
};

exports.waterPlant = (req, res) => {
  const plant = plantService.waterPlant(req.params.id);
  if (plant) res.json(plant);
  else res.status(404).json({ message: "Nicht gefunden" });
};

exports.getAiTips = async (req, res) => {
  const { name, season } = req.query;
  const tips = await plantService.getTips(name, season);
  res.json({ tips });
};
