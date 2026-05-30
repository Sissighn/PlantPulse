const express = require("express");
const router = express.Router();
const controller = require("../controllers/plantController");
const plantBookController = require("../controllers/plantBookController");
const aiService = require("../services/aiService");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");
const { validateRequest } = require("../middleware/validateRequest");
const {
  chatBodySchema,
  chatHistorySchema,
  plantBookDetailSchema,
  plantBookParamSchema,
  plantBookSearchQuerySchema,
  plantCreateSchema,
  parseJsonField,
  tipsQuerySchema,
  uuidParamSchema,
} = require("../validation/requestSchemas");

const multer = require("multer");
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
  storage: multer.memoryStorage(),
});

router.use(requireAuth);
router.get("/plants", asyncHandler(controller.getPlants));
router.post(
  "/plants",
  validateRequest({ body: plantCreateSchema }),
  asyncHandler(controller.createPlant)
);
router.delete(
  "/plants/:id",
  validateRequest({ params: uuidParamSchema }),
  asyncHandler(controller.removePlant)
);
router.post(
  "/water/:id",
  validateRequest({ params: uuidParamSchema }),
  asyncHandler(controller.waterPlant)
);
router.get(
  "/tips",
  validateRequest({ query: tipsQuerySchema }),
  asyncHandler(controller.getAiTips)
);
router.get(
  "/plant-book/search",
  validateRequest({ query: plantBookSearchQuerySchema }),
  asyncHandler(plantBookController.searchPlants)
);
router.get(
  "/plant-book/:pid",
  validateRequest({
    params: plantBookParamSchema,
    query: plantBookDetailSchema,
  }),
  asyncHandler(plantBookController.getPlantDetail)
);

function validateChatHistory(req, res, next) {
  req.chatHistory =
    parseJsonField(req.body.history, chatHistorySchema, "history") || [];
  next();
}

router.post(
  "/chat",
  upload.single("image"),
  validateRequest({ body: chatBodySchema }),
  validateChatHistory,
  asyncHandler(async (req, res) => {
    const imageFile = req.file;

    const reply = await aiService.chatWithBot(
      req.body.message,
      imageFile,
      req.chatHistory
    );

    res.json({ reply });
  })
);

module.exports = router;
