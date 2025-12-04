// Simulierter Speicher
let plants = [
  {
    id: "1",
    name: "Monstera",
    type: "leaf",
    baseInterval: 7,
    lastWatered: new Date().toISOString(),
    image: "monstra.png",
  },
  {
    id: "2",
    name: "Kaktus",
    type: "cactus",
    baseInterval: 14,
    lastWatered: new Date().toISOString(),
    image: "yucca.png",
  },
];

module.exports = {
  findAll: () => plants,
  findById: (id) => plants.find((p) => p.id === id),
  create: (plant) => plants.push(plant),
  deleteById: (id) => {
    const initialLength = plants.length;
    plants = plants.filter((p) => p.id !== id);
    return plants.length !== initialLength; // True wenn gelöscht wurde
  },
  update: (id, updates) => {
    const index = plants.findIndex((p) => p.id === id);
    if (index !== -1) {
      plants[index] = { ...plants[index], ...updates };
      return plants[index];
    }
    return null;
  },
};
