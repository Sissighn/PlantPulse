const express = require("express");
const router = express.Router();
const controller = require("../controllers/plantController");

router.get("/plants", controller.getPlants);
router.post("/plants", controller.createPlant);
router.delete("/plants/:id", controller.removePlant);
router.post("/water/:id", controller.waterPlant);
router.get("/tips", controller.getAiTips);

module.exports = router;
