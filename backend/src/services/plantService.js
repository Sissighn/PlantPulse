const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const db = require("../db/database");
const aiService = require("./aiService");
const { getPlantProfile } = require("../domain/wateringProfiles");

// Define the directory where plant images are stored.
const imagesDir = path.join(__dirname, "..", "..", "public", "plantImages");

// Helper function to normalize strings for comparison (lowercase, alphanumeric).
function normalizeString(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

// Finds the best matching image file for a plant based on its name or type.
function findBestImageFor(name, type) {
  try {
    if (!fs.existsSync(imagesDir)) {
      console.warn(`⚠️ Directory not found: ${imagesDir}`);
      return null;
    }

    const files = fs.readdirSync(imagesDir);
    const nName = normalizeString(name);
    const nType = normalizeString(type);

    // Create a map of normalized filenames to original filenames.
    const map = new Map();

    for (const f of files) {
      if (f.startsWith(".")) continue;
      const base = path.parse(f).name;
      map.set(normalizeString(base), f);
    }

    // Priority: 1. Name, 2. Type, 3. Similarity
    if (nName && map.has(nName)) return map.get(nName);
    if (nType && map.has(nType)) return map.get(nType);
    for (const [key, val] of map.entries()) {
      if (nName && key.includes(nName)) return val;
    }
    return null;
  } catch (e) {
    console.error("Error finding image:", e.message);
    return null;
  }
}

function presentPlant(plant) {
  if (!plant) return null;

  const { user_id, userId, ...publicPlant } = plant;
  const filename =
    publicPlant.image || findBestImageFor(publicPlant.name, publicPlant.type);
  const imageUrl = filename ? `/images/${filename}` : null;

  return { ...publicPlant, imageUrl };
}

// Fetches all plants and enriches them with a full image URL.
exports.getAllPlants = async (userId) => {
  const rows = await db.findAll(userId);
  return rows.map(presentPlant);
};

// Adds a new plant, suggests a watering interval via AI, and finds a matching image.
exports.addPlant = async (data, userId) => {
  if (!data.name) throw new Error("Plant name is required.");

  // Use a deterministic plant profile first. AI remains a fallback for unknown plants.
  let interval = Number.parseInt(data.baseInterval, 10);
  if (!Number.isFinite(interval) || interval <= 0) {
    const profile = getPlantProfile(data.name, data.type);
    interval = profile?.baseInterval;

    if (!Number.isFinite(interval) || interval <= 0) {
      try {
        interval = (await aiService.suggestInterval(data.name)) || 7;
      } catch (e) {
        interval = 7;
      }
    }
  }

  if (!Number.isFinite(interval) || interval <= 0) {
    interval = 7;
  }

  // Automatically find the best image for the new plant.
  const autoImage = findBestImageFor(data.name, data.type);

  // Construct the new plant object.
  const newPlant = {
    id: crypto.randomUUID(),
    userId,
    name: data.name,
    type: data.type || "leaf",
    baseInterval: Number.parseInt(interval, 10),
    lastWatered: new Date().toISOString(),
    image: autoImage,
  };

  // Create the plant in the database.
  await db.create(newPlant);
  return presentPlant(newPlant);
};

// Deletes a plant by its ID.
exports.deletePlant = (id, userId) => db.deleteById(id, userId);

// Updates the last watered date for a plant and returns the updated plant data.
exports.waterPlant = async (id, userId) => {
  const success = await db.updateWatering(id, new Date().toISOString(), userId);
  if (success) return presentPlant(await db.findById(id, userId));
  return null;
};

// Fetches AI-generated care tips for a specific plant and season.
exports.getTips = async (name, season) => {
  return await aiService.getCareTips(name, season || "summer");
};
