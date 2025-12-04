const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

let plants = [
  {
    id: "1",
    name: "Monstera",
    type: "leaf",
    baseInterval: 7,
    lastWatered: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Kaktus",
    type: "cactus",
    baseInterval: 14,
    lastWatered: new Date().toISOString(),
  },
];

app.get("/api/plants", (req, res) => {
  res.json({ plants });
});

app.post("/api/plants", (req, res) => {
  const { name, type, baseInterval } = req.body;
  if (!name) return res.status(400).json({ message: "Name fehlt" });

  const newPlant = {
    id: crypto.randomUUID(),
    name,
    type: type || "leaf",
    baseInterval: parseInt(baseInterval) || 7,
    lastWatered: new Date().toISOString(),
  };

  plants.push(newPlant);
  res.status(201).json(newPlant);
});

app.delete("/api/plants/:id", (req, res) => {
  const { id } = req.params;
  plants = plants.filter((p) => p.id !== id);
  res.json({ message: "Gelöscht" });
});

app.post("/api/water/:id", (req, res) => {
  const { id } = req.params;
  const plant = plants.find((p) => p.id === id);
  if (plant) {
    plant.lastWatered = new Date().toISOString();
    res.json(plant);
  } else {
    res.status(404).json({ message: "Nicht gefunden" });
  }
});

app.listen(PORT, () => {
  console.log(`🌱 Backend läuft auf http://localhost:${PORT}`);
});
