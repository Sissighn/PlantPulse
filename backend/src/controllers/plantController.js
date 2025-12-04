const plantService = require("../services/plantService");

// Alle Funktionen müssen jetzt async sein!

exports.getPlants = async (req, res) => {
  try {
    const plants = await plantService.getAllPlants();
    res.json({ plants });
  } catch (e) {
    res.status(500).json({ message: "DB Fehler" });
  }
};

exports.createPlant = async (req, res) => {
  try {
    const newPlant = await plantService.addPlant(req.body);
    res.status(201).json(newPlant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.removePlant = async (req, res) => {
  try {
    const success = await plantService.deletePlant(req.params.id);
    if (success) res.json({ message: "Gelöscht" });
    else res.status(404).json({ message: "Nicht gefunden" });
  } catch (e) {
    res.status(500).json({ message: "Fehler beim Löschen" });
  }
};

exports.waterPlant = async (req, res) => {
  try {
    const plant = await plantService.waterPlant(req.params.id);
    if (plant) res.json(plant);
    else res.status(404).json({ message: "Nicht gefunden" });
  } catch (e) {
    res.status(500).json({ message: "Fehler beim Gießen" });
  }
};

exports.getAiTips = async (req, res) => {
  try {
    const tips = await plantService.getTips(req.query.name, req.query.season);
    res.json({ tips });
  } catch (e) {
    res.json({ tips: "Keine Tipps verfügbar" });
  }
};
