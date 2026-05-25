const express = require("express");
const router = express.Router();
const controller = require("../controllers/plantController");
const plantBookController = require("../controllers/plantBookController");
const aiService = require("../services/aiService");
const { requireAuth } = require("../middleware/auth");

const multer = require("multer");
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
  storage: multer.memoryStorage(),
});

router.use(requireAuth);
router.get("/plants", controller.getPlants);
router.post("/plants", controller.createPlant);
router.delete("/plants/:id", controller.removePlant);
router.post("/water/:id", controller.waterPlant);
router.get("/tips", controller.getAiTips);
router.get("/plant-book/search", plantBookController.searchPlants);
router.get("/plant-book/:pid", plantBookController.getPlantDetail);

router.post("/chat", upload.single("image"), async (req, res) => {
  try {
    const message = req.body.message || "";
    const imageFile = req.file;

    let history = [];
    if (req.body.history) {
      try {
        history = JSON.parse(req.body.history);
      } catch (e) {
        console.error("Fehler beim Parsen der History", e);
      }
    }

    const reply = await aiService.chatWithBot(message, imageFile, history);

    res.json({ reply });
  } catch (error) {
    console.error("Chat Route Error:", error);
    res.status(500).json({ reply: "Fehler im System 🤖💥" });
  }
});

module.exports = router;
