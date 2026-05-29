const express = require("express");
const router = express.Router();
const controller = require("../controllers/plantController");
const plantBookController = require("../controllers/plantBookController");
const aiService = require("../services/aiService");
const { requireAuth } = require("../middleware/auth");
const {
  chatBodySchema,
  chatHistorySchema,
  parseJsonField,
  sendValidationError,
} = require("../validation/requestSchemas");

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
    const body = chatBodySchema.parse(req.body || {});
    const message = body.message;
    const imageFile = req.file;
    const history =
      parseJsonField(body.history, chatHistorySchema, "history") || [];

    const reply = await aiService.chatWithBot(message, imageFile, history);

    res.json({ reply });
  } catch (error) {
    if (sendValidationError(res, error)) return;
    console.error("Chat Route Error:", error);
    res.status(500).json({ reply: "Fehler im System 🤖💥" });
  }
});

module.exports = router;
