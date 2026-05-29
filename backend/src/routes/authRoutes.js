const express = require("express");
const controller = require("../controllers/authController");
const { createRateLimit } = require("../middleware/rateLimit");
const { validateRequest } = require("../middleware/validateRequest");
const {
  authLoginSchema,
  authRegisterSchema,
  emptyBodySchema,
} = require("../validation/requestSchemas");

const router = express.Router();
const authLimit = createRateLimit({
  max: 10,
  message: "Too many authentication attempts. Try again later.",
  windowMs: 15 * 60 * 1000,
});

router.get("/session", controller.getSession);
router.post(
  "/register",
  authLimit,
  validateRequest({ body: authRegisterSchema }),
  controller.register
);
router.post(
  "/login",
  authLimit,
  validateRequest({ body: authLoginSchema }),
  controller.login
);
router.post(
  "/guest",
  authLimit,
  validateRequest({ body: emptyBodySchema }),
  controller.createGuest
);
router.post(
  "/logout",
  validateRequest({ body: emptyBodySchema }),
  controller.logout
);

module.exports = router;
