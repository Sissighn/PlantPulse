const express = require("express");
const router = express.Router();
const controller = require("../controllers/plantController");
const plantBookController = require("../controllers/plantBookController");
const aiService = require("../services/aiService");
const { requireAuth } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validateRequest");
const {
  chatBodySchema,
  chatHistorySchema,
  plantBookDetailSchema,
  plantBookParamSchema,
  plantBookSearchQuerySchema,
  plantCreateSchema,
  parseJsonField,
  sendValidationError,
  tipsQuerySchema,
  uuidParamSchema,
} = require("../validation/requestSchemas");

const multer = require("multer");
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
  storage: multer.memoryStorage(),
});

router.use(requireAuth);
router.get("/plants", controller.getPlants);
router.post(
  "/plants",
  validateRequest({ body: plantCreateSchema }),
  controller.createPlant
);
router.delete(
  "/plants/:id",
  validateRequest({ params: uuidParamSchema }),
  controller.removePlant
);
router.post(
  "/water/:id",
  validateRequest({ params: uuidParamSchema }),
  controller.waterPlant
);
router.get(
  "/tips",
  validateRequest({ query: tipsQuerySchema }),
  controller.getAiTips
);
router.get(
  "/plant-book/search",
  validateRequest({ query: plantBookSearchQuerySchema }),
  plantBookController.searchPlants
);
router.get(
  "/plant-book/:pid",
  validateRequest({
    params: plantBookParamSchema,
    query: plantBookDetailSchema,
  }),
  plantBookController.getPlantDetail
);

function validateChatHistory(req, res, next) {
  try {
    req.chatHistory =
      parseJsonField(req.body.history, chatHistorySchema, "history") || [];
    next();
  } catch (error) {
    if (sendValidationError(res, error)) return;
    next(error);
  }
}

router.post(
  "/chat",
  upload.single("image"),
  validateRequest({ body: chatBodySchema }),
  validateChatHistory,
  async (req, res) => {
    try {
      const imageFile = req.file;

      const reply = await aiService.chatWithBot(
        req.body.message,
        imageFile,
        req.chatHistory
      );

      res.json({ reply });
    } catch (error) {
      console.error("Chat Route Error:", error);
      res.status(500).json({ reply: "Fehler im System 🤖💥" });
    }
  }
);

module.exports = router;
