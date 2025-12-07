const express = require("express");
const router = express.Router();
const controller = require("../controllers/plantController");
const aiService = require("../services/aiService");

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.get("/plants", controller.getPlants);
router.post("/plants", controller.createPlant);
router.delete("/plants/:id", controller.removePlant);
router.post("/water/:id", controller.waterPlant);
router.get("/tips", controller.getAiTips);

router.post("/chat", upload.single("image"), async (req, res) => {
  try {
    const message = req.body.message || ""; // Textnachricht
    const imageFile = req.file; // Das hochgeladene Bild (falls vorhanden)

    const reply = await aiService.chatWithBot(message, imageFile);

    res.json({ reply });
  } catch (error) {
    console.error("Chat Route Error:", error);
    res.status(500).json({ reply: "Fehler im System 🤖💥" });
  }
});

module.exports = router;
