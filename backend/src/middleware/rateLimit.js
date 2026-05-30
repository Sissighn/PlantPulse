const { rateLimit } = require("express-rate-limit");

function createRateLimit({ max, message, windowMs }) {
  return rateLimit({
    legacyHeaders: false,
    limit: max,
    message: { message },
    standardHeaders: "draft-8",
    windowMs,
  });
}

const apiLimit = createRateLimit({
  max: 300,
  message: "Too many API requests. Try again later.",
  windowMs: 15 * 60 * 1000,
});

const aiLimit = createRateLimit({
  max: 20,
  message: "Too many AI requests. Try again later.",
  windowMs: 15 * 60 * 1000,
});

module.exports = {
  aiLimit,
  apiLimit,
  createRateLimit,
};
