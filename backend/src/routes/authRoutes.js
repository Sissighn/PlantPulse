const express = require("express");
const controller = require("../controllers/authController");
const { createRateLimit } = require("../middleware/rateLimit");

const router = express.Router();
const authLimit = createRateLimit({
  max: 10,
  message: "Too many authentication attempts. Try again later.",
  windowMs: 15 * 60 * 1000,
});

router.get("/session", controller.getSession);
router.post("/register", authLimit, controller.register);
router.post("/login", authLimit, controller.login);
router.post("/guest", authLimit, controller.createGuest);
router.post("/logout", controller.logout);

module.exports = router;
