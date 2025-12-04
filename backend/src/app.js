const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path"); // Wichtig
const plantRoutes = require("./routes/plantRoutes");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// --- BILDER FREIGEBEN ---
// Wir sagen Express: Wenn jemand "/images" aufruft, schau in "backend/public/plantImages"
app.use(
  "/images",
  express.static(path.join(__dirname, "..", "public", "plantImages"))
);

app.use("/api", plantRoutes);

module.exports = app;
