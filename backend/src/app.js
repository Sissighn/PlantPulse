const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const path = require("path");
const authConfig = require("./config/auth");
const authRoutes = require("./routes/authRoutes");
const plantRoutes = require("./routes/plantRoutes");
const {
  optionalAuth,
  requireTrustedOrigin,
} = require("./middleware/auth");

const app = express();

app.disable("x-powered-by");
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || authConfig.allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
  })
);
app.use(bodyParser.json({ limit: "32kb" }));

app.use(
  "/images",
  express.static(path.join(__dirname, "..", "public", "plantImages"))
);
app.use(
  "/icons",
  express.static(path.join(__dirname, "..", "public", "icons"))
);

app.use("/api", requireTrustedOrigin, optionalAuth);
app.use("/api/auth", authRoutes);
app.use("/api", plantRoutes);

module.exports = app;
