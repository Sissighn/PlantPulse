const express = require("express");
const router = express.Router();
const controller = require("../controllers/plantController");
const aiService = require("../services/aiService");

router.get("/plants", controller.getPlants);
router.post("/plants", controller.createPlant);
router.delete("/plants/:id", controller.removePlant);
router.post("/water/:id", controller.waterPlant);
router.get("/tips", controller.getAiTips);

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body; // Die Nachricht vom User (aus PlantAssistant)

    const reply = await aiService.chatWithBot(message);

    res.json({ reply });
  } catch (error) {
    console.error("Chat Route Error:", error);
    res.status(500).json({ reply: "Fehler im System 🤖💥" });
  }
});

module.exports = router;
