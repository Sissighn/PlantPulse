const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const db = require("../db/database");
const aiService = require("./aiService");

// KORREKTER PFAD: backend/src/services -> ../../public/plantImages
const imagesDir = path.join(__dirname, "..", "..", "public", "plantImages");

function normalizeString(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function findBestImageFor(name, type) {
  try {
    if (!fs.existsSync(imagesDir)) {
      console.warn(`⚠️ Ordner nicht gefunden: ${imagesDir}`);
      return null;
    }

    const files = fs.readdirSync(imagesDir);
    const nName = normalizeString(name);
    const nType = normalizeString(type);
    const map = new Map();

    for (const f of files) {
      if (f.startsWith(".")) continue;
      const base = path.parse(f).name;
      map.set(normalizeString(base), f);
    }

    // Priorität: 1. Name, 2. Typ, 3. Ähnlichkeit
    if (nName && map.has(nName)) return map.get(nName);
    if (nType && map.has(nType)) return map.get(nType);
    for (const [key, val] of map.entries()) {
      if (nName && key.includes(nName)) return val;
    }

    return null;
  } catch (e) {
    console.error("Fehler beim Bild-Suchen:", e.message);
    return null;
  }
}

exports.getAllPlants = async () => {
  const rows = await db.findAll();
  return rows.map((p) => {
    const filename = p.image || findBestImageFor(p.name, p.type);
    // WICHTIG: Wir liefern jetzt eine volle URL vom Backend
    const imageUrl = filename ? `/images/${filename}` : null;
    return { ...p, imageUrl };
  });
};

exports.addPlant = async (data) => {
  if (!data.name) throw new Error("Name fehlt");

  let interval = data.baseInterval;
  if (!interval) {
    try {
      interval = (await aiService.suggestInterval(data.name)) || 7;
    } catch (e) {
      interval = 7;
    }
  }

  const autoImage = findBestImageFor(data.name, data.type);

  const newPlant = {
    id: crypto.randomUUID(),
    name: data.name,
    type: data.type || "leaf",
    baseInterval: parseInt(interval),
    lastWatered: new Date().toISOString(),
    image: autoImage,
  };

  await db.create(newPlant);
  return {
    ...newPlant,
    imageUrl: autoImage ? `/images/${autoImage}` : null,
  };
};

exports.deletePlant = (id) => db.deleteById(id);

exports.waterPlant = async (id) => {
  const success = await db.updateWatering(id, new Date().toISOString());
  if (success) return await db.findById(id);
  return null;
};

exports.getTips = async (name, season) => {
  return await aiService.getCareTips(name, season || "Sommer");
};
