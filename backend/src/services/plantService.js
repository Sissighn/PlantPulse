const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const db = require("../db/database");
const aiService = require("./aiService");

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

// Fetches all plants and enriches them with a full image URL.
exports.getAllPlants = async () => {
  const rows = await db.findAll();
  return rows.map((p) => {
    const filename = p.image || findBestImageFor(p.name, p.type);
    // IMPORTANT: We provide a full URL path from the backend.
    const imageUrl = filename ? `/images/${filename}` : null;
    return { ...p, imageUrl };
  });
};

// Adds a new plant, suggests a watering interval via AI, and finds a matching image.
exports.addPlant = async (data) => {
  if (!data.name) throw new Error("Plant name is required.");

  // Suggest a watering interval with AI if not provided.
  let interval = data.baseInterval;
  if (!interval) {
    try {
      interval = (await aiService.suggestInterval(data.name)) || 7;
    } catch (e) {
      interval = 7;
    }
  }

  // Automatically find the best image for the new plant.
  const autoImage = findBestImageFor(data.name, data.type);

  // Construct the new plant object.
  const newPlant = {
    id: crypto.randomUUID(),
    name: data.name,
    type: data.type || "leaf",
    baseInterval: parseInt(interval),
    lastWatered: new Date().toISOString(),
    image: autoImage,
  };

  // Create the plant in the database.
  await db.create(newPlant);
  return {
    ...newPlant,
    imageUrl: autoImage ? `/images/${autoImage}` : null,
  };
};

// Deletes a plant by its ID.
exports.deletePlant = (id) => db.deleteById(id);

// Updates the last watered date for a plant and returns the updated plant data.
exports.waterPlant = async (id) => {
  const success = await db.updateWatering(id, new Date().toISOString());
  if (success) return await db.findById(id);
  return null;
};

// Fetches AI-generated care tips for a specific plant and season.
exports.getTips = async (name, season) => {
  return await aiService.getCareTips(name, season || "summer");
};
