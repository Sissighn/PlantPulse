const crypto = require("crypto");
const memoryDB = require("../db/memoryDB");
const aiService = require("./aiService");

exports.getAllPlants = () => {
  return memoryDB.findAll();
};

exports.addPlant = async (data) => {
  if (!data.name) throw new Error("Name fehlt");

  // Logik: Wenn kein Intervall da ist, frag die KI
  let interval = data.baseInterval;
  if (!interval) {
    interval = (await aiService.suggestInterval(data.name)) || 7;
  }

  const newPlant = {
    id: crypto.randomUUID(),
    name: data.name,
    type: data.type || "leaf",
    baseInterval: parseInt(interval),
    lastWatered: new Date().toISOString(),
  };

  memoryDB.create(newPlant);
  return newPlant;
};

exports.deletePlant = (id) => {
  return memoryDB.deleteById(id);
};

exports.waterPlant = (id) => {
  return memoryDB.update(id, { lastWatered: new Date().toISOString() });
};

exports.getTips = async (name, season) => {
  return await aiService.getCareTips(name, season || "Sommer");
};
